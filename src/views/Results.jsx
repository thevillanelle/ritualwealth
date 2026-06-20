'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { QUIZZES } from '../data/quizzes'
import { supabase } from '../lib/supabase/client'
import { useAuthStore } from '../stores/useAuthStore'

const NEXT_QUIZ = {
  fire_type: 'career',
  career:    'home',
  home:      'creative',
  creative:  'risk',
  risk:      null,
}

const FIRE_TYPE_LABELS = {
  lean_fire:    'Lean FIRE',
  regular_fire: 'FIRE',
  fat_fire:     'Fat FIRE',
  barista_fire: 'Barista FIRE',
  coast_fire:   'Coast FIRE',
}

const RISK_LABELS = {
  conservative: 'Conservative',
  moderate:     'Moderate',
  growth:       'Growth',
  aggressive:   'Aggressive',
}

function fmt(n) {
  if (!n) return null
  return '$' + Number(n).toLocaleString()
}

export default function Results() {
  const { slug } = useParams()
  const router = useRouter()
  const { user, signInWithGoogle } = useAuthStore()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)

  const quiz = QUIZZES.find(q => q.slug === slug)
  const nextSlug = NEXT_QUIZ[slug]
  const nextQuiz = nextSlug ? QUIZZES.find(q => q.slug === nextSlug) : null

  useEffect(() => {
    if (!quiz) { router.push('/'); return }
    // Fetch the most recent result for this quiz from Supabase
    if (!user) {
      const cached = localStorage.getItem(`vile_fire_result_${slug}`)
      setResult(cached ? JSON.parse(cached).result : {})
      setLoading(false)
      return
    }
    supabase
      .from('fire_quiz_results')
      .select('result')
      .eq('user_id', user.id)
      .eq('quiz_slug', slug)
      .order('created_at', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        setResult(data?.[0]?.result ?? {})
        setLoading(false)
      })
  }, [slug, user])

  if (!quiz || loading) return null

  return (
    <div className="page">
      <div style={{ maxWidth: '640px', margin: '0 auto', padding: 'clamp(4rem,8vw,6rem) 1.5rem' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <p className="label" style={{ marginBottom: '1rem', color: quiz.color }}>{quiz.slug.replace('_', ' ')}</p>

          {/* FIRE Type result */}
          {slug === 'fire_type' && result?.fire_type && (
            <>
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.05, marginBottom: '0.5rem' }}>
                {FIRE_TYPE_LABELS[result.fire_type]}
              </h1>
              <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#C8A86B', marginBottom: '2rem' }}>
                Your target: {fmt(result.number)}
              </p>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', lineHeight: 1.7 }}>{result.desc}</p>
              </div>
            </>
          )}

          {/* Risk result */}
          {slug === 'risk' && result?.risk_profile && (
            <>
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.05, marginBottom: '0.5rem' }}>
                {RISK_LABELS[result.risk_profile]}
              </h1>
              <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#6AAD8A', marginBottom: '2rem' }}>
                {result.allocation}
              </p>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', lineHeight: 1.7 }}>{result.desc}</p>
              </div>
            </>
          )}

          {/* Generic result (career, home, creative) */}
          {!['fire_type', 'risk'].includes(slug) && (
            <>
              <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.1, marginBottom: '2rem' }}>
                Quiz complete.
              </h1>
              <div className="card" style={{ marginBottom: '1.5rem' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#8A9E96', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>YOUR ANSWERS RECORDED</p>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', lineHeight: 1.7 }}>
                  Your {quiz.title.toLowerCase()} answers have been saved. Once you complete all 5 quizzes, your full FIRE plan will be assembled.
                </p>
              </div>
            </>
          )}

          {/* Guest CTA */}
          {!user && (
            <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(200,168,107,0.08)', border: '1px solid rgba(200,168,107,0.3)' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#C8A86B', letterSpacing: '0.1em', marginBottom: '0.5rem' }}>SAVE YOUR RESULTS</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#C8BFB0', lineHeight: 1.6, marginBottom: '1rem' }}>
                Sign in to save your FIRE quiz results and build your complete plan.
              </p>
              <button
                onClick={() => signInWithGoogle()}
                className="btn-primary"
                style={{ width: '100%' }}
              >
                Continue with Google ✦
              </button>
            </div>
          )}

          {/* Navigation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            {nextQuiz ? (
              <Link href={`/quiz/${nextQuiz.slug}`}>
                <button className="btn-primary" style={{ width: '100%', background: nextQuiz.color }}>
                  Next: {nextQuiz.title} →
                </button>
              </Link>
            ) : (
              <Link href="/plan">
                <button className="btn-primary" style={{ width: '100%' }}>
                  See my complete FIRE plan ✦
                </button>
              </Link>
            )}
            <Link href="/">
              <button className="btn-ghost" style={{ width: '100%' }}>
                Back to all quizzes
              </button>
            </Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}

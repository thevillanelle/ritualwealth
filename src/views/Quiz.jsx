'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZZES, deriveFireType, deriveRiskProfile, FIRE_TYPE_META, RISK_META } from '../data/quizzes'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase/client'

export default function Quiz() {
  const { slug } = useParams()
  const router = useRouter()
  const { user } = useAuthStore()

  const quiz = QUIZZES.find(q => q.slug === slug)

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving]   = useState(false)

  useEffect(() => { setStep(0); setAnswers({}) }, [slug])

  if (!quiz) {
    router.push('/')
    return null
  }

  const q = quiz.questions[step]
  const total = quiz.questions.length
  const isLast = step === total - 1
  const progress = ((step) / total) * 100

  const answer = answers[q.id]
  const isOptional = q.optional === true
  const canAdvance = isOptional
    ? true
    : answer !== undefined && (Array.isArray(answer) ? answer.length > 0 : String(answer).trim() !== '')

  const select = (value) => {
    if (q.type === 'multi') {
      setAnswers(prev => {
        const cur = prev[q.id] ?? []
        const next = cur.includes(value) ? cur.filter(v => v !== value) : [...cur, value]
        return { ...prev, [q.id]: next }
      })
    } else {
      setAnswers(prev => ({ ...prev, [q.id]: value }))
    }
  }

  const saveAndFinish = async () => {
    setSaving(true)

    let result = {}
    if (slug === 'fire_type') {
      const type = deriveFireType(answers)
      result = { fire_type: type, ...FIRE_TYPE_META[type] }
    } else if (slug === 'risk') {
      const profile = deriveRiskProfile(answers)
      result = { risk_profile: profile, ...RISK_META[profile] }
    }

    if (user) {
      await supabase.from('fire_quiz_results').insert({
        user_id: user.id,
        quiz_slug: slug,
        answers,
        result,
      })

      if (slug === 'fire_type' && result.fire_type) {
        await supabase.from('user_fire_plans').upsert({
          user_id: user.id,
          fire_type: result.fire_type,
          target_number: result.number,
          source: 'quiz',
          updated_at: new Date().toISOString(),
        })
      }

      await supabase.rpc('add_points', { p_points: 10, p_reason: 'quiz_completed' })
      await supabase.rpc('award_badge', { p_badge_slug: 'quiz_taker', p_context: { quiz_slug: slug } })
      const { data: allResults } = await supabase
        .from('fire_quiz_results')
        .select('quiz_slug')
        .eq('user_id', user.id)
      const completedSlugs = new Set((allResults || []).map(r => r.quiz_slug))
      if (['fire_type','career','home','creative','risk'].every(s => completedSlugs.has(s))) {
        await supabase.rpc('award_badge', { p_badge_slug: 'fire_mapped' })
        await supabase.rpc('add_points', { p_points: 40, p_reason: 'milestone' })
      }

      await supabase.from('activity_feed').insert({
        user_id: user.id,
        actor_name: user.user_metadata?.full_name || user.email,
        event_type: 'quiz_completed',
        payload: {
          quiz_slug: slug,
          quiz_name: quiz.title,
          ...(result.fire_type ? { fire_type: result.fire_type } : {}),
          ...(result.risk_profile ? { risk_profile: result.risk_profile } : {}),
        },
        visibility: 'friends',
      })
    }

    setSaving(false)
    router.push(`/results/${slug}`)
  }

  const advance = () => {
    if (isLast) {
      saveAndFinish()
    } else {
      setStep(s => s + 1)
    }
  }

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      {/* Progress bar */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '2px', background: '#1C2320', zIndex: 50 }}>
        <div style={{ height: '100%', width: `${progress}%`, background: quiz.color, transition: 'width 0.3s ease' }} />
      </div>

      {/* Header */}
      <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1C2320' }}>
        <button onClick={() => step > 0 ? setStep(s => s - 1) : router.push('/')}
          style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#8A9E96', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>
          ← {step === 0 ? 'back' : 'previous'}
        </button>
        <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4A6A5A', letterSpacing: '0.15em' }}>
          {step + 1} / {total}
        </span>
        <button onClick={() => router.push('/')}
          style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: '#3a3028', background: 'none', border: 'none', cursor: 'pointer' }}>
          ✕ exit
        </button>
      </div>

      {/* Question */}
      <div style={{ flex: 1, maxWidth: '640px', margin: '0 auto', width: '100%', padding: '3rem 1.5rem 2rem' }}>
        <AnimatePresence mode="wait">
          <motion.div key={step}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}>

            <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.3, marginBottom: '2.5rem' }}>
              {q.question}
            </h2>

            {(q.type === 'text' || q.type === 'currency') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {q.type === 'currency' && (
                    <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: '#4A6A5A' }}>$</span>
                  )}
                  <input
                    type={q.type === 'currency' ? 'number' : 'text'}
                    placeholder={q.placeholder ?? ''}
                    value={answers[q.id] ?? ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                    autoFocus
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      borderBottom: `1px solid ${quiz.color}44`,
                      padding: '0.75rem 0',
                      color: '#F0EDE8',
                      fontFamily: q.type === 'currency' ? '"Playfair Display", serif' : '"DM Sans", sans-serif',
                      fontSize: q.type === 'currency' ? '2rem' : '1.1rem',
                      outline: 'none',
                      width: '100%',
                    }}
                  />
                </div>
                {q.hint && (
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', marginTop: '0.75rem', letterSpacing: '0.08em' }}>
                    {q.hint}
                  </p>
                )}
                {q.optional && (
                  <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#3A4A40', marginTop: '0.5rem', letterSpacing: '0.08em' }}>
                    optional — press Next to skip
                  </p>
                )}
              </div>
            )}

            {(q.type === 'single' || q.type === 'multi') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {q.options.map(opt => {
                  const isSelected = q.type === 'multi'
                    ? (answers[q.id] ?? []).includes(opt.value)
                    : answers[q.id] === opt.value
                  return (
                    <button key={opt.value}
                      className={`option-btn ${isSelected ? 'selected' : ''}`}
                      onClick={() => select(opt.value)}>
                      <span style={{ color: isSelected ? quiz.color : 'inherit' }}>
                        {isSelected ? '✦ ' : '○ '}
                      </span>
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            )}

            {q.type === 'multi' && (
              <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', marginTop: '0.75rem', letterSpacing: '0.1em' }}>
                select all that apply
              </p>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer CTA */}
      <div style={{ padding: '1.5rem', borderTop: '1px solid #1C2320', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn-primary" onClick={advance} disabled={!canAdvance || saving}
          style={{ background: quiz.color, minWidth: '160px' }}>
          {saving ? 'Saving…' : isLast ? 'See results ✦' : 'Next →'}
        </button>
      </div>

    </div>
  )
}

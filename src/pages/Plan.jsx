import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'
import { FIRE_TYPE_META, RISK_META } from '../data/quizzes'

const ATELIER_URL = import.meta.env.VITE_ATELIER_URL ?? 'https://atelier.ritualware.app'

function fmt(n) { return n ? '$' + Number(n).toLocaleString() : '—' }

export default function Plan() {
  const { user } = useAuthStore()
  const [quizResults, setQuizResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [pushed, setPushed] = useState(false)
  const [pushing, setPushing] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('fire_quiz_results').select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        // Keep only latest result per quiz slug
        const latest = {}
        ;(data ?? []).forEach(r => { if (!latest[r.quiz_slug]) latest[r.quiz_slug] = r })
        setQuizResults(Object.values(latest))
        setLoading(false)
      })
  }, [user])

  const getResult = (slug) => quizResults.find(r => r.quiz_slug === slug)?.result ?? {}

  const fireResult = getResult('fire_type')
  const riskResult = getResult('risk')
  const careerAnswers = quizResults.find(r => r.quiz_slug === 'career')?.answers ?? {}
  const homeAnswers   = quizResults.find(r => r.quiz_slug === 'home')?.answers ?? {}
  const creativeAnswers = quizResults.find(r => r.quiz_slug === 'creative')?.answers ?? {}

  const fireType = fireResult.fire_type
  const fireMeta = FIRE_TYPE_META[fireType]
  const riskProfile = riskResult.risk_profile
  const riskMeta = RISK_META[riskProfile]

  const pushToAtelier = async () => {
    if (!user) return
    setPushing(true)

    // Write fire plan
    if (fireType) {
      await supabase.from('user_fire_plans').upsert({
        user_id: user.id,
        fire_type: fireType,
        target_number: fireMeta?.number,
        source: 'quiz',
        updated_at: new Date().toISOString(),
      })
    }

    setPushing(false)
    setPushed(true)
  }

  if (!user) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: '#F0EDE8', marginBottom: '1.5rem' }}>Sign in to see your plan.</p>
        <Link to="/"><button className="btn-ghost">← Back</button></Link>
      </div>
    </div>
  )

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4A6A5A' }}>assembling your plan…</p>
    </div>
  )

  const completedSlugs = quizResults.map(r => r.quiz_slug)
  const allDone = ['fire_type', 'career', 'home', 'creative', 'risk'].every(s => completedSlugs.includes(s))

  return (
    <div className="page">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(4rem,8vw,6rem) 1.5rem' }}>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

          <p className="label" style={{ marginBottom: '1rem' }}>Your FIRE Plan</p>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.05, marginBottom: '3rem' }}>
            {fireType ? `${FIRE_TYPE_META[fireType]?.label}.` : 'Your plan.'}
          </h1>

          {/* FIRE Target */}
          {fireMeta && (
            <div className="card" style={{ marginBottom: '1.25rem', borderColor: '#C8A86B33' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>FIRE Target</p>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '2.5rem', color: '#C8A86B', marginBottom: '0.5rem' }}>{fmt(fireMeta.number)}</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#8A9E96', lineHeight: 1.7 }}>{fireMeta.desc}</p>
            </div>
          )}

          {/* Risk Profile */}
          {riskMeta && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Risk Profile</p>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', color: '#6AAD8A', marginBottom: '0.25rem' }}>{riskMeta.label}</p>
              <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4A6A5A', marginBottom: '0.5rem', letterSpacing: '0.05em' }}>{riskMeta.allocation}</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#8A9E96', lineHeight: 1.7 }}>{riskMeta.desc}</p>
            </div>
          )}

          {/* Career snapshot */}
          {careerAnswers.c3 && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Career Direction</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0' }}>
                Target: <span style={{ color: '#F0EDE8' }}>{careerAnswers.c8?.replace(/_/g, ' ')}</span>
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', marginTop: '0.4rem' }}>
                Direction: <span style={{ color: '#F0EDE8' }}>{careerAnswers.c3?.replace(/_/g, ' ')}</span>
              </p>
            </div>
          )}

          {/* Home snapshot */}
          {homeAnswers.h3 && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Home Plan</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0' }}>
                Location: <span style={{ color: '#F0EDE8' }}>{homeAnswers.h3?.replace(/_/g, ' ')}</span>
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', marginTop: '0.4rem' }}>
                Property: <span style={{ color: '#F0EDE8' }}>{homeAnswers.h4?.replace(/_/g, ' ')}</span>
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', marginTop: '0.4rem' }}>
                Price range: <span style={{ color: '#F0EDE8' }}>{homeAnswers.h5?.replace(/_/g, ' ')}</span>
              </p>
            </div>
          )}

          {/* Creative income */}
          {creativeAnswers.cr3 && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <p className="label" style={{ marginBottom: '0.75rem' }}>Creative Income Goal</p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0' }}>
                Target: <span style={{ color: '#F0EDE8' }}>{creativeAnswers.cr6?.replace(/_/g, ' ')}/month</span>
              </p>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#C8BFB0', marginTop: '0.4rem' }}>
                Strategy: <span style={{ color: '#F0EDE8' }}>{creativeAnswers.cr3?.replace(/_/g, ' ')}</span>
              </p>
            </div>
          )}

          {/* Missing quizzes */}
          {!allDone && (
            <div style={{ padding: '1.25rem', background: 'rgba(200,168,107,0.06)', border: '1px dashed #2A3530', borderRadius: '0.75rem', marginBottom: '1.5rem' }}>
              <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#C8A86B', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>COMPLETE YOUR PLAN</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {['fire_type', 'career', 'home', 'creative', 'risk'].filter(s => !completedSlugs.includes(s)).map(s => (
                  <Link key={s} to={`/quiz/${s}`}
                    style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4A6A5A', textDecoration: 'none', padding: '0.3rem 0.75rem', border: '1px solid #2A3530', borderRadius: '9999px', letterSpacing: '0.1em' }}>
                    {s.replace('_', ' ')} →
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Push to m'atelier */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '2rem' }}>
            {pushed ? (
              <a href={ATELIER_URL}>
                <button className="btn-primary" style={{ width: '100%' }}>
                  Open m'atelier →
                </button>
              </a>
            ) : (
              <button className="btn-primary" style={{ width: '100%' }} onClick={pushToAtelier} disabled={pushing}>
                {pushing ? 'Sending…' : 'Save plan to m\'atelier ✦'}
              </button>
            )}
            <Link to="/"><button className="btn-ghost" style={{ width: '100%' }}>Retake a quiz</button></Link>
          </div>

        </motion.div>
      </div>
    </div>
  )
}

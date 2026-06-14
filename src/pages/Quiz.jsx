import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZZES, deriveFireType, deriveRiskProfile, FIRE_TYPE_META, RISK_META } from '../data/quizzes'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'

export default function Quiz() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const quiz = QUIZZES.find(q => q.slug === slug)

  const [step, setStep]       = useState(0)
  const [answers, setAnswers] = useState({})
  const [saving, setSaving]   = useState(false)

  useEffect(() => { setStep(0); setAnswers({}) }, [slug])

  if (!quiz) {
    navigate('/')
    return null
  }

  const q = quiz.questions[step]
  const total = quiz.questions.length
  const isLast = step === total - 1
  const progress = ((step) / total) * 100

  const answer = answers[q.id]
  const canAdvance = answer !== undefined && (Array.isArray(answer) ? answer.length > 0 : true)

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

      // Auto-populate fire plan from fire_type quiz
      if (slug === 'fire_type' && result.fire_type) {
        await supabase.from('user_fire_plans').upsert({
          user_id: user.id,
          fire_type: result.fire_type,
          target_number: result.number,
          source: 'quiz',
          updated_at: new Date().toISOString(),
        })
      }
    }

    setSaving(false)
    navigate(`/results/${slug}`, { state: { answers, result, quiz } })
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
        <button onClick={() => step > 0 ? setStep(s => s - 1) : navigate('/')}
          style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#8A9E96', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.1em' }}>
          ← {step === 0 ? 'back' : 'previous'}
        </button>
        <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4A6A5A', letterSpacing: '0.15em' }}>
          {step + 1} / {total}
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em', color: quiz.color }}>
          {quiz.slug.replace('_', ' ')}
        </span>
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

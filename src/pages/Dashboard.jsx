import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'
import { FIRE_TYPE_META, RISK_META } from '../data/quizzes'

const ATELIER_URL = import.meta.env.VITE_ATELIER_URL ?? 'https://studio.ritualware.app'

const SLUGS = ['fire_type', 'career', 'home', 'creative', 'risk']

const FIRE_COLORS = {
  lean_fire:    '#7AB4C8',
  regular_fire: '#6AAD8A',
  fat_fire:     '#C8A86B',
  barista_fire: '#C4717A',
  coast_fire:   '#A89BC4',
}

function fmt(n) { return n ? '$' + Number(n).toLocaleString() : null }

export default function Dashboard() {
  const { user, signInWithGoogle } = useAuthStore()
  const [results, setResults] = useState({})
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('fire_quiz_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error('fire_quiz_results fetch error:', error)
        const latest = {}
        ;(data ?? []).forEach(r => { if (!latest[r.quiz_slug]) latest[r.quiz_slug] = r })
        setResults(latest)
        setLoading(false)
      })
      .catch(err => {
        console.error('Dashboard fetch failed:', err)
        setLoading(false)
      })
  }, [user])

  if (!user || loading) return null

  const fireResult  = results['fire_type']?.result ?? {}
  const riskResult  = results['risk']?.result ?? {}
  const careerAns   = results['career']?.answers ?? {}
  const homeAns     = results['home']?.answers ?? {}
  const creativeAns = results['creative']?.answers ?? {}

  const fireType  = fireResult.fire_type
  const fireMeta  = FIRE_TYPE_META[fireType]
  const fireColor = FIRE_COLORS[fireType] ?? '#C8A86B'
  const riskMeta  = RISK_META[riskResult.risk_profile]
  const completed = SLUGS.filter(s => results[s])
  const allDone   = completed.length === 5

  if (completed.length === 0) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        gridColumn: 'span 2',
        background: `linear-gradient(135deg, #1A1710 0%, #0E0C08 100%)`,
        border: `1px solid ${fireColor}33`,
        borderRadius: '1.25rem',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Glow */}
      <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '200px', height: '200px', borderRadius: '50%', background: `radial-gradient(circle, ${fireColor}18 0%, transparent 70%)`, pointerEvents: 'none' }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: fireColor, marginBottom: '0.4rem' }}>YOUR PLAN</p>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.1 }}>
            {fireMeta ? fireMeta.label : 'Your FIRE plan'}
            {fireMeta?.number && (
              <span style={{ fontStyle: 'italic', color: fireColor }}> · {fmt(fireMeta.number)}</span>
            )}
          </h2>
        </div>
        <Link to="/plan" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <button className="btn-ghost" style={{ fontSize: '0.75rem', padding: '0.5rem 1rem' }}>
            View full plan →
          </button>
        </Link>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {riskMeta && (
          <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#5a5048', marginBottom: '0.3rem' }}>RISK</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.95rem', color: '#6AAD8A' }}>{riskMeta.label}</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', marginTop: '0.2rem' }}>{riskMeta.allocation}</p>
          </div>
        )}
        {careerAns.c8 && (
          <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#5a5048', marginBottom: '0.3rem' }}>CAREER TARGET</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.95rem', color: '#F0EDE8' }}>{String(careerAns.c8).replace(/_/g, ' ')}</p>
          </div>
        )}
        {homeAns.h3 && (
          <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#5a5048', marginBottom: '0.3rem' }}>LOCATION</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.95rem', color: '#F0EDE8' }}>{String(homeAns.h3).replace(/_/g, ' ')}</p>
          </div>
        )}
        {creativeAns.cr6 && (
          <div style={{ padding: '0.875rem', background: 'rgba(255,255,255,0.04)', borderRadius: '0.75rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.15em', color: '#5a5048', marginBottom: '0.3rem' }}>CREATIVE INCOME</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.95rem', color: '#F0EDE8' }}>{String(creativeAns.cr6).replace(/_/g, ' ')}/mo target</p>
          </div>
        )}
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {SLUGS.map(s => (
            <div key={s} style={{ width: '28px', height: '4px', borderRadius: '2px', background: results[s] ? fireColor : '#2A3530' }} />
          ))}
        </div>
        <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', letterSpacing: '0.1em' }}>
          {completed.length}/5 quizzes complete
        </p>
        {!allDone && (
          <Link to={`/quiz/${SLUGS.find(s => !results[s])}`} style={{ textDecoration: 'none', marginLeft: 'auto' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: fireColor, letterSpacing: '0.1em', cursor: 'pointer' }}>
              continue →
            </span>
          </Link>
        )}
      </div>
    </motion.div>
  )
}

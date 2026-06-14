import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'
import { FIRE_TYPE_META, RISK_META } from '../data/quizzes'

function fmt(n) { return n ? '$' + Number(n).toLocaleString() : '—' }

const FIRE_COLORS = {
  lean_fire:    '#7AB4C8',
  regular_fire: '#6AAD8A',
  fat_fire:     '#C8A86B',
  barista_fire: '#C4717A',
  coast_fire:   '#A89BC4',
}

const CAREER_LABELS = {
  under_100k: 'Under $100k',
  '100_150k': '$100k–$150k',
  '150_200k': '$150k–$200k',
  over_200k: 'Over $200k',
  variable: 'Variable / equity',
}

const HOME_LOCATION_LABELS = {
  current_city: 'My current city',
  different_us: 'Different US city',
  international: 'International',
  multi: 'Multiple places',
  unsure: 'TBD',
}

const HOME_PROPERTY_LABELS = {
  condo: 'Condo / co-op',
  townhouse: 'Townhouse',
  single_family: 'Single-family home',
  multi_family: 'Multi-family',
  land: 'Land / custom build',
}

const HOME_PRICE_LABELS = {
  under_250k: 'Under $250k',
  '250_500k': '$250k–$500k',
  '500k_1m': '$500k–$1M',
  over_1m: '$1M+',
  unsure: 'TBD',
}

const HOME_TIMELINE_LABELS = {
  now: 'Within 12 months',
  '1_3': '1–3 years',
  '3_5': '3–5 years',
  over_5: '5+ years',
  flexible: 'When conditions are right',
}

const CREATIVE_GOAL_LABELS = {
  cover_basics: 'Cover basics so salary goes straight to investments',
  accelerate: 'Accelerate FIRE timeline by 2–5 years',
  replace: 'Eventually replace job income entirely',
  legacy: 'Build something that earns after I stop working',
}

const CREATIVE_MONTHLY_LABELS = {
  under_1k: 'Under $1,000/mo',
  '1_3k': '$1,000–$3,000/mo',
  '3_10k': '$3,000–$10,000/mo',
  over_10k: '$10,000+/mo',
}

const CAREER_DIRECTION_LABELS = {
  same_more: 'Same field, higher comp',
  pivot: 'Full pivot',
  build: 'Building something of my own',
  international: 'International market',
  portfolio: 'Portfolio of income streams',
}

function Section({ label, color = '#C8A86B', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: '#0E0C08',
        border: `1px solid ${color}22`,
        borderRadius: '1.25rem',
        padding: '2rem',
        marginBottom: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '120px', height: '120px', borderRadius: '50%', background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`, pointerEvents: 'none' }} />
      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color, marginBottom: '1.25rem' }}>{label}</p>
      {children}
    </motion.div>
  )
}

function Row({ label, value }) {
  if (!value) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '0.6rem 0', borderBottom: '1px solid #1C2320' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', letterSpacing: '0.08em' }}>{label}</p>
      <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '0.95rem', color: '#F0EDE8', textAlign: 'right', maxWidth: '55%' }}>{value}</p>
    </div>
  )
}

export default function Plan() {
  const { user } = useAuthStore()
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('fire_quiz_results')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const latest = {}
        ;(data ?? []).forEach(r => { if (!latest[r.quiz_slug]) latest[r.quiz_slug] = r })
        setResults(latest)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', color: '#F0EDE8', marginBottom: '1.5rem' }}>Sign in to see your plan.</p>
        <Link to="/"><button className="btn-ghost">← back</button></Link>
      </div>
    </div>
  )

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4A6A5A' }}>loading your plan…</p>
    </div>
  )

  const fireResult     = results['fire_type']?.result ?? {}
  const riskResult     = results['risk']?.result ?? {}
  const careerAnswers  = results['career']?.answers ?? {}
  const homeAnswers    = results['home']?.answers ?? {}
  const creativeAnswers = results['creative']?.answers ?? {}

  const fireType  = fireResult.fire_type
  const fireMeta  = FIRE_TYPE_META[fireType]
  const fireColor = FIRE_COLORS[fireType] ?? '#C8A86B'
  const riskMeta  = RISK_META[riskResult.risk_profile]

  const SLUGS = ['fire_type', 'career', 'home', 'creative', 'risk']
  const completed = SLUGS.filter(s => results[s])
  const missing   = SLUGS.filter(s => !results[s])

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) 1.5rem' }}>

        {/* Back */}
        <Link to="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4A6A5A', letterSpacing: '0.1em', marginBottom: '3rem', cursor: 'pointer' }}>← back</p>
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: fireColor, marginBottom: '1rem' }}>MY RITUAL WEALTH PLAN</p>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.05, marginBottom: '1rem' }}>
            {fireMeta ? fireMeta.label : 'Your FIRE Plan'}
            {fireMeta?.number && (
              <span style={{ fontStyle: 'italic', color: fireColor }}> · {fmt(fireMeta.number)}</span>
            )}
          </h1>
          {fireMeta?.desc && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#8A9E96', lineHeight: 1.7, maxWidth: '520px' }}>
              {fireMeta.desc}
            </p>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {SLUGS.map(s => (
              <div key={s} style={{ width: '36px', height: '4px', borderRadius: '2px', background: results[s] ? fireColor : '#1C2320' }} />
            ))}
          </div>
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', letterSpacing: '0.1em' }}>
            {completed.length}/5 quizzes complete
          </p>
        </motion.div>

        {/* ── FIRE TARGET ─────────────────────────────────────────────────── */}
        {fireMeta && (
          <Section label="FIRE TARGET" color={fireColor}>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem,5vw,3rem)', color: fireColor, marginBottom: '0.25rem' }}>
              {fmt(fireMeta.number)}
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', letterSpacing: '0.1em', marginBottom: '1.5rem' }}>
              target · {fireType?.replace('_', ' ').toUpperCase()}
            </p>
            <Row label="FIRE TYPE" value={fireMeta.label} />
            <Row label="ANNUAL SPENDING (RETIREMENT)" value="$80,000" />
            <Row label="WITHDRAWAL RATE" value="4% rule" />
            <Row label="LEGACY GOAL" value="Moderate — leave something, not the whole point" />
          </Section>
        )}

        {/* ── RISK PROFILE ────────────────────────────────────────────────── */}
        {riskMeta && (
          <Section label="RISK PROFILE" color="#6AAD8A">
            <Row label="PROFILE" value={riskMeta.label} />
            <Row label="ALLOCATION" value={riskMeta.allocation} />
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#8A9E96', lineHeight: 1.7, marginTop: '1rem' }}>
              {riskMeta.desc}
            </p>
          </Section>
        )}

        {/* ── CAREER PATH ─────────────────────────────────────────────────── */}
        {Object.keys(careerAnswers).length > 0 && (
          <Section label="CAREER PATH" color="#A89BC4">
            <Row label="DIRECTION" value={CAREER_DIRECTION_LABELS[careerAnswers.c3]} />
            <Row label="3-YEAR INCOME TARGET" value={CAREER_LABELS[careerAnswers.c8]} />
            <Row label="RELOCATION" value={
              careerAnswers.c5 === 'yes_international' ? 'Yes — international especially' :
              careerAnswers.c5 === 'yes_us' ? 'Yes — within the US' :
              careerAnswers.c5 === 'yes_anywhere' ? 'Yes — anywhere' : 'No'
            } />
            <Row label="LEADERSHIP" value={
              careerAnswers.c6 === 'own_team' ? 'Build my own team' :
              careerAnswers.c6 === 'love' ? 'Love it' :
              careerAnswers.c6 === 'open' ? 'Open to it for the right comp' : 'Prefer IC'
            } />
            {careerAnswers.c7 && (
              <Row label="STRONGEST ASSETS" value={
                (Array.isArray(careerAnswers.c7) ? careerAnswers.c7 : [careerAnswers.c7])
                  .map(s => s.replace(/_/g, ' ')).join(', ')
              } />
            )}
          </Section>
        )}

        {/* ── HOME PLAN ───────────────────────────────────────────────────── */}
        {Object.keys(homeAnswers).length > 0 && (
          <Section label="HOME PLAN" color="#C4717A">
            <Row label="LOCATION STRATEGY" value={HOME_LOCATION_LABELS[homeAnswers.h3]} />
            <Row label="PROPERTY TYPE" value={HOME_PROPERTY_LABELS[homeAnswers.h4]} />
            <Row label="PRICE RANGE" value={HOME_PRICE_LABELS[homeAnswers.h5]} />
            <Row label="PURCHASE TIMELINE" value={HOME_TIMELINE_LABELS[homeAnswers.h7]} />
            <Row label="ROLE IN FIRE PLAN" value={
              homeAnswers.h2 === 'both' ? 'Primary home + investment properties' :
              homeAnswers.h2 === 'investment' ? 'Investment / rental income' :
              homeAnswers.h2 === 'primary_home' ? 'Primary home only' : 'Renting, investing the difference'
            } />
            {homeAnswers.h8 && (
              <Row label="PRIORITIES" value={
                (Array.isArray(homeAnswers.h8) ? homeAnswers.h8 : [homeAnswers.h8])
                  .map(s => s.replace(/_/g, ' ')).join(', ')
              } />
            )}
          </Section>
        )}

        {/* ── CREATIVE INCOME ─────────────────────────────────────────────── */}
        {Object.keys(creativeAnswers).length > 0 && (
          <Section label="CREATIVE INCOME" color="#7AB4C8">
            <Row label="MONTHLY TARGET" value={CREATIVE_MONTHLY_LABELS[creativeAnswers.cr6]} />
            <Row label="GOAL" value={CREATIVE_GOAL_LABELS[creativeAnswers.cr3]} />
            <Row label="APPROACH" value={
              creativeAnswers.cr5 === 'both' ? 'Active now, building toward passive' :
              creativeAnswers.cr5 === 'passive' ? 'Passive — build once, earn forever' :
              creativeAnswers.cr5 === 'equity' ? 'Build something and sell it' : 'Active — freelance / consulting'
            } />
            {creativeAnswers.cr2 && (
              <Row label="VEHICLES" value={
                (Array.isArray(creativeAnswers.cr2) ? creativeAnswers.cr2 : [creativeAnswers.cr2])
                  .map(s => s.replace(/_/g, ' ')).join(', ')
              } />
            )}
          </Section>
        )}

        {/* ── MISSING QUIZZES ─────────────────────────────────────────────── */}
        {missing.length > 0 && (
          <div style={{ padding: '1.5rem', background: 'rgba(200,168,107,0.04)', border: '1px dashed #2A3530', borderRadius: '1rem', marginTop: '0.5rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#C8A86B', letterSpacing: '0.15em', marginBottom: '1rem' }}>COMPLETE YOUR PLAN</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {missing.map(s => (
                <Link key={s} to={`/quiz/${s}`} style={{ textDecoration: 'none' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', padding: '0.35rem 0.85rem', border: '1px solid #2A3530', borderRadius: '9999px', letterSpacing: '0.1em', cursor: 'pointer' }}>
                    {s.replace('_', ' ')} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* ── FOOTER ──────────────────────────────────────────────────────── */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1C2320', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost">← home</button>
          </Link>
          <Link to="/quiz/fire_type" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost">retake a quiz</button>
          </Link>
        </div>

      </div>
    </div>
  )
}

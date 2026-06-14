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

// ── Synthesis functions ────────────────────────────────────────────────────

function synthesizeCareer(a) {
  if (!a || !Object.keys(a).length) return null
  const direction = {
    same_more: 'staying in your lane and earning more',
    pivot: 'a full career pivot',
    build: 'building something of your own',
    international: 'moving into an international market',
    portfolio: 'building a portfolio of income streams',
  }[a.c3] ?? 'charting your own path'

  const target = {
    under_100k: 'under $100k',
    '100_150k': '$100k–$150k',
    '150_200k': '$150k–$200k',
    over_200k: 'over $200k',
    variable: 'variable — equity and creative income',
  }[a.c8] ?? 'your target range'

  const assets = Array.isArray(a.c7)
    ? a.c7.map(s => s.replace(/_/g, ' ')).join(', ')
    : (a.c7 ?? '').replace(/_/g, ' ')

  const leadership = {
    love: 'You lead well and want to keep doing it.',
    open: "You're open to leadership if the comp justifies it.",
    prefer_ic: 'You perform best as an individual contributor.',
    own_team: "You're not here to manage inside a corporation — you want to build your own team.",
  }[a.c6] ?? ''

  const relocation = {
    yes_anywhere: "You're open to moving anywhere.",
    yes_us: "You'd consider relocating within the US.",
    yes_international: "You're actively drawn to international markets.",
    no: "You're staying put — the plan works where you are.",
  }[a.c5] ?? ''

  return { direction, target, assets, leadership, relocation }
}

function synthesizeHome(a) {
  if (!a || !Object.keys(a).length) return null
  const location = {
    current_city: 'your current city',
    different_us: 'a lower-cost US city',
    international: 'internationally',
    multi: 'multiple places — a primary base plus somewhere else',
    unsure: 'wherever makes sense when the time comes',
  }[a.h3] ?? a.h3

  const property = {
    condo: 'a condo or co-op',
    townhouse: 'a townhouse',
    single_family: 'a single-family home',
    multi_family: 'a multi-family property — live in one unit, rent the rest',
    land: 'land to build something custom',
  }[a.h4] ?? a.h4

  const price = {
    under_250k: 'under $250,000',
    '250_500k': '$250,000–$500,000',
    '500_500k': '$250,000–$500,000',
    '500k_1m': '$500,000–$1,000,000',
    over_1m: 'over $1,000,000',
    unsure: 'TBD',
  }[a.h5] ?? a.h5

  const timeline = {
    now: 'within the next 12 months',
    '1_3': '1–3 years from now',
    '3_5': '3–5 years out',
    over_5: 'more than 5 years from now',
    flexible: 'when the conditions are right',
  }[a.h7] ?? a.h7

  const role = {
    primary_home: 'Your home is a home first — not an investment vehicle.',
    investment: 'Property is a wealth engine in your plan. Rental income matters.',
    both: 'You want both: a primary home and investment properties working in parallel.',
    no_ownership: "You'll rent and invest the difference. No property required.",
  }[a.h2] ?? ''

  const priorities = Array.isArray(a.h8)
    ? a.h8.map(s => s.replace(/_/g, ' ')).join(', ')
    : (a.h8 ?? '').replace(/_/g, ' ')

  return { location, property, price, timeline, role, priorities }
}

function synthesizeCreative(a) {
  if (!a || !Object.keys(a).length) return null
  const monthly = {
    under_1k: 'under $1,000/month',
    '1_3k': '$1,000–$3,000/month',
    '3_10k': '$3,000–$10,000/month',
    over_10k: 'over $10,000/month',
  }[a.cr6] ?? a.cr6

  const goal = {
    cover_basics: 'Cover your basic expenses so your full salary goes straight into investments.',
    accelerate: 'Accelerate your FIRE timeline by 2–5 years.',
    replace: 'Eventually replace your primary income entirely.',
    legacy: 'Build something that keeps generating income after you stop working.',
  }[a.cr3] ?? a.cr3

  const approach = {
    active: 'Active income now — you do the work, you get paid.',
    passive: 'Passive — build once, earn indefinitely.',
    both: 'Active income now while building toward passive streams.',
    equity: "You're building to sell.",
  }[a.cr5] ?? a.cr5

  const vehicles = Array.isArray(a.cr2)
    ? a.cr2.map(s => s.replace(/_/g, ' ')).join(', ')
    : (a.cr2 ?? '').replace(/_/g, ' ')

  const barrier = {
    time: 'Time is the bottleneck right now.',
    idea: "You're still finding the right vehicle.",
    confidence: "Confidence — you haven't charged for it yet.",
    audience: "You don't have an audience yet.",
    tech: "Technical execution is the gap.",
    energy: "Energy. The day job leaves nothing.",
  }[a.cr7] ?? ''

  return { monthly, goal, approach, vehicles, barrier }
}

function synthesizeRisk(result, answers) {
  if (!result?.risk_profile) return null
  const meta = RISK_META[result.risk_profile]
  if (!meta) return null

  const marketDrop = {
    sell_all: "When markets drop, your instinct is to get out. That's worth knowing.",
    sell_some: 'You reduce exposure when things get volatile.',
    hold: 'You hold through volatility and wait it out.',
    buy_more: 'When markets drop, you buy more. This is how aggressive portfolios are actually built.',
  }[answers?.r1] ?? ''

  const debtView = {
    avoid: 'You want to be debt-free. Every dollar of leverage makes you uncomfortable.',
    mortgage_only: 'Mortgage is the exception. Everything else stays clean.',
    strategic: "You're comfortable using debt strategically when returns beat the rate.",
    tool: "Debt is a tool. You use it when it makes mathematical sense.",
  }[answers?.r5] ?? ''

  return { meta, marketDrop, debtView }
}

// ── Components ─────────────────────────────────────────────────────────────

function PlanSection({ label, color = '#C8A86B', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: '#0A0906',
        border: `1px solid ${color}1A`,
        borderLeft: `3px solid ${color}`,
        borderRadius: '1rem',
        padding: '2rem 2rem 2rem 2rem',
        marginBottom: '1rem',
      }}
    >
      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color, marginBottom: '1.5rem' }}>{label}</p>
      {children}
    </motion.div>
  )
}

function Stat({ label, value, color = '#F0EDE8' }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.3rem' }}>{label}</p>
      <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem', color, lineHeight: 1.3 }}>{value}</p>
    </div>
  )
}

function Body({ children }) {
  return (
    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#9A9286', lineHeight: 1.8, marginTop: '1.25rem' }}>
      {children}
    </p>
  )
}

function Divider() {
  return <div style={{ height: '1px', background: '#1A1C18', margin: '1.25rem 0' }} />
}

// ── Page ───────────────────────────────────────────────────────────────────

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
      <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4A6A5A' }}>assembling your plan…</p>
    </div>
  )

  const fireResult      = results['fire_type']?.result ?? {}
  const riskResult      = results['risk']?.result ?? {}
  const riskAnswers     = results['risk']?.answers ?? {}
  const careerAnswers   = results['career']?.answers ?? {}
  const homeAnswers     = results['home']?.answers ?? {}
  const creativeAnswers = results['creative']?.answers ?? {}

  const fireType  = fireResult.fire_type
  const fireMeta  = FIRE_TYPE_META[fireType]
  const fireColor = FIRE_COLORS[fireType] ?? '#C8A86B'

  const career   = synthesizeCareer(careerAnswers)
  const home     = synthesizeHome(homeAnswers)
  const creative = synthesizeCreative(creativeAnswers)
  const risk     = synthesizeRisk(riskResult, riskAnswers)

  const SLUGS   = ['fire_type', 'career', 'home', 'creative', 'risk']
  const missing = SLUGS.filter(s => !results[s])
  const completed = SLUGS.filter(s => results[s])

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) 1.5rem' }}>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#3A4A40', letterSpacing: '0.1em', marginBottom: '3rem' }}>← back</p>
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: fireColor, marginBottom: '1rem' }}>
            MY RITUAL WEALTH PLAN
          </p>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(40px,7vw,72px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.0, marginBottom: '1.25rem' }}>
            {fireMeta?.label ?? 'Your Plan'}.
          </h1>
          {fireMeta?.number && (
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(24px,4vw,40px)', fontStyle: 'italic', color: fireColor, marginBottom: '1.5rem' }}>
              Target: {fmt(fireMeta.number)}
            </p>
          )}
          {fireMeta?.desc && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.15rem', color: '#6A7A6A', lineHeight: 1.75, maxWidth: '500px' }}>
              {fireMeta.desc}
            </p>
          )}
        </motion.div>

        {/* Progress bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'flex', gap: '0.4rem', marginBottom: '3.5rem' }}>
          {SLUGS.map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: results[s] ? fireColor : '#1C2320' }} />
          ))}
        </motion.div>

        {/* ── FIRE TARGET ──────────────────────────────────────────────── */}
        {fireMeta && (
          <PlanSection label="FIRE TARGET" color={fireColor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <Stat label="TARGET" value={fmt(fireMeta.number)} color={fireColor} />
              <Stat label="FIRE TYPE" value={fireMeta.label} color="#F0EDE8" />
              <Stat label="ANNUAL RETIREMENT SPEND" value="$80,000" />
              <Stat label="WITHDRAWAL RATE" value="4% rule" />
            </div>
            <Divider />
            <Body>
              The 4% rule means you can withdraw {fmt(Math.round((fireMeta.number ?? 0) * 0.04))} per year from a {fmt(fireMeta.number)} portfolio indefinitely — accounting for inflation and market cycles over 30+ years. That's the number you're building toward. Every dollar you invest today compounds toward it.
            </Body>
          </PlanSection>
        )}

        {/* ── RISK PROFILE ─────────────────────────────────────────────── */}
        {risk && (
          <PlanSection label="INVESTMENT PROFILE" color="#6AAD8A">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <Stat label="PROFILE" value={risk.meta.label} color="#6AAD8A" />
              <Stat label="ALLOCATION" value={risk.meta.allocation} />
            </div>
            <Divider />
            {risk.marketDrop && <Body>{risk.marketDrop}</Body>}
            {risk.debtView && <Body>{risk.debtView}</Body>}
          </PlanSection>
        )}

        {/* ── CAREER ───────────────────────────────────────────────────── */}
        {career && (
          <PlanSection label="CAREER PATH" color="#A89BC4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <Stat label="3-YEAR INCOME TARGET" value={career.target} color="#A89BC4" />
              <Stat label="DIRECTION" value={career.direction} />
            </div>
            <Divider />
            {career.assets && <Stat label="YOUR STRONGEST ASSETS" value={career.assets} />}
            <Body>{career.leadership}</Body>
            <Body>{career.relocation}</Body>
          </PlanSection>
        )}

        {/* ── HOME PLAN ────────────────────────────────────────────────── */}
        {home && (
          <PlanSection label="HOME PLAN" color="#C4717A">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <Stat label="FIRST PURCHASE" value={`${home.property} · ${home.price}`} color="#C4717A" />
              <Stat label="TIMELINE" value={home.timeline} />
            </div>
            <Divider />
            <Stat label="LOCATION STRATEGY" value={home.location} />
            {home.priorities && <Stat label="WHAT MATTERS MOST" value={home.priorities} />}
            <Body>{home.role}</Body>
          </PlanSection>
        )}

        {/* ── CREATIVE INCOME ──────────────────────────────────────────── */}
        {creative && (
          <PlanSection label="CREATIVE INCOME" color="#7AB4C8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '0.5rem' }}>
              <Stat label="MONTHLY TARGET" value={creative.monthly} color="#7AB4C8" />
              <Stat label="APPROACH" value={creative.approach} />
            </div>
            <Divider />
            {creative.vehicles && <Stat label="YOUR VEHICLES" value={creative.vehicles} />}
            <Body>{creative.goal}</Body>
            {creative.barrier && <Body>Current bottleneck: {creative.barrier}</Body>}
          </PlanSection>
        )}

        {/* ── MISSING ──────────────────────────────────────────────────── */}
        {missing.length > 0 && (
          <div style={{ padding: '1.5rem', border: '1px dashed #1C2320', borderRadius: '1rem', marginTop: '0.5rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#C8A86B', letterSpacing: '0.15em', marginBottom: '1rem' }}>
              {missing.length} QUIZ{missing.length > 1 ? 'ZES' : ''} LEFT TO COMPLETE YOUR PLAN
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {missing.map(s => (
                <Link key={s} to={`/quiz/${s}`} style={{ textDecoration: 'none' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', padding: '0.35rem 0.85rem', border: '1px solid #2A3530', borderRadius: '9999px', letterSpacing: '0.1em' }}>
                    {s.replace('_', ' ')} →
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #1A1C18', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

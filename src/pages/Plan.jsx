import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase'
import { FIRE_TYPE_META, deriveMilestones } from '../data/quizzes'

function fmt(n) { return n != null ? '$' + Number(n).toLocaleString() : '—' }
function fmtEur(n) { return n != null ? '€' + Number(n).toLocaleString() : '—' }

const FIRE_COLORS = {
  lean_fire:    '#7AB4C8',
  regular_fire: '#6AAD8A',
  fat_fire:     '#C8A86B',
  barista_fire: '#C4717A',
  coast_fire:   '#A89BC4',
}

// ── Synthesis ──────────────────────────────────────────────────────────────

function buildFireNarrative(result, a) {
  if (!result?.fire_type) return null
  const meta = FIRE_TYPE_META[result.fire_type]
  if (!meta) return null

  const freedomLabels = {
    no_alarm: 'never setting an alarm again',
    travel:   'traveling whenever you want',
    creative: 'creative work with no income pressure',
    family:   'being present for family without work guilt',
    health:   'access to the best health care and wellness',
    home:     'owning property outright',
    giving:   'having enough to give generously',
  }
  const freedomList = (Array.isArray(a?.ft7) ? a.ft7 : [a?.ft7]).filter(Boolean).map(k => freedomLabels[k]).filter(Boolean)

  const cityLife = {
    multi_city:     'You want to split time between multiple places.',
    very_flexible:  "You'd relocate anywhere.",
    somewhat:       "Open to another city or country.",
    rooted:         "You're staying in your city.",
  }[a?.ft4] ?? ''

  const postFIRE = {
    never:          "The day you hit the number, you're done.",
    maybe_passion:  'After FIRE, passion projects only — and only if they happen to pay.',
    yes_parttime:   'Part-time or consulting after FIRE to keep things interesting.',
    yes_fulltime:   'Possibly full-time if you find something you love more.',
  }[a?.ft6] ?? ''

  const legacy = {
    not:       "You plan to spend it all.",
    some:      "You'd like to leave something — not the whole point, but it matters.",
    important: "Generational wealth is part of the plan.",
    core:      "This is the whole point. Building for generations.",
  }[a?.ft8] ?? ''

  const annualSpend = {
    under_30k: 'under $30,000',
    '30_60k':  '$30,000–$60,000',
    '60_100k': '$60,000–$100,000',
    over_100k: 'over $100,000',
  }[a?.ft3] ?? null

  return { meta, freedomList, cityLife, postFIRE, legacy, annualSpend }
}

function buildCareerNarrative(a) {
  if (!a || !Object.keys(a).length) return null

  const target = {
    under_100k: 'under $100k',
    '100_150k': '$100k–$150k',
    '150_200k': '$150k–$200k',
    over_200k:  'over $200k',
    variable:   'variable — equity + creative income',
  }[a.c8] ?? null

  const currentComp = {
    under_60k:  'under $60k',
    '60_100k':  '$60k–$100k',
    '100_150k': '$100k–$150k',
    '150_200k': '$150k–$200k',
    over_200k:  'over $200k',
  }[a.c2] ?? null

  const direction = {
    same_more:    'Stay in your lane and earn significantly more.',
    pivot:        'A full career pivot.',
    build:        'Build something of your own.',
    international:'Move into an international market.',
    portfolio:    'Build a portfolio of income streams — no single job.',
  }[a.c3] ?? null

  const assetLabels = {
    systems:       'systems thinking',
    relationships: 'stakeholder relationships',
    technical:     'technical depth',
    creative:      'creative eye',
    communication: 'communication and storytelling',
    strategy:      'strategic thinking',
    compliance:    'compliance and risk',
  }
  const assets = (Array.isArray(a.c7) ? a.c7 : [a.c7]).filter(Boolean).map(k => assetLabels[k]).filter(Boolean)

  const valueLabels = {
    comp: 'compensation', autonomy: 'autonomy', impact: 'impact',
    growth: 'growth', status: 'status', stability: 'stability', creativity: 'creativity',
  }
  const values = (Array.isArray(a.c4) ? a.c4 : [a.c4]).filter(Boolean).map(k => valueLabels[k]).filter(Boolean)

  const leadership = {
    love:       'You lead well and want to keep doing it.',
    open:       "Open to leadership if the comp justifies it.",
    prefer_ic:  'You perform best as an individual contributor.',
    own_team:   "You're not here to manage inside a corporation — you want to build your own team.",
  }[a.c6] ?? ''

  const relocation = {
    yes_anywhere:     "You'll go wherever the opportunity is.",
    yes_us:           "Open to relocating within the US.",
    yes_international:"Actively drawn to international markets.",
    no:               "Staying put — the plan works where you are.",
  }[a.c5] ?? ''

  return { target, currentComp, direction, assets, values, leadership, relocation }
}

function buildHomeNarrative(a) {
  if (!a || !Object.keys(a).length) return null

  const propertyType = { condo: 'condo or co-op', townhouse: 'townhouse', single_family: 'single-family home', multi_family: 'multi-family', land: 'land / custom build' }[a.h4] ?? null
  const isFullService = Array.isArray(a.h8) && a.h8.includes('amenities') && a.h4 === 'condo'
  const propertyCharacter = isFullService ? 'full-service condo — doorman, gym, roof' : propertyType

  const priceRange = { under_250k: 'under $250k', '250_500k': '$250k–$500k', '500k_1m': '$500k–$1M', over_1m: '$1M+', unsure: 'TBD' }[a.h5] ?? null
  const timeline = { now: 'within 12 months', '1_3': '1–3 years', '3_5': '3–5 years', over_5: '5+ years', flexible: 'when conditions are right' }[a.h7] ?? null

  const location = {
    current_city: 'Your current city.',
    different_us: 'A lower-cost US city.',
    international:'Internationally.',
    multi:        'Multiple places — a primary base and somewhere else.',
    unsure:       'Location TBD.',
  }[a.h3] ?? ''

  const role = {
    primary_home: 'Your home is a home first.',
    investment:   'Property is a wealth engine — rental income is part of the math.',
    both:         'Primary home and investment properties in parallel. Buy, build out, rent or sell, repeat.',
    no_ownership: "You'll rent and invest the difference.",
  }[a.h2] ?? ''

  const priorityLabels = { space: 'space to work, create, and host', location: 'walkable neighborhood', aesthetic: 'beautiful and distinctly yours', investment: 'strong appreciation potential', community: 'the right people around you', quiet: 'peace and quiet', amenities: 'full-service building amenities' }
  const priorities = (Array.isArray(a.h8) ? a.h8 : [a.h8]).filter(Boolean).map(k => priorityLabels[k]).filter(Boolean)

  const downPayment = { nothing: 'Starting from zero on the down payment.', under_10k: 'Under $10k saved so far.', '10_25k': '$10k–$25k saved.', '25_50k': '$25k–$50k saved.', over_50k: 'Over $50k saved.' }[a.h6] ?? ''

  return { propertyCharacter, priceRange, timeline, location, role, priorities, downPayment }
}

function buildCreativeNarrative(a) {
  if (!a || !Object.keys(a).length) return null

  const vehicleLabels = { writing: 'writing and content', design: 'design and visual work', consulting: 'consulting', teaching: 'teaching and coaching', building: 'building digital products', performance: 'performance and music', physical: 'physical products', investing: 'real estate / financial investing' }
  const vehicles = (Array.isArray(a.cr2) ? a.cr2 : [a.cr2]).filter(Boolean).map(k => vehicleLabels[k]).filter(Boolean)

  const monthlyTarget = { under_1k: 'under $1,000/month', '1_3k': '$1,000–$3,000/month', '3_10k': '$3,000–$10,000/month', over_10k: 'over $10,000/month' }[a.cr6] ?? null
  const goal = { cover_basics: 'Cover basics so your full salary goes straight to investments.', accelerate: 'Accelerate your FIRE timeline by 2–5 years.', replace: 'Eventually replace your primary income entirely.', legacy: 'Build something that generates income after you stop.' }[a.cr3] ?? null
  const approach = { active: 'Active income now — you do the work, you get paid.', passive: 'Passive — build once, earn indefinitely.', both: 'Active income now while building toward passive.', equity: "You're building to sell." }[a.cr5] ?? null
  const time = { under_5h: 'Under 5 hours/week', '5_15h': '5–15 hours/week', '15_30h': '15–30 hours/week', full_time: 'Full-time' }[a.cr4] ?? null
  const barrier = { time: 'Time — the day job leaves little room.', idea: 'Still finding the right vehicle.', confidence: "Confidence — haven't charged for it yet.", audience: "No audience yet. That's the thing to build.", tech: 'Technical execution is the gap.', energy: 'Energy — the day job takes most of it.' }[a.cr7] ?? null
  const status = { no: 'Starting from zero on creative income.', yes_small: 'Already generating some — under $1,000/month.', yes_significant: '$1,000–$5,000/month coming in.', yes_main: 'Creative income is already your main income.' }[a.cr1] ?? null

  return { vehicles, monthlyTarget, goal, approach, time, barrier, status }
}

// ── Debt Payoff Calculator ─────────────────────────────────────────────────

function DebtPayoffTool({ fireColor }) {
  const [debt, setDebt]     = useState('')
  const [payment, setPayment] = useState('')
  const [rate, setRate]     = useState('')

  const calc = useCallback(() => {
    const principal = parseFloat(debt.replace(/,/g, ''))
    const monthly   = parseFloat(payment.replace(/,/g, ''))
    const annual    = parseFloat(rate)
    if (!principal || !monthly || monthly <= 0) return null

    if (!annual || annual === 0) {
      const months = Math.ceil(principal / monthly)
      const payoffDate = new Date()
      payoffDate.setMonth(payoffDate.getMonth() + months)
      return { months, totalInterest: 0, totalPaid: principal, payoffDate }
    }

    const r = annual / 100 / 12
    if (monthly <= principal * r) return { error: 'Monthly payment too low to cover interest.' }

    let balance = principal
    let months  = 0
    let totalInterest = 0

    while (balance > 0 && months < 600) {
      const interestCharge = balance * r
      totalInterest += interestCharge
      balance = balance + interestCharge - monthly
      months++
      if (balance < 0) balance = 0
    }

    const payoffDate = new Date()
    payoffDate.setMonth(payoffDate.getMonth() + months)

    return {
      months,
      totalInterest,
      totalPaid: principal + totalInterest,
      payoffDate,
    }
  }, [debt, payment, rate])

  const result = calc()

  const inputStyle = {
    background: '#0E0C08',
    border: '1px solid #2A3530',
    borderRadius: '0.5rem',
    padding: '0.75rem 1rem',
    color: '#F0EDE8',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    width: '100%',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle = {
    fontFamily: 'monospace',
    fontSize: '0.55rem',
    letterSpacing: '0.12em',
    color: '#3A4A40',
    marginBottom: '0.4rem',
    display: 'block',
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div>
          <label style={labelStyle}>TOTAL DEBT ($)</label>
          <input style={inputStyle} placeholder="e.g. 8500" value={debt} onChange={e => setDebt(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>MONTHLY PAYMENT ($)</label>
          <input style={inputStyle} placeholder="e.g. 750" value={payment} onChange={e => setPayment(e.target.value)} />
        </div>
        <div>
          <label style={labelStyle}>INTEREST RATE (%)</label>
          <input style={inputStyle} placeholder="e.g. 22" value={rate} onChange={e => setRate(e.target.value)} />
        </div>
      </div>

      {result?.error && (
        <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#C4717A' }}>{result.error}</p>
      )}

      {result && !result.error && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div style={{ padding: '1rem', background: '#0A0905', borderRadius: '0.75rem', border: `1px solid ${fireColor}22` }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.4rem' }}>DEBT-FREE IN</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: fireColor }}>
              {result.months < 12
                ? `${result.months} mo`
                : `${Math.floor(result.months / 12)}y ${result.months % 12}mo`}
            </p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4A6A5A', marginTop: '0.25rem' }}>
              {result.payoffDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div style={{ padding: '1rem', background: '#0A0905', borderRadius: '0.75rem', border: '1px solid #1C2320' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.4rem' }}>TOTAL INTEREST</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: '#C4717A' }}>{fmt(Math.round(result.totalInterest))}</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4A6A5A', marginTop: '0.25rem' }}>cost of carrying the debt</p>
          </div>
          <div style={{ padding: '1rem', background: '#0A0905', borderRadius: '0.75rem', border: '1px solid #1C2320' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.4rem' }}>TOTAL PAID</p>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.4rem', color: '#F0EDE8' }}>{fmt(Math.round(result.totalPaid))}</p>
            <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#4A6A5A', marginTop: '0.25rem' }}>principal + interest</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── UI primitives ──────────────────────────────────────────────────────────

function PlanSection({ label, color = '#C8A86B', children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
      style={{ background: '#080705', borderLeft: `3px solid ${color}`, borderRadius: '0 1rem 1rem 0', padding: '2rem', marginBottom: '1rem' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color, marginBottom: '1.75rem' }}>{label}</p>
      {children}
    </motion.div>
  )
}

function BigStat({ value, sub, color = '#F0EDE8' }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.4rem,3.5vw,2.2rem)', color, lineHeight: 1.1, marginBottom: '0.25rem' }}>{value}</p>
      {sub && <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', color: '#3A4A40', letterSpacing: '0.12em' }}>{sub}</p>}
    </div>
  )
}

function Prose({ children }) {
  if (!children) return null
  return <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.9rem', color: '#7A8A76', lineHeight: 1.85, marginBottom: '0.75rem' }}>{children}</p>
}

function Tag({ children, color = '#C8A86B' }) {
  return (
    <span style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.08em', color, border: `1px solid ${color}33`, borderRadius: '9999px', padding: '0.25rem 0.75rem', display: 'inline-block', marginRight: '0.4rem', marginBottom: '0.4rem' }}>
      {children}
    </span>
  )
}

function MiniLabel({ children }) {
  return <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.6rem', marginTop: '1.25rem' }}>{children}</p>
}

function Rule() {
  return <div style={{ height: '1px', background: '#12140F', margin: '1.25rem 0' }} />
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function Plan() {
  const { user } = useAuthStore()
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    supabase.from('fire_quiz_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
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

  const fireResult       = results['fire_type']?.result ?? {}
  const fireAnswers      = results['fire_type']?.answers ?? {}
  const careerAnswers    = results['career']?.answers ?? {}
  const homeAnswers      = results['home']?.answers ?? {}
  const creativeAnswers  = results['creative']?.answers ?? {}
  const trackAnswers     = results['career_tracks']?.answers ?? {}
  const milestoneAnswers = results['milestones']?.answers ?? {}

  const fire      = buildFireNarrative(fireResult, fireAnswers)
  const career    = buildCareerNarrative(careerAnswers)
  const home      = buildHomeNarrative(homeAnswers)
  const creative  = buildCreativeNarrative(creativeAnswers)
  const milestones = Object.keys(milestoneAnswers).length > 0 ? deriveMilestones(milestoneAnswers) : null

  const compLabels = {
    under_80k: 'under $80k', '80_120k': '$80k–$120k', '120_150k': '$120k–$150k',
    '150_200k': '$150k–$200k', over_200k: 'over $200k',
  }
  const timelineLabels = {
    now: 'applying now', '3mo': '3 months', '6mo': '6 months',
    '12mo': '12 months', over_12mo: '12+ months',
  }

  const fireColor = FIRE_COLORS[fireResult.fire_type] ?? '#C8A86B'
  const SLUGS     = ['fire_type', 'career', 'home', 'creative', 'risk', 'career_tracks', 'milestones']
  const coreSLUGS = ['fire_type', 'career', 'home', 'creative', 'risk']
  const missing   = coreSLUGS.filter(s => !results[s])

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(3rem,8vw,5rem) 1.5rem' }}>

        <Link to="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#3A4A40', letterSpacing: '0.1em', marginBottom: '3rem' }}>← back</p>
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.25em', color: fireColor, marginBottom: '1rem' }}>MY RITUAL WEALTH PLAN</p>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(40px,7vw,72px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.0, marginBottom: '0.75rem' }}>
            {fire?.meta?.label ?? 'Your Plan'}.
          </h1>
          {fire?.meta?.number && (
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(22px,3vw,34px)', fontStyle: 'italic', color: fireColor, marginBottom: '1.5rem' }}>
              {fmt(fire.meta.number)} target
            </p>
          )}
          {fire?.cityLife && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#5A6A54', lineHeight: 1.75 }}>
              {fire.cityLife}
            </p>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          style={{ display: 'flex', gap: '0.4rem', marginBottom: '3.5rem' }}>
          {SLUGS.map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: results[s] ? fireColor : '#1A1C16' }} />
          ))}
        </motion.div>

        {/* ── FIRE TARGET ──────────────────────────────────────────────── */}
        {fire && (
          <PlanSection label="FIRE TARGET" color={fireColor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <BigStat value={fmt(fire.meta.number)} sub="TARGET" color={fireColor} />
              {fire.annualSpend && <BigStat value={fire.annualSpend + '/year'} sub="RETIREMENT SPEND" />}
            </div>
            <Rule />
            {fire.freedomList.length > 0 && (
              <>
                <MiniLabel>WHAT FREEDOM MEANS TO YOU</MiniLabel>
                <div>{fire.freedomList.map(f => <Tag key={f} color={fireColor}>{f}</Tag>)}</div>
              </>
            )}
            <Rule />
            {fire.postFIRE && <Prose>{fire.postFIRE}</Prose>}
            {fire.legacy && <Prose>{fire.legacy}</Prose>}
          </PlanSection>
        )}

        {/* ── MILESTONE TIMELINE ───────────────────────────────────────── */}
        <PlanSection label="MILESTONE TIMELINE" color={fireColor}>
          {milestones ? (
            <>
              {/* Dynamic — from milestones quiz */}
              {[
                milestones.debtFreeDate && {
                  label: 'DEBT $0',
                  sub:   milestones.debtFreeDate,
                  note:  `${fmt(milestones.debt)} eliminated at ${fmt(milestones.debtPmt)}/month. First priority.`,
                },
                {
                  label: 'EMERGENCY FUND',
                  sub:   milestones.efDate,
                  note:  `${fmt(Math.round(milestones.efTarget))} — ${milestones.efMonths} months of expenses. Then you invest.`,
                },
                milestones.dpDate && {
                  label: 'DOWN PAYMENT',
                  sub:   milestones.dpDate,
                  note:  `${fmt(milestones.downPmt)} saved for a ${fmt(milestones.homePrice)} property.`,
                },
              ].filter(Boolean).map((m, i, arr) => (
                <div key={i} style={{ display: 'flex', gap: '1.25rem', paddingBottom: '1.25rem', position: 'relative' }}>
                  {i < arr.length - 1 && <div style={{ position: 'absolute', left: '7px', top: '20px', bottom: '-8px', width: '1px', background: '#1C2320' }} />}
                  <div style={{ width: '15px', height: '15px', borderRadius: '50%', border: `2px solid ${fireColor}`, background: '#080705', flexShrink: 0, marginTop: '2px' }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.2rem' }}>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.12em', color: fireColor }}>{m.label}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A' }}>{m.sub}</p>
                    </div>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#6A7A66', lineHeight: 1.5 }}>{m.note}</p>
                  </div>
                </div>
              ))}
              <Rule />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  { label: 'MONTHLY INCOME',   value: fmt(milestones.income) },
                  { label: 'MONTHLY EXPENSES',  value: fmt(milestones.expenses) },
                  { label: 'CURRENT SURPLUS',   value: fmt(Math.round(milestones.surplus)) + '/mo' },
                  { label: 'POST-DEBT SURPLUS', value: fmt(Math.round(milestones.postDebtSurplus)) + '/mo' },
                ].map(s => (
                  <div key={s.label} style={{ padding: '0.875rem', background: '#0A0905', borderRadius: '0.625rem', border: '1px solid #1A1C16' }}>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.1em', color: '#3A4A40', marginBottom: '0.3rem' }}>{s.label}</p>
                    <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1rem', color: '#F0EDE8' }}>{s.value}</p>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Prompt to take milestones quiz */
            <div>
              <Prose>Complete the Milestone Timeline quiz to generate your personal dates — debt-free, emergency fund, down payment, and beyond.</Prose>
              <Link to="/quiz/milestones" style={{ textDecoration: 'none' }}>
                <button className="btn-primary" style={{ marginTop: '1rem' }}>Build my timeline →</button>
              </Link>
            </div>
          )}
        </PlanSection>

        {/* ── CAREER TRACKS ────────────────────────────────────────────── */}
        {Object.keys(trackAnswers).length > 0 ? (
          <PlanSection label="CAREER TRACKS" color="#A89BC4">
            {[
              { name: trackAnswers.ct1, company: trackAnswers.ct2, comp: trackAnswers.ct3, timeline: trackAnswers.ct4, label: 'PRIMARY TRACK' },
              trackAnswers.ct5 === 'yes' && { name: trackAnswers.ct6, comp: trackAnswers.ct7, label: 'SECONDARY TRACK' },
              trackAnswers.ct8 && { name: trackAnswers.ct8, label: 'LONG-TERM TRACK' },
            ].filter(Boolean).filter(t => t.name).map((track, i) => (
              <div key={i} style={{ marginBottom: '1.25rem', paddingBottom: '1.25rem', borderBottom: i < 2 ? '1px solid #12140F' : 'none' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: '#3A4A40', marginBottom: '0.5rem' }}>{track.label}</p>
                <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', color: '#A89BC4', marginBottom: '0.25rem' }}>{track.name}</p>
                {track.company && <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#6A7A66', marginBottom: '0.25rem' }}>{track.company}</p>}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                  {track.comp && <Tag color="#A89BC4">{compLabels[track.comp] ?? track.comp}</Tag>}
                  {track.timeline && <Tag color="#A89BC4">{timelineLabels[track.timeline] ?? track.timeline}</Tag>}
                </div>
              </div>
            ))}
          </PlanSection>
        ) : (
          <PlanSection label="CAREER TRACKS" color="#A89BC4">
            <Prose>Name the exact roles you are working toward — titles, companies, comp targets, and timelines.</Prose>
            <Link to="/quiz/career_tracks" style={{ textDecoration: 'none' }}>
              <button className="btn-primary" style={{ marginTop: '1rem' }}>Add my career tracks →</button>
            </Link>
          </PlanSection>
        )}

        {/* ── DEBT PAYOFF ──────────────────────────────────────────────── */}
        <PlanSection label="DEBT PAYOFF CALCULATOR" color="#C4717A">
          <Prose>Enter your current debt, monthly payment, and interest rate to see your payoff timeline.</Prose>
          <DebtPayoffTool fireColor="#C4717A" />
        </PlanSection>

        {/* ── CAREER TRACKS ────────────────────────────────────────────── */}
        {career && (
          <PlanSection label="CAREER PATH" color="#A89BC4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <BigStat value={career.target} sub="3-YEAR INCOME TARGET" color="#A89BC4" />
              {career.currentComp && <BigStat value={career.currentComp} sub="CURRENT INCOME RANGE" />}
            </div>
            <Rule />
            {career.direction && <Prose>{career.direction}</Prose>}
            {career.leadership && <Prose>{career.leadership}</Prose>}
            {career.relocation && <Prose>{career.relocation}</Prose>}
            {career.assets.length > 0 && (
              <>
                <MiniLabel>YOUR STRONGEST ASSETS</MiniLabel>
                <div>{career.assets.map(a => <Tag key={a} color="#A89BC4">{a}</Tag>)}</div>
              </>
            )}
            {career.values.length > 0 && (
              <>
                <MiniLabel>WHAT YOU VALUE IN WORK</MiniLabel>
                <div>{career.values.map(v => <Tag key={v} color="#A89BC4">{v}</Tag>)}</div>
              </>
            )}
          </PlanSection>
        )}

        {/* ── HOME PLAN ────────────────────────────────────────────────── */}
        {home && (
          <PlanSection label="HOME PLAN" color="#C4717A">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <BigStat value={home.propertyCharacter} sub="FIRST PROPERTY" color="#C4717A" />
              <BigStat value={home.priceRange} sub="PRICE RANGE" />
            </div>
            <Rule />
            <Prose>{home.location}</Prose>
            <Prose>{home.role}</Prose>
            <Prose>{home.downPayment}</Prose>
            {home.timeline && <Prose>Target purchase: {home.timeline}.</Prose>}
            {home.priorities.length > 0 && (
              <>
                <MiniLabel>WHAT MATTERS IN A HOME</MiniLabel>
                <div>{home.priorities.map(p => <Tag key={p} color="#C4717A">{p}</Tag>)}</div>
              </>
            )}
          </PlanSection>
        )}

        {/* ── CREATIVE INCOME ──────────────────────────────────────────── */}
        {creative && (
          <PlanSection label="CREATIVE INCOME" color="#7AB4C8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <BigStat value={creative.monthlyTarget} sub="MONTHLY TARGET" color="#7AB4C8" />
              <BigStat value={creative.time} sub="TIME COMMITMENT" />
            </div>
            <Rule />
            {creative.status && <Prose>{creative.status}</Prose>}
            {creative.goal && <Prose>{creative.goal}</Prose>}
            {creative.approach && <Prose>{creative.approach}</Prose>}
            {creative.barrier && <Prose>Current bottleneck: {creative.barrier}</Prose>}
            {creative.vehicles.length > 0 && (
              <>
                <MiniLabel>YOUR VEHICLES</MiniLabel>
                <div>{creative.vehicles.map(v => <Tag key={v} color="#7AB4C8">{v}</Tag>)}</div>
              </>
            )}
          </PlanSection>
        )}

        {/* Missing quizzes */}
        {missing.length > 0 && (
          <div style={{ padding: '1.5rem', border: '1px dashed #1C2320', borderRadius: '1rem', marginTop: '0.5rem' }}>
            <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#C8A86B', letterSpacing: '0.15em', marginBottom: '1rem' }}>
              {missing.length} SECTION{missing.length > 1 ? 'S' : ''} LEFT
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

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #12140F', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/" style={{ textDecoration: 'none' }}><button className="btn-ghost">← home</button></Link>
          <Link to="/quiz/fire_type" style={{ textDecoration: 'none' }}><button className="btn-ghost">retake a quiz</button></Link>
        </div>

      </div>
    </div>
  )
}

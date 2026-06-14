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

// ── Deep synthesis ─────────────────────────────────────────────────────────

function buildFireNarrative(r, a) {
  if (!r?.fire_type) return null
  const meta = FIRE_TYPE_META[r.fire_type]
  if (!meta) return null

  const freedomMeans = {
    no_alarm:  'never setting an alarm again',
    travel:    'traveling whenever you want',
    creative:  'creative work with no income pressure',
    family:    'being present for family without work guilt',
    health:    'access to the best health care and wellness',
    home:      'owning property outright',
    giving:    'having enough to give generously',
  }

  const freedomList = (Array.isArray(a?.ft7) ? a.ft7 : [a?.ft7])
    .filter(Boolean)
    .map(k => freedomMeans[k])
    .filter(Boolean)

  const lifestyle = {
    lean:      'You live simply and intentionally.',
    moderate:  'Comfortable but not extravagant — good food, good travel, no stress.',
    fat:       'Full lifestyle maintenance. Everything you have now, forever.',
    work_lite: 'Still working, but only what you love and only when you want.',
    coast:     "You hit a number young and let compound interest do the rest.",
  }[a?.ft1] ?? ''

  const postFIRE = {
    never:         "The day you hit the number, you're done.",
    maybe_passion: 'After FIRE, you might do passion projects that happen to pay — but only those.',
    yes_parttime:  'Part-time or consulting after FIRE to keep things interesting.',
    yes_fulltime:  'Possibly full-time if you find something you love more.',
  }[a?.ft6] ?? ''

  const legacy = {
    not:       "You plan to spend it all. No legacy goal.",
    some:      "You'd like to leave something behind — not the whole point, but it matters.",
    important: "Generational wealth is part of the plan.",
    core:      "This is the whole point. Building for generations.",
  }[a?.ft8] ?? ''

  const cityLife = a?.ft4 === 'multi_city'
    ? 'You want to split time between multiple places — not rooted in one city, not rootless either.'
    : a?.ft4 === 'very_flexible'
    ? "You'd relocate anywhere for a lower cost of living."
    : a?.ft4 === 'rooted'
    ? "You're staying in your city."
    : "Open to another city or another country."

  const annualSpend = {
    under_30k: 'under $30,000 a year',
    '30_60k':  '$30,000–$60,000 a year',
    '60_100k': '$60,000–$100,000 a year',
    over_100k: 'over $100,000 a year',
  }[a?.ft3] ?? null

  return { meta, freedomList, lifestyle, postFIRE, legacy, cityLife, annualSpend }
}

function buildCareerNarrative(a) {
  if (!a || !Object.keys(a).length) return null

  const target = {
    under_100k: 'under $100k',
    '100_150k': '$100k–$150k',
    '150_200k': '$150k–$200k',
    over_200k:  'over $200k',
    variable:   'variable — equity and creative income',
  }[a.c8] ?? null

  const currentComp = {
    under_60k:   'under $60k',
    '60_100k':   '$60k–$100k',
    '100_150k':  '$100k–$150k',
    '150_200k':  '$150k–$200k',
    over_200k:   'over $200k',
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

  const assets = (Array.isArray(a.c7) ? a.c7 : [a.c7])
    .filter(Boolean)
    .map(k => assetLabels[k])
    .filter(Boolean)

  const valueLabels = {
    comp:       'compensation',
    autonomy:   'autonomy',
    impact:     'impact',
    growth:     'growth',
    status:     'status',
    stability:  'stability',
    creativity: 'creativity',
  }

  const values = (Array.isArray(a.c4) ? a.c4 : [a.c4])
    .filter(Boolean)
    .map(k => valueLabels[k])
    .filter(Boolean)

  const leadershipNarrative = {
    love:     'You lead well and want to keep doing it.',
    open:     "You're open to leadership if the comp justifies it.",
    prefer_ic:'You perform best as an individual contributor.',
    own_team: "You don't want to manage inside a corporation. You want to build your own team around your own vision.",
  }[a.c6] ?? ''

  const relocationNarrative = {
    yes_anywhere:    "You'll go wherever the opportunity is.",
    yes_us:          "You'd consider relocating within the US.",
    yes_international:"You're actively drawn to international markets.",
    no:              "You're staying put — the plan works where you are.",
  }[a.c5] ?? ''

  const currentRole = {
    individual_contributor: 'individual contributor',
    manager:               'manager or team lead',
    director_above:        'director or above',
    founder:               'founder',
    freelance:             'freelancer or consultant',
    early_career:          'early career',
  }[a.c1] ?? null

  return { target, currentComp, currentRole, direction, assets, values, leadershipNarrative, relocationNarrative }
}

function buildHomeNarrative(a) {
  if (!a || !Object.keys(a).length) return null

  const propertyType = {
    condo:         'condo or co-op',
    townhouse:     'townhouse',
    single_family: 'single-family home',
    multi_family:  'multi-family — live in one unit, rent the others',
    land:          'land to build something custom',
  }[a.h4] ?? null

  const priceRange = {
    under_250k: 'under $250,000',
    '250_500k': '$250,000–$500,000',
    '500k_1m':  '$500,000–$1,000,000',
    over_1m:    '$1,000,000+',
    unsure:     'TBD',
  }[a.h5] ?? null

  const timeline = {
    now:      'within the next 12 months',
    '1_3':    '1–3 years from now',
    '3_5':    '3–5 years out',
    over_5:   'more than 5 years out',
    flexible: 'when the conditions are right',
  }[a.h7] ?? null

  const locationNarrative = {
    current_city: 'You want to buy in your current city.',
    different_us: "You're targeting a lower-cost US city.",
    international:'You want to own abroad.',
    multi:        'Multiple places — a primary base and somewhere else.',
    unsure:       "The location is still open.",
  }[a.h3] ?? ''

  const roleNarrative = {
    primary_home: 'Your home is a home first.',
    investment:   'Property is a wealth engine in your plan. Rental income is part of the math.',
    both:         'You want both: a primary home and investment properties working in parallel. This is the enclave model — buy, build out, rent or sell, repeat.',
    no_ownership: "You'll rent and invest the difference. No property in the plan.",
  }[a.h2] ?? ''

  const priorityLabels = {
    space:      'space to work, create, and host',
    location:   'walkable neighborhood',
    aesthetic:  'beautiful and distinctly yours',
    investment: 'strong appreciation potential',
    community:  'the right people around you',
    quiet:      'peace and quiet',
    amenities:  'full-service building amenities — gym, doorman, roof',
  }

  const priorities = (Array.isArray(a.h8) ? a.h8 : [a.h8])
    .filter(Boolean)
    .map(k => priorityLabels[k])
    .filter(Boolean)

  const downPaymentStatus = {
    nothing:   'Starting from zero on the down payment.',
    under_10k: 'Under $10k saved so far.',
    '10_25k':  '$10,000–$25,000 saved.',
    '25_50k':  '$25,000–$50,000 saved.',
    over_50k:  'Over $50,000 saved.',
  }[a.h6] ?? ''

  // Derive property character from combined answers
  const isFullService = Array.isArray(a.h8) && a.h8.includes('amenities') && a.h4 === 'condo'
  const propertyCharacter = isFullService
    ? 'full-service condo — doorman, gym, the works'
    : propertyType

  return { propertyType, propertyCharacter, priceRange, timeline, locationNarrative, roleNarrative, priorities, downPaymentStatus }
}

function buildCreativeNarrative(a) {
  if (!a || !Object.keys(a).length) return null

  const vehicleLabels = {
    writing:    'writing and content',
    design:     'design and visual work',
    consulting: 'consulting in your field',
    teaching:   'teaching and coaching',
    building:   'building digital products',
    performance:'performance and music',
    physical:   'physical products and crafts',
    investing:  'real estate and financial investing',
  }

  const vehicles = (Array.isArray(a.cr2) ? a.cr2 : [a.cr2])
    .filter(Boolean)
    .map(k => vehicleLabels[k])
    .filter(Boolean)

  const monthlyTarget = {
    under_1k: 'under $1,000/month',
    '1_3k':   '$1,000–$3,000/month',
    '3_10k':  '$3,000–$10,000/month',
    over_10k: 'over $10,000/month',
  }[a.cr6] ?? null

  const goalNarrative = {
    cover_basics: 'Cover your basic expenses so your entire salary goes straight to investments.',
    accelerate:   'Accelerate your FIRE timeline by 2–5 years.',
    replace:      'Eventually replace your primary income entirely.',
    legacy:       'Build something that generates income long after you stop working.',
  }[a.cr3] ?? null

  const approachNarrative = {
    active:  'Active income now — you do the work, you get paid.',
    passive: 'Passive — build once, earn indefinitely.',
    both:    'Active income now, building toward passive streams in parallel.',
    equity:  "You're building to sell.",
  }[a.cr5] ?? null

  const timeCommitment = {
    under_5h:  'Under 5 hours a week',
    '5_15h':   '5–15 hours a week',
    '15_30h':  '15–30 hours a week',
    full_time: 'Full-time — you went all in',
  }[a.cr4] ?? null

  const barrierNarrative = {
    time:       "Time is the current bottleneck — the day job leaves little room.",
    idea:       "Still finding the right vehicle.",
    confidence: "Confidence is the gap — you haven't charged for it yet.",
    audience:   "No audience yet. That's the thing to build first.",
    tech:       "Technical execution is the gap between the idea and the product.",
    energy:     "Energy. The day job takes most of it.",
  }[a.cr7] ?? null

  const currentStatus = {
    no:               "Starting from zero on creative income.",
    yes_small:        "You already have some coming in — under $1,000/month.",
    yes_significant:  "Meaningful creative income already flowing — $1,000–$5,000/month.",
    yes_main:         "Creative income is already your main income.",
  }[a.cr1] ?? null

  return { vehicles, monthlyTarget, goalNarrative, approachNarrative, timeCommitment, barrierNarrative, currentStatus }
}

function buildRiskNarrative(result, a) {
  if (!result?.risk_profile) return null
  const meta = RISK_META[result.risk_profile]
  if (!meta) return null

  const marketDropNarrative = {
    sell_all:  "When markets drop hard, your instinct is to get out. That's worth building a plan around.",
    sell_some: 'You reduce exposure when volatility spikes.',
    hold:      'You hold through the dip and wait.',
    buy_more:  'When markets drop, you buy more. This is how aggressive portfolios are built.',
  }[a?.r1] ?? ''

  const debtNarrative = {
    avoid:      'You want to be debt-free. Every dollar of leverage is uncomfortable.',
    mortgage_only: 'Mortgage is the exception. Everything else stays clean.',
    strategic:  "Strategic debt is fine — you'll use it when the return beats the rate.",
    tool:       "Debt is a tool. You use it when it makes mathematical sense — and not otherwise.",
  }[a?.r5] ?? ''

  const horizonNarrative = {
    under_5:  'Your horizon is under 5 years — you may need this money soon.',
    '5_10':   '5–10 year horizon.',
    '10_20':  '10–20 year horizon. Long enough to ride out volatility and benefit from compounding.',
    over_20:  '20+ years. You are playing the longest game possible.',
  }[a?.r3] ?? ''

  const investmentLabels = {
    index_funds:      'index funds and ETFs',
    real_estate:      'real estate',
    individual_stocks:'individual stocks',
    bonds:            'bonds and fixed income',
    private:          'private equity and startups',
    crypto:           'crypto (small allocation)',
    business:         'building or buying a business',
    international:    'international markets',
  }

  const investmentVehicles = (Array.isArray(a?.r7) ? a.r7 : [a?.r7])
    .filter(Boolean)
    .map(k => investmentLabels[k])
    .filter(Boolean)

  const savingsRate = {
    under_10:  'under 10%',
    '10_25':   '10–25%',
    '25_50':   '25–50%',
    over_50:   'over 50% — sprinting',
  }[a?.r8] ?? null

  return { marketDropNarrative, debtNarrative, horizonNarrative, investmentVehicles, savingsRate }
}

// ── UI Components ──────────────────────────────────────────────────────────

function PlanSection({ label, color = '#C8A86B', children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      style={{
        background: '#080705',
        borderLeft: `3px solid ${color}`,
        borderRadius: '0 1rem 1rem 0',
        padding: '2rem',
        marginBottom: '1rem',
        position: 'relative',
      }}
    >
      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.2em', color, marginBottom: '1.75rem' }}>{label}</p>
      {children}
    </motion.div>
  )
}

function BigStat({ value, sub, color = '#F0EDE8' }) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.5rem,4vw,2.5rem)', color, lineHeight: 1.1, marginBottom: '0.25rem' }}>{value}</p>
      {sub && <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#3A4A40', letterSpacing: '0.12em' }}>{sub}</p>}
    </div>
  )
}

function Prose({ children }) {
  return (
    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.925rem', color: '#8A9286', lineHeight: 1.85, marginBottom: '0.75rem' }}>
      {children}
    </p>
  )
}

function Tag({ children, color = '#C8A86B' }) {
  return (
    <span style={{
      fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.08em',
      color, border: `1px solid ${color}33`, borderRadius: '9999px',
      padding: '0.25rem 0.75rem', display: 'inline-block', marginRight: '0.4rem', marginBottom: '0.4rem',
    }}>
      {children}
    </span>
  )
}

function Rule() {
  return <div style={{ height: '1px', background: '#14160F', margin: '1.5rem 0' }} />
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
  const fireAnswers     = results['fire_type']?.answers ?? {}
  const riskResult      = results['risk']?.result ?? {}
  const riskAnswers     = results['risk']?.answers ?? {}
  const careerAnswers   = results['career']?.answers ?? {}
  const homeAnswers     = results['home']?.answers ?? {}
  const creativeAnswers = results['creative']?.answers ?? {}

  const fire    = buildFireNarrative(fireResult, fireAnswers)
  const career  = buildCareerNarrative(careerAnswers)
  const home    = buildHomeNarrative(homeAnswers)
  const creative = buildCreativeNarrative(creativeAnswers)
  const risk    = buildRiskNarrative(riskResult, riskAnswers)

  const fireColor = FIRE_COLORS[fireResult.fire_type] ?? '#C8A86B'

  const SLUGS   = ['fire_type', 'career', 'home', 'creative', 'risk']
  const missing = SLUGS.filter(s => !results[s])

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
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(40px,7vw,72px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.0, marginBottom: '0.75rem' }}>
            {fire?.meta?.label ?? 'Your Plan'}.
          </h1>
          {fire?.meta?.number && (
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(22px,3vw,36px)', fontStyle: 'italic', color: fireColor, marginBottom: '1.5rem' }}>
              {fmt(fire.meta.number)} target
            </p>
          )}
          {fire?.lifestyle && (
            <p style={{ fontFamily: '"Cormorant Garamond", serif', fontStyle: 'italic', fontSize: '1.15rem', color: '#5A6A54', lineHeight: 1.75, maxWidth: '480px' }}>
              {fire.lifestyle}
            </p>
          )}
        </motion.div>

        {/* Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: 'flex', gap: '0.4rem', marginBottom: '3.5rem' }}>
          {SLUGS.map(s => (
            <div key={s} style={{ flex: 1, height: '3px', borderRadius: '2px', background: results[s] ? fireColor : '#1A1C16' }} />
          ))}
        </motion.div>

        {/* ── FIRE TARGET ──────────────────────────────────────────────────── */}
        {fire && (
          <PlanSection label="FIRE TARGET" color={fireColor}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              <BigStat value={fmt(fire.meta.number)} sub="TARGET" color={fireColor} />
              {fire.annualSpend && <BigStat value={fire.annualSpend} sub="ANNUAL SPEND IN RETIREMENT" />}
            </div>
            <Rule />
            {fire.cityLife && <Prose>{fire.cityLife}</Prose>}
            {fire.freedomList.length > 0 && (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.75rem', marginTop: '1rem' }}>WHAT FREEDOM MEANS TO YOU</p>
                <div>{fire.freedomList.map(f => <Tag key={f} color={fireColor}>{f}</Tag>)}</div>
              </>
            )}
            <Rule />
            {fire.postFIRE && <Prose>{fire.postFIRE}</Prose>}
            {fire.legacy && <Prose>{fire.legacy}</Prose>}
          </PlanSection>
        )}

        {/* ── CAREER ───────────────────────────────────────────────────────── */}
        {career && (
          <PlanSection label="CAREER PATH" color="#A89BC4">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              {career.target && <BigStat value={career.target} sub="3-YEAR INCOME TARGET" color="#A89BC4" />}
              {career.currentComp && <BigStat value={career.currentComp} sub="CURRENT INCOME RANGE" />}
            </div>
            <Rule />
            {career.direction && <Prose>{career.direction}</Prose>}
            {career.leadershipNarrative && <Prose>{career.leadershipNarrative}</Prose>}
            {career.relocationNarrative && <Prose>{career.relocationNarrative}</Prose>}
            {career.assets.length > 0 && (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.75rem', marginTop: '1rem' }}>YOUR STRONGEST ASSETS</p>
                <div>{career.assets.map(a => <Tag key={a} color="#A89BC4">{a}</Tag>)}</div>
              </>
            )}
            {career.values.length > 0 && (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.75rem', marginTop: '1rem' }}>WHAT YOU VALUE IN WORK</p>
                <div>{career.values.map(v => <Tag key={v} color="#A89BC4">{v}</Tag>)}</div>
              </>
            )}
          </PlanSection>
        )}

        {/* ── HOME PLAN ────────────────────────────────────────────────────── */}
        {home && (
          <PlanSection label="HOME PLAN" color="#C4717A">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              {home.propertyCharacter && <BigStat value={home.propertyCharacter} sub="FIRST PROPERTY" color="#C4717A" />}
              {home.priceRange && <BigStat value={home.priceRange} sub="PRICE RANGE" />}
            </div>
            <Rule />
            {home.locationNarrative && <Prose>{home.locationNarrative}</Prose>}
            {home.roleNarrative && <Prose>{home.roleNarrative}</Prose>}
            {home.downPaymentStatus && <Prose>{home.downPaymentStatus}</Prose>}
            {home.timeline && <Prose>Target purchase: {home.timeline}.</Prose>}
            {home.priorities.length > 0 && (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.75rem', marginTop: '1rem' }}>WHAT MATTERS IN A HOME</p>
                <div>{home.priorities.map(p => <Tag key={p} color="#C4717A">{p}</Tag>)}</div>
              </>
            )}
          </PlanSection>
        )}

        {/* ── CREATIVE INCOME ──────────────────────────────────────────────── */}
        {creative && (
          <PlanSection label="CREATIVE INCOME" color="#7AB4C8">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '0.5rem' }}>
              {creative.monthlyTarget && <BigStat value={creative.monthlyTarget} sub="MONTHLY TARGET" color="#7AB4C8" />}
              {creative.timeCommitment && <BigStat value={creative.timeCommitment} sub="TIME COMMITMENT" />}
            </div>
            <Rule />
            {creative.currentStatus && <Prose>{creative.currentStatus}</Prose>}
            {creative.goalNarrative && <Prose>{creative.goalNarrative}</Prose>}
            {creative.approachNarrative && <Prose>{creative.approachNarrative}</Prose>}
            {creative.barrierNarrative && <Prose>Current bottleneck: {creative.barrierNarrative}</Prose>}
            {creative.vehicles.length > 0 && (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.75rem', marginTop: '1rem' }}>YOUR VEHICLES</p>
                <div>{creative.vehicles.map(v => <Tag key={v} color="#7AB4C8">{v}</Tag>)}</div>
              </>
            )}
          </PlanSection>
        )}

        {/* ── INVESTMENT PROFILE ───────────────────────────────────────────── */}
        {risk && (
          <PlanSection label="INVESTMENT PROFILE" color="#6AAD8A">
            {risk.horizonNarrative && <Prose>{risk.horizonNarrative}</Prose>}
            {risk.marketDropNarrative && <Prose>{risk.marketDropNarrative}</Prose>}
            {risk.debtNarrative && <Prose>{risk.debtNarrative}</Prose>}
            {risk.savingsRate && <Prose>Current savings rate: {risk.savingsRate} of take-home pay.</Prose>}
            {risk.investmentVehicles.length > 0 && (
              <>
                <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', letterSpacing: '0.12em', color: '#3A4A40', marginBottom: '0.75rem', marginTop: '1rem' }}>WHERE YOU WANT TO INVEST</p>
                <div>{risk.investmentVehicles.map(v => <Tag key={v} color="#6AAD8A">{v}</Tag>)}</div>
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

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid #14160F', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

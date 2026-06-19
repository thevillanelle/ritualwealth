'use client'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuthStore } from '../stores/useAuthStore'
import { supabase } from '../lib/supabase/client'

const APPS = {
  ritualwear:  'https://wear.ritualware.app',
  glowup:      'https://glowup.ritualware.app',
  ritualwhere: 'https://where.ritualware.app',
  matelier:    'https://studio.ritualware.app',
}

const C = {
  bg:      '#0C0B08',
  surface: '#12140F',
  border:  '#1A1C16',
  green:   '#4A6A5A',
  bright:  '#6AAD8A',
  ink:     '#F0EDE8',
  muted:   '#8A9E96',
  dim:     '#2A3530',
}

function fmt(val) {
  if (!val) return null
  if (typeof val === 'number') return String(val)
  return String(val).replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
}

const FORMALITY_LABELS = { 1: 'Very Casual', 2: 'Casual', 3: 'Creative Professional', 4: 'Elevated', 5: 'Always Elevated' }
const GLOW_SECTIONS = ['skin','sleep','nutrition','fitness','hair','face','body','teeth','fragrance','services','fashion','mindset']
const GLOW_LABELS   = { skin:'Skin', sleep:'Sleep', nutrition:'Nutrition', fitness:'Fitness', hair:'Hair', face:'Face & Makeup', body:'Body', teeth:'Teeth', fragrance:'Fragrance', services:'Pro Services', fashion:'Fashion', mindset:'Mindset' }

const mono  = { fontFamily: 'monospace', letterSpacing: '0.15em', textTransform: 'uppercase' }
const sans  = { fontFamily: '"DM Sans", sans-serif' }
const card  = { background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem', marginBottom: '0.875rem' }
const fade  = (i) => ({ initial: { opacity: 0, y: 14 }, animate: { opacity: 1, y: 0 }, transition: { delay: i * 0.07, duration: 0.4, ease: 'easeOut' } })

function Label({ children, color }) {
  return <p style={{ ...mono, fontSize: '0.55rem', color: color || C.dim, marginBottom: '0.35rem' }}>{children}</p>
}

function Hero({ value, label }) {
  if (!value) return null
  return (
    <div style={{ padding: '1.5rem 0', textAlign: 'center' }}>
      <p style={{ ...sans, fontSize: '2.5rem', fontWeight: 600, color: C.ink, lineHeight: 1.1, marginBottom: '0.4rem' }}>{value}</p>
      <Label color={C.dim}>{label}</Label>
    </div>
  )
}

function StatGrid({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', margin: '0.25rem 0' }}>{children}</div>
}

function Stat({ label, value, accent }) {
  if (!value) return null
  return (
    <div style={{ background: C.dim, borderRadius: '0.625rem', padding: '0.875rem' }}>
      <p style={{ ...sans, fontSize: '0.95rem', color: accent || C.ink, fontWeight: 500, marginBottom: '0.25rem', lineHeight: 1.2 }}>{value}</p>
      <Label>{label}</Label>
    </div>
  )
}

function Pill({ text, accent }) {
  return (
    <span style={{ ...sans, fontSize: '0.8rem', padding: '0.35rem 0.875rem', borderRadius: '999px', border: `1px solid ${accent || C.green}`, color: accent || C.bright }}>
      {text}
    </span>
  )
}

function ScoreRow({ label, score }) {
  return (
    <div style={{ marginBottom: '0.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
        <Label>{label}</Label>
        <span style={{ ...mono, fontSize: '0.55rem', color: C.bright }}>{score}</span>
      </div>
      <div style={{ height: '6px', background: C.dim, borderRadius: '999px', overflow: 'hidden' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: `${(score / 10) * 100}%` }} transition={{ duration: 0.8, ease: 'easeOut' }} style={{ height: '100%', background: C.bright, borderRadius: '999px' }} />
      </div>
    </div>
  )
}

function SectionHead({ label, filled, accent = C.green }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
      <div style={{ width: '2px', height: '1rem', borderRadius: '999px', background: accent, flexShrink: 0 }} />
      <span style={{ ...mono, fontSize: '0.55rem', color: C.muted }}>{label}</span>
      <div style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: filled ? C.bright : C.dim, flexShrink: 0 }} />
    </div>
  )
}

function Empty({ label, href }) {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <p style={{ ...sans, fontSize: '1rem', color: C.muted, marginBottom: '1.25rem', lineHeight: 1.5 }}>{label}</p>
      {href && (
        <a href={href} style={{ ...mono, fontSize: '0.6rem', color: C.bright, textDecoration: 'none', border: `1px solid ${C.green}`, padding: '0.5rem 1.25rem', borderRadius: '999px' }}>
          START →
        </a>
      )}
    </div>
  )
}

export default function RitualProfile() {
  const { user, signOut, signInWithGoogle } = useAuthStore()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { if (user) loadAll(); else setLoading(false) }, [user])

  const loadAll = async () => {
    setLoading(true)
    const [styleRes, rulesRes, looksRes, neighborhoodRes, burnoutRes, reinventionRes, datingRes, glowRes, projectsRes, goalsRes, skillsRes] = await Promise.all([
      supabase.from('style_profiles').select('*').eq('user_id', user.id).limit(1),
      supabase.from('style_rules').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('saved_looks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(3),
      supabase.from('neighborhood_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('burnout_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('reinvention_plans').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('dating_profiles').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('glow_up_results').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1),
      supabase.from('atelier_projects').select('*').eq('user_id', user.id).in('status', ['active', 'planning']).order('created_at', { ascending: false }).limit(4),
      supabase.from('atelier_goals').select('*').eq('user_id', user.id).eq('is_complete', false).order('created_at', { ascending: false }).limit(4),
      supabase.from('atelier_skills').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(8),
    ])
    setData({
      style: styleRes.data?.[0] ?? null, rules: rulesRes.data || [], looks: looksRes.data || [],
      neighborhood: neighborhoodRes.data?.[0] ?? null, burnout: burnoutRes.data?.[0] ?? null,
      reinvention: reinventionRes.data?.[0] ?? null, dating: datingRes.data?.[0] ?? null,
      glow: glowRes.data?.[0] ?? null, projects: projectsRes.data || [],
      goals: goalsRes.data || [], skills: skillsRes.data || [],
    })
    setLoading(false)
  }

  const completionCount = !data ? 0 : [data.style, data.glow, data.neighborhood, data.burnout, data.reinvention, data.dating, data.projects.length > 0, data.goals.length > 0].filter(Boolean).length

  if (!user) return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ textAlign: 'center', maxWidth: '300px' }}>
        <p style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>✦</p>
        <p style={{ ...sans, fontSize: '1.4rem', fontWeight: 600, color: C.ink, marginBottom: '0.75rem' }}>My Ritual Profile</p>
        <p style={{ ...sans, fontSize: '0.85rem', color: C.muted, lineHeight: 1.65, marginBottom: '1.75rem' }}>
          Your style, wellness, city life, and what you are building — all in one place.
        </p>
        <button onClick={signInWithGoogle} style={{ ...mono, fontSize: '0.6rem', color: C.ink, background: C.green, border: 'none', borderRadius: '0.5rem', padding: '0.75rem 1.5rem', cursor: 'pointer' }}>
          SIGN IN →
        </button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '2.5rem 1rem' }}>

        {loading && (
          <div style={{ textAlign: 'center', padding: '6rem 0' }}>
            <p style={{ ...sans, color: C.muted, fontSize: '0.9rem' }}>Gathering your profile…</p>
          </div>
        )}

        {!loading && data && (
          <div>

            {/* ── IDENTITY CARD ───────────────────────────────────────── */}
            <motion.div {...fade(0)} style={{ background: `linear-gradient(135deg, ${C.green}, #1E3428)`, borderRadius: '1.25rem', padding: '1.75rem', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div>
                  <Label color="rgba(255,255,255,0.3)">Ritual Profile</Label>
                  <p style={{ ...sans, fontSize: '1.4rem', fontWeight: 700, color: C.ink, lineHeight: 1.2, marginTop: '0.25rem' }}>{user.user_metadata?.full_name || user.email?.split('@')[0]}</p>
                  <p style={{ ...mono, fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.4rem' }}>{user.email}</p>
                </div>
                <button onClick={signOut} style={{ ...mono, fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)', background: 'none', border: 'none', cursor: 'pointer' }}>SIGN OUT</button>
              </div>
              <div style={{ display: 'flex', gap: '4px', marginBottom: '0.4rem' }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: '3px', borderRadius: '999px', background: i < completionCount ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                ))}
              </div>
              <p style={{ ...mono, fontSize: '0.5rem', color: 'rgba(255,255,255,0.25)' }}>{completionCount} OF 8 COMPLETE</p>
            </motion.div>

            {/* ── STYLE IDENTITY ─────────────────────────────────────── */}
            <motion.div {...fade(1)} style={card}>
              <SectionHead label="Style Identity" filled={!!data.style} accent={C.bright} />
              {data.style ? (
                <div>
                  <Hero value={fmt(data.style.kibbe_type)} label="Kibbe Type" />
                  <StatGrid>
                    <Stat label="Color Season" value={fmt(data.style.color_season)} accent="#C8A86B" />
                    <Stat label="Undertone"    value={fmt(data.style.undertone)} />
                    {data.style.metal_preference && <Stat label="Metal" value={fmt(data.style.metal_preference)} />}
                    {data.style.lifestyle_formality && <Stat label="Formality" value={FORMALITY_LABELS[data.style.lifestyle_formality]} />}
                  </StatGrid>

                  {data.style.style_words?.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <Label color={C.muted}>Style words</Label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                        {data.style.style_words.map(w => <Pill key={w} text={fmt(w)} />)}
                      </div>
                    </div>
                  )}

                  {data.style.designers_loved?.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <Label color={C.muted}>Designer DNA</Label>
                      <p style={{ ...sans, fontSize: '0.9rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.6, marginTop: '0.25rem' }}>{data.style.designers_loved.map(fmt).join(', ')}</p>
                    </div>
                  )}

                  {data.rules.length > 0 && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <Label color={C.muted}>Your rules</Label>
                      <ul style={{ listStyle: 'none', margin: '0.5rem 0 0', padding: 0 }}>
                        {data.rules.slice(0, 4).map((r, i) => (
                          <li key={i} style={{ ...sans, display: 'flex', gap: '0.625rem', fontSize: '0.85rem', color: C.muted, marginBottom: '0.5rem', lineHeight: 1.5 }}>
                            <span style={{ color: C.bright, flexShrink: 0 }}>✦</span>{r.rule_text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <a href={APPS.ritualwear + '/bible'} style={{ ...mono, display: 'block', textAlign: 'center', fontSize: '0.55rem', color: C.dim, marginTop: '1.25rem', textDecoration: 'none' }}>EDIT STYLE BIBLE →</a>
                </div>
              ) : (
                <Empty label="Style Bible not built yet." href={APPS.ritualwear + '/quiz'} />
              )}
            </motion.div>

            {/* ── BEAUTY & WELLNESS ──────────────────────────────────── */}
            <motion.div {...fade(2)} style={card}>
              <SectionHead label="Beauty & Wellness" filled={!!data.glow} accent="#8FA688" />
              {data.glow?.result ? (
                <div>
                  {data.glow.result.headline && (
                    <p style={{ ...sans, fontSize: '1.1rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.55, marginBottom: '1.25rem' }}>"{data.glow.result.headline}"</p>
                  )}
                  <StatGrid>
                    {data.glow.result.overall_tier     && <Stat label="Tier"        value={data.glow.result.overall_tier}           accent="#8FA688" />}
                    {data.glow.result.strongest_area   && <Stat label="Strongest"   value={data.glow.result.strongest_area}         />}
                    {data.glow.result.biggest_opportunity && <Stat label="Opportunity" value={data.glow.result.biggest_opportunity} />}
                  </StatGrid>
                  {data.glow.result.section_verdicts && (
                    <div style={{ marginTop: '1.25rem' }}>
                      <Label color={C.muted}>Section scores</Label>
                      <div style={{ marginTop: '0.75rem' }}>
                        {GLOW_SECTIONS.filter(k => data.glow.result.section_verdicts?.[k]).map(k => (
                          <ScoreRow key={k} label={GLOW_LABELS[k]} score={data.glow.result.section_verdicts[k].score} />
                        ))}
                      </div>
                    </div>
                  )}
                  {data.glow.result.quick_wins?.length > 0 && (
                    <div style={{ marginTop: '1rem' }}>
                      <Label color={C.muted}>Quick wins</Label>
                      <ul style={{ listStyle: 'none', margin: '0.5rem 0 0', padding: 0 }}>
                        {data.glow.result.quick_wins.slice(0, 3).map((w, i) => (
                          <li key={i} style={{ ...sans, display: 'flex', gap: '0.625rem', fontSize: '0.85rem', color: C.muted, marginBottom: '0.5rem' }}>
                            <span style={{ color: C.bright }}>✓</span>{w}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <Empty label="Glow Up audit not taken yet." href={APPS.glowup + '/glow-up'} />
              )}
            </motion.div>

            {/* ── NYC LIFE ───────────────────────────────────────────── */}
            <motion.div {...fade(3)} style={card}>
              <SectionHead label="NYC Life" filled={!!(data.neighborhood || data.burnout || data.reinvention || data.dating)} accent="#A89BC4" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <Label color={C.muted}>Neighborhood</Label>
                    <a href={APPS.ritualwhere + '/neighborhood'} style={{ ...mono, fontSize: '0.5rem', color: C.dim, textDecoration: 'none' }}>{data.neighborhood ? 'RETAKE →' : 'TAKE QUIZ →'}</a>
                  </div>
                  {data.neighborhood
                    ? <p style={{ ...sans, fontSize: '2rem', fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>{data.neighborhood.top_match}</p>
                    : <p style={{ ...sans, fontSize: '0.85rem', color: C.dim, fontStyle: 'italic' }}>Not taken yet.</p>}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <Label color={C.muted}>Burnout audit</Label>
                    <a href={APPS.ritualwhere + '/burnout'} style={{ ...mono, fontSize: '0.5rem', color: C.dim, textDecoration: 'none' }}>{data.burnout ? 'RETAKE →' : 'TAKE →'}</a>
                  </div>
                  {data.burnout
                    ? <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.625rem' }}>
                        <p style={{ ...sans, fontSize: '1.5rem', fontWeight: 600, color: C.ink, textTransform: 'capitalize' }}>{data.burnout.burnout_type} Burnout</p>
                        {data.burnout.is_chronic && <span style={{ ...mono, fontSize: '0.5rem', color: '#D97706', border: '1px solid #D97706', padding: '0.15rem 0.5rem', borderRadius: '999px' }}>CHRONIC</span>}
                      </div>
                    : <p style={{ ...sans, fontSize: '0.85rem', color: C.dim, fontStyle: 'italic' }}>Not taken yet.</p>}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <Label color={C.muted}>Quarterly focus</Label>
                    <a href={APPS.ritualwhere + '/reinvention'} style={{ ...mono, fontSize: '0.5rem', color: C.dim, textDecoration: 'none' }}>{data.reinvention ? 'RETAKE →' : 'START →'}</a>
                  </div>
                  {data.reinvention
                    ? <div>
                        <p style={{ ...sans, fontSize: '1.25rem', fontWeight: 600, color: C.ink }}>{data.reinvention.priority_area}</p>
                        {data.reinvention.quarter && <p style={{ ...mono, fontSize: '0.5rem', color: C.dim, marginTop: '0.2rem' }}>{data.reinvention.quarter}</p>}
                      </div>
                    : <p style={{ ...sans, fontSize: '0.85rem', color: C.dim, fontStyle: 'italic' }}>Not taken yet.</p>}
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <Label color={C.muted}>Dating strategy</Label>
                    <a href={APPS.ritualwhere + '/dating'} style={{ ...mono, fontSize: '0.5rem', color: C.dim, textDecoration: 'none' }}>{data.dating ? 'RETAKE →' : 'BUILD →'}</a>
                  </div>
                  {data.dating
                    ? <div>
                        <p style={{ ...sans, fontSize: '1.1rem', fontWeight: 600, color: C.ink, textTransform: 'capitalize', marginBottom: '0.25rem' }}>{fmt(data.dating.dating_goal)}</p>
                        {data.dating.main_strategy && <p style={{ ...sans, fontSize: '0.85rem', color: C.muted, fontStyle: 'italic', lineHeight: 1.55 }}>{data.dating.main_strategy}</p>}
                      </div>
                    : <p style={{ ...sans, fontSize: '0.85rem', color: C.dim, fontStyle: 'italic' }}>Not taken yet.</p>}
                </div>
              </div>
            </motion.div>

            {/* ── WHAT YOU ARE BUILDING ──────────────────────────────── */}
            <motion.div {...fade(4)} style={card}>
              <SectionHead label="What You Are Building" filled={!!(data.projects.length || data.goals.length || data.skills.length)} accent="#C8A86B" />
              {(data.projects.length || data.goals.length || data.skills.length) ? (
                <div>
                  {data.projects.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <Label color={C.muted}>Active projects</Label>
                      <div style={{ marginTop: '0.5rem' }}>
                        {data.projects.map((p, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: `1px solid ${C.border}` }}>
                            <span style={{ ...sans, fontSize: '0.95rem', color: C.ink }}>{p.name}</span>
                            <span style={{ ...mono, fontSize: '0.5rem', color: p.status === 'active' ? C.bright : C.muted }}>{p.status.toUpperCase()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.goals.length > 0 && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <Label color={C.muted}>Current goals</Label>
                      <div style={{ marginTop: '0.5rem' }}>
                        {data.goals.map((g, i) => (
                          <div key={i} style={{ padding: '0.5rem 0', borderBottom: `1px solid ${C.border}` }}>
                            <p style={{ ...sans, fontSize: '0.95rem', color: C.ink }}>{g.title}</p>
                            {g.category && <p style={{ ...mono, fontSize: '0.5rem', color: C.dim, marginTop: '0.2rem' }}>{g.category}{g.timeframe ? ` · ${g.timeframe}` : ''}</p>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {data.skills.length > 0 && (
                    <div>
                      <Label color={C.muted}>Skills</Label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                        {data.skills.map((s, i) => (
                          <Pill key={i} text={`${s.label}${s.level !== 'Familiar' ? ` · ${s.level}` : ''}`} accent="#C8A86B" />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Empty label="No projects or goals yet." href={APPS.matelier} />
              )}
            </motion.div>

            {/* ── COMPLETE YOUR PROFILE ──────────────────────────────── */}
            {completionCount < 8 && (
              <motion.div {...fade(5)} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: '1rem', padding: '1.5rem' }}>
                <Label color={C.muted}>Complete your profile</Label>
                <p style={{ ...sans, fontSize: '0.85rem', color: C.dim, marginBottom: '1.25rem', marginTop: '0.25rem', lineHeight: 1.5 }}>The more you fill in, the more every app reflects who you actually are.</p>
                {[
                  { done: !!data.style,             label: 'Build your Style Bible',    href: APPS.ritualwear + '/quiz' },
                  { done: !!data.glow,              label: 'Take the Glow Up audit',    href: APPS.glowup + '/glow-up' },
                  { done: !!data.neighborhood,      label: 'Find your neighborhood',     href: APPS.ritualwhere + '/neighborhood' },
                  { done: !!data.burnout,           label: 'Take the burnout audit',     href: APPS.ritualwhere + '/burnout' },
                  { done: !!data.reinvention,       label: 'Set your quarterly focus',   href: APPS.ritualwhere + '/reinvention' },
                  { done: !!data.dating,            label: 'Build your dating strategy', href: APPS.ritualwhere + '/dating' },
                  { done: data.projects.length > 0, label: "Add a project to m'atelier", href: APPS.matelier + '/projects' },
                  { done: data.goals.length > 0,    label: "Set a goal in m'atelier",    href: APPS.matelier + '/goals' },
                ].filter(i => !i.done).map((item, i) => (
                  <a key={i} href={item.href} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0', borderBottom: `1px solid ${C.border}`, textDecoration: 'none' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', border: `1px solid ${C.dim}`, flexShrink: 0 }} />
                    <span style={{ ...sans, fontSize: '0.85rem', color: C.muted }}>{item.label}</span>
                    <span style={{ marginLeft: 'auto', ...mono, fontSize: '0.55rem', color: C.dim }}>→</span>
                  </a>
                ))}
              </motion.div>
            )}

            {completionCount === 8 && (
              <motion.div {...fade(5)} style={{ background: `linear-gradient(135deg, ${C.green}, #1E3428)`, borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✦</p>
                <p style={{ ...sans, fontSize: '1.25rem', fontWeight: 700, color: C.ink, marginBottom: '0.5rem' }}>Profile complete.</p>
                <p style={{ ...sans, fontSize: '0.85rem', color: 'rgba(240,237,232,0.5)', lineHeight: 1.6 }}>You know who you are, where you live, what you are building, and how you operate.</p>
              </motion.div>
            )}

          </div>
        )}
      </main>
    </div>
  )
}

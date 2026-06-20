'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

const TYPES = [
  {
    name: 'Lean FIRE',
    color: '#7AB4C8',
    number: '$500k–$800k',
    desc: 'Maximum freedom, minimum overhead. You live simply and intentionally — no frills, no waste, no apology. Think: paid-off small home, low cost-of-living city, or abroad. You retire early because you decided "enough" early.',
  },
  {
    name: 'Regular FIRE',
    color: '#6AAD8A',
    number: '$1M–$1.5M',
    desc: 'The classic. You retire comfortably on a modest budget — not lavish, not sparse. You have what you need, plus a little of what you want. Most FIRE calculators assume this.',
  },
  {
    name: 'Fat FIRE',
    color: '#C8A86B',
    number: '$2M–$5M+',
    desc: 'You want financial independence without changing your lifestyle. Business class, good wine, full-service condo, travel without math. You retire rich, not just free.',
  },
  {
    name: 'Barista FIRE',
    color: '#C4717A',
    number: '$300k–$700k',
    desc: "Semi-retired. You've saved enough that a part-time job or passion project covers your living expenses — so your investments can keep growing untouched. The vibe: coffee shop shifts, creative work, freedom with a safety net.",
  },
  {
    name: 'Coast FIRE',
    color: '#A89BC4',
    number: 'Varies',
    desc: "You've invested enough early that compound interest will get you to your number by traditional retirement age — without another dollar contributed. You stop saving aggressively and just live. Coast.",
  },
]

const SECTIONS = [
  {
    label: 'The basics',
    title: 'Financial Independence, Retire Early.',
    body: `FIRE is a movement — and a math problem. The idea: save and invest aggressively enough that your money generates more income than you spend. When that happens, work becomes optional.\n\nIt started in a 1992 book called Your Money or Your Life. It went mainstream in the 2010s. It spread through Reddit, then podcasts, then TikTok. But the core math hasn't changed.\n\nThe goal isn't to stop working. It's to make sure you never have to.`,
  },
  {
    label: 'The number',
    title: 'Every FIRE plan has a number.',
    body: `Your FIRE number is the total invested assets you need to live indefinitely off the returns.\n\nThe standard formula: multiply your annual expenses by 25.\n\nIf you spend $60,000/year → your FIRE number is $1,500,000.\n\nWhy 25? It comes from the 4% rule — research showing that withdrawing 4% of your portfolio per year has historically sustained a portfolio for 30+ years, across market crashes, recessions, and inflation.\n\nYour number isn't fixed. It changes with your lifestyle, your location, your plans. That's why we ask.`,
  },
  {
    label: 'The path',
    title: 'How you get there.',
    body: `There's no one path to FIRE. But most plans involve some combination of:\n\n— Increasing income (career moves, side income, creative streams)\n— Reducing expenses (intentionally, not deprivation)\n— Investing the gap (index funds, real estate, or both)\n— Time (compound interest rewards patience above all else)\n\nThe women who reach FIRE fastest aren't the ones who earn the most. They're the ones who close the gap between what they earn and what they spend — and invest the difference consistently, for years.`,
  },
  {
    label: 'Why it matters',
    title: 'This isn\'t about retirement. It\'s about options.',
    body: `Most people work because they have to. FIRE is about making work a choice.\n\nWhen your money works harder than you do, you get to decide:\n— Which job to take (or not take)\n— Whether to move abroad\n— When to slow down\n— How to spend your time\n\nFor women especially, financial independence isn't a luxury. It's protection. It's the ability to leave a bad situation, weather a health crisis, care for someone you love, or simply build something of your own — without asking permission or running the numbers in a panic.\n\nThat's what we're building toward.`,
  },
]

function Section({ section, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05 }}
      style={{ marginBottom: '4rem' }}
    >
      <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#4A6A5A', marginBottom: '0.75rem' }}>
        {section.label.toUpperCase()}
      </p>
      <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.2, marginBottom: '1.5rem' }}>
        {section.title}
      </h2>
      {section.body.split('\n\n').map((para, i) => (
        <p key={i} style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem', color: '#C8BFB0', lineHeight: 1.8, marginBottom: '1rem' }}>
          {para}
        </p>
      ))}
    </motion.div>
  )
}

export default function WhatIsFire() {
  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '680px', margin: '0 auto', padding: 'clamp(3rem,8vw,6rem) 1.5rem' }}>

        {/* Back */}
        <Link href="/" style={{ textDecoration: 'none' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4A6A5A', letterSpacing: '0.1em', marginBottom: '3rem', cursor: 'pointer' }}>
            ← back
          </p>
        </Link>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#C8A86B', marginBottom: '1rem' }}>
            THE GUIDE
          </p>
          <h1 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.05, marginBottom: '1.5rem' }}>
            What is FIRE?
          </h1>
          <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#8A9E96', lineHeight: 1.7 }}>
            Financial Independence, Retire Early — and why it matters more for women than anyone else.
          </p>
        </motion.div>

        {/* Sections */}
        {SECTIONS.map((s, i) => <Section key={i} section={s} index={i} />)}

        {/* FIRE types */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} style={{ marginBottom: '4rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#4A6A5A', marginBottom: '0.75rem' }}>
            THE TYPES
          </p>
          <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(22px,3vw,36px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.2, marginBottom: '2rem' }}>
            Not all FIRE looks the same.
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {TYPES.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                style={{ padding: '1.5rem', background: '#141917', borderRadius: '0.75rem', borderLeft: `3px solid ${t.color}` }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '0.75rem' }}>
                  <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: '1.1rem', color: t.color }}>{t.name}</p>
                  <p style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#5a5048' }}>{t.number}</p>
                </div>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.875rem', color: '#C8BFB0', lineHeight: 1.7 }}>{t.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          style={{ borderTop: '1px solid #1C2320', paddingTop: '3rem', textAlign: 'center' }}>
          <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.1rem', color: '#8A9E96', marginBottom: '2rem' }}>
            Ready to find your number?
          </p>
          <Link href="/quiz/fire_type">
            <button className="btn-primary">Start the FIRE Type quiz ✦</button>
          </Link>
        </motion.div>

      </div>
    </div>
  )
}

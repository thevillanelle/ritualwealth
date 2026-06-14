import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { QUIZZES } from '../data/quizzes'

const ATELIER_URL = import.meta.env.VITE_ATELIER_URL ?? 'https://atelier.ritualware.app'

const TILE_META = {
  fire_type: {
    headline: 'What kind of FIRE is yours?',
    sub:      'Lean, Fat, Barista, Coast — find your number.',
    bg:       'linear-gradient(135deg, #1C1A12 0%, #2A2210 100%)',
    accent:   '#C8A86B',
    size:     'large',
  },
  career: {
    headline: 'Career path',
    sub:      'Which track gets you there fastest.',
    bg:       'linear-gradient(135deg, #121C18 0%, #0E2218 100%)',
    accent:   '#6AAD8A',
    size:     'small',
  },
  home: {
    headline: 'Home plan',
    sub:      'Own, rent, or enclave.',
    bg:       'linear-gradient(135deg, #16121C 0%, #200E2A 100%)',
    accent:   '#A89BC4',
    size:     'small',
  },
  creative: {
    headline: 'Creative income',
    sub:      'Build the stream that funds the life.',
    bg:       'linear-gradient(135deg, #1C1218 0%, #2A0E1A 100%)',
    accent:   '#C4717A',
    size:     'small',
  },
  risk: {
    headline: 'Risk tolerance',
    sub:      'How you invest once you have something to invest.',
    bg:       'linear-gradient(135deg, #121618 0%, #0E1E2A 100%)',
    accent:   '#7AB4C8',
    size:     'small',
  },
}

function QuizTile({ quiz, index }) {
  const meta = TILE_META[quiz.slug]
  const isLarge = meta.size === 'large'

  return (
    <Link to={`/quiz/${quiz.slug}`} style={{ textDecoration: 'none', gridColumn: isLarge ? 'span 2' : 'span 1' }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.07 }}
        whileHover={{ scale: 1.015 }}
        style={{
          background: meta.bg,
          border: `1px solid ${meta.accent}22`,
          borderRadius: '1.25rem',
          padding: isLarge ? '2.5rem' : '1.75rem',
          minHeight: isLarge ? '220px' : '160px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          cursor: 'pointer',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Number */}
        <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: meta.accent, marginBottom: isLarge ? '2rem' : '1rem' }}>
          0{index + 1}
        </p>

        {/* Text */}
        <div>
          <h2 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: isLarge ? 'clamp(22px,3vw,32px)' : 'clamp(16px,2vw,20px)',
            fontWeight: 400,
            color: '#F0EDE8',
            lineHeight: 1.2,
            marginBottom: '0.5rem',
          }}>
            {meta.headline}
          </h2>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#8A9E96', lineHeight: 1.5 }}>
            {meta.sub}
          </p>
        </div>

        {/* Arrow */}
        <div style={{
          position: 'absolute', bottom: '1.5rem', right: '1.5rem',
          width: '32px', height: '32px', borderRadius: '50%',
          border: `1px solid ${meta.accent}44`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: meta.accent, fontSize: '0.85rem' }}>→</span>
        </div>

        {/* Subtle glow */}
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '120px', height: '120px', borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.accent}18 0%, transparent 70%)`,
          pointerEvents: 'none',
        }} />
      </motion.div>
    </Link>
  )
}

export default function Welcome() {
  const { user, signInWithGoogle } = useAuthStore()

  return (
    <div className="page" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(3rem,8vw,6rem) 1.5rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '3.5rem' }}>
          <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.25em', color: '#4A6A5A', marginBottom: '1.25rem' }}>
            RITUALWEALTH
          </p>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(36px,6vw,68px)',
            fontWeight: 400,
            lineHeight: 1.05,
            color: '#F0EDE8',
            marginBottom: '1.25rem',
          }}>
            Not sure what kind<br />
            of FIRE is for you?<br />
            <span style={{ fontStyle: 'italic', color: '#C8A86B' }}>Take the quiz.</span>
          </h1>
          <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.15rem', color: '#8A9E96', lineHeight: 1.7, maxWidth: '440px' }}>
            Five quizzes. Ten minutes. A complete FIRE plan.
          </p>
        </motion.div>

        {/* Tile grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '0.75rem',
          marginBottom: '2.5rem',
        }}>
          {QUIZZES.map((q, i) => (
            <QuizTile key={q.slug} quiz={q} index={i} />
          ))}

          {/* Explainer tile */}
          <Link to="/what-is-fire" style={{ textDecoration: 'none', gridColumn: 'span 1' }}>
            <motion.div
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              whileHover={{ scale: 1.015 }}
              style={{
                background: 'linear-gradient(135deg, #0E0C0A 0%, #1A1410 100%)',
                border: '1px solid #C8A86B22',
                borderRadius: '1.25rem',
                padding: '1.75rem',
                minHeight: '160px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#C8A86B' }}>THE GUIDE</p>
              <div>
                <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 'clamp(16px,2vw,20px)', fontWeight: 400, color: '#F0EDE8', lineHeight: 1.2, marginBottom: '0.5rem' }}>
                  New to FIRE?
                </h2>
                <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.8rem', color: '#8A9E96', lineHeight: 1.5 }}>
                  Read the guide before you quiz.
                </p>
              </div>
              <div style={{ position: 'absolute', bottom: '1.5rem', right: '1.5rem', width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #C8A86B44', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#C8A86B', fontSize: '0.85rem' }}>→</span>
              </div>
            </motion.div>
          </Link>
        </div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link to="/quiz/fire_type" style={{ flex: 1, minWidth: '200px' }}>
            <button className="btn-primary" style={{ width: '100%' }}>
              Start with FIRE Type ✦
            </button>
          </Link>
          {user ? (
            <a href={ATELIER_URL} style={{ flex: 1, minWidth: '200px' }}>
              <button className="btn-ghost" style={{ width: '100%' }}>
                Go to m'atelier →
              </button>
            </a>
          ) : (
            <button className="btn-ghost" style={{ flex: 1, minWidth: '200px' }} onClick={signInWithGoogle}>
              Sign in to save results
            </button>
          )}
        </motion.div>

        {user && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A', marginTop: '1.5rem', letterSpacing: '0.1em' }}>
            signed in as {user.email} · results save automatically
          </motion.p>
        )}

      </div>
    </div>
  )
}

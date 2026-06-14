import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/useAuthStore'
import { QUIZZES } from '../data/quizzes'

const ATELIER_URL = import.meta.env.VITE_ATELIER_URL ?? 'https://atelier.ritualware.app'

export default function Welcome() {
  const { user, signInWithGoogle } = useAuthStore()

  return (
    <div className="page">
      <div style={{ maxWidth: '720px', margin: '0 auto', padding: 'clamp(4rem,10vw,8rem) 1.5rem' }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="label" style={{ marginBottom: '1.5rem' }}>Ritualwealth</p>
          <h1 style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(40px,7vw,80px)',
            fontWeight: 400,
            lineHeight: 1.05,
            color: '#F0EDE8',
            marginBottom: '2rem',
          }}>
            Not sure what kind<br />
            of FIRE is for you?<br />
            <span style={{ fontStyle: 'italic', color: '#C8A86B' }}>Take the quiz.</span>
          </h1>
          <p style={{ fontFamily: '"Cormorant Garamond", Georgia, serif', fontStyle: 'italic', fontSize: '1.2rem', color: '#8A9E96', lineHeight: 1.7, maxWidth: '480px', marginBottom: '3.5rem' }}>
            Five quizzes. Ten minutes. A complete FIRE plan — your type, your target, your path.
          </p>
        </motion.div>

        {/* Quiz list */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '3rem' }}>
          {QUIZZES.map((q, i) => (
            <Link key={q.slug} to={`/quiz/${q.slug}`}
              style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ x: 4 }} transition={{ duration: 0.15 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '1.25rem',
                  padding: '1.1rem 1.5rem',
                  background: '#1C2320',
                  border: '1px solid #2A3530',
                  borderRadius: '0.75rem',
                  cursor: 'pointer',
                }}>
                <span style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: q.color, minWidth: '20px' }}>0{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.95rem', color: '#F0EDE8' }}>{q.title}</p>
                  <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.75rem', color: '#8A9E96', marginTop: '0.2rem' }}>{q.questions.length} questions</p>
                </div>
                <span style={{ color: '#2A3530', fontSize: '1rem' }}>→</span>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link to="/quiz/fire_type">
            <button className="btn-primary" style={{ width: '100%', fontSize: '0.85rem' }}>
              Start with FIRE Type ✦
            </button>
          </Link>
          {user ? (
            <a href={ATELIER_URL}>
              <button className="btn-ghost" style={{ width: '100%' }}>
                Go to m'atelier (I already have a plan)
              </button>
            </a>
          ) : (
            <button className="btn-ghost" style={{ width: '100%' }} onClick={signInWithGoogle}>
              Sign in to save your results
            </button>
          )}
        </motion.div>

        {/* Auth state */}
        {user && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#4A6A5A', marginTop: '2rem', letterSpacing: '0.1em' }}>
            signed in as {user.email} · results will save automatically
          </motion.p>
        )}

      </div>
    </div>
  )
}

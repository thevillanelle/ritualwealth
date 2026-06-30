'use client'
import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../stores/useAuthStore'
import NotificationBell from './NotificationBell'
import { goToRobinProfile } from '../lib/supabase/robinHandoff'

function getInitials(user) {
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name
  if (name) {
    const parts = name.trim().split(' ')
    return parts.length >= 2 ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase() : parts[0][0].toUpperCase()
  }
  return user?.email?.[0]?.toUpperCase() || '?'
}

const SUITE = [
  { url: 'https://studio.ritualware.app',  label: "m'atelier",    emoji: '🎨', sub: 'Your studio' },
  { url: 'https://wear.ritualware.app',    label: 'Ritualwear',   emoji: '👗', sub: 'What you wear' },
  { url: 'https://glowup.ritualware.app',  label: 'Glow Up',      emoji: '🔺', sub: 'How you look' },
  { url: 'https://where.ritualware.app',   label: 'Ritualwhere?', emoji: '📍', sub: 'Where you live' },
]

const NAV = [
  { to: '/',           label: 'Home' },
  { to: '/plan',       label: 'My Plan' },
  { to: '/tools/debt', label: 'Debt Payoff' },
]

export default function SuiteNav() {
  const { user, signInWithGoogle, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const initials = getInitials(user)

  return (
    <>
      <div style={{ position: 'fixed', top: '1rem', right: '4rem', zIndex: 40 }}>
        <NotificationBell />
      </div>
      <button
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 40,
          width: '40px', height: '40px', borderRadius: '50%',
          background: user ? 'linear-gradient(135deg, #4A6A5A, #6AAD8A)' : '#1A1C16',
          border: user ? 'none' : '1px solid #2A3530',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'transform 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {user ? (
          <span style={{ color: '#F0EDE8', fontSize: '0.75rem', fontWeight: 700, fontFamily: '"DM Sans", sans-serif' }}>{initials}</span>
        ) : (
          <span style={{ color: '#4A6A5A', fontSize: '1rem' }}>☰</span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ position: 'fixed', inset: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{
                position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
                width: '280px', background: '#0C0B08',
                borderLeft: '1px solid #1A1C16',
                display: 'flex', flexDirection: 'column',
              }}
            >
              {/* Header */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1A1C16', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', letterSpacing: '0.2em', color: '#4A6A5A' }}>RITUALWEALTH</p>
                <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', color: '#3A4A40', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
              </div>

              {/* User */}
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid #1A1C16' }}>
                {user ? (
                  <>
                    <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#F0EDE8', marginBottom: '0.2rem' }}>{user.user_metadata?.full_name || user.email}</p>
                    <p style={{ fontFamily: 'monospace', fontSize: '0.6rem', color: '#4A6A5A' }}>{user.email}</p>
                  </>
                ) : (
                  <button onClick={() => { signInWithGoogle(); setOpen(false) }}
                    style={{ width: '100%', padding: '0.75rem', background: '#1A1C16', border: '1px solid #2A3530', borderRadius: '0.5rem', color: '#F0EDE8', fontFamily: 'monospace', fontSize: '0.65rem', letterSpacing: '0.1em', cursor: 'pointer' }}>
                    Sign in with Google →
                  </button>
                )}
              </div>

              {/* Internal nav */}
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #1A1C16' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: '#2A3530', marginBottom: '0.75rem' }}>THIS APP</p>
                {NAV.map(item => (
                  <Link key={item.to} href={item.to} onClick={() => setOpen(false)}
                    style={{ display: 'block', padding: '0.6rem 0', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#8A9E96', textDecoration: 'none', borderBottom: '1px solid #12140F' }}>
                    {item.label}
                  </Link>
                ))}
                <button onClick={() => { goToRobinProfile(); setOpen(false) }}
                  style={{ display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0', fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#8A9E96', background: 'none', border: 'none', borderBottom: '1px solid #12140F', cursor: 'pointer' }}>
                  My Ritual Profile
                </button>
              </div>

              {/* Suite links */}
              <div style={{ padding: '1rem 1.5rem', flex: 1, overflowY: 'auto' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.5rem', letterSpacing: '0.15em', color: '#2A3530', marginBottom: '0.75rem' }}>RITUALWARE SUITE</p>
                {SUITE.map(app => (
                  <a key={app.url} href={app.url}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0', textDecoration: 'none', borderBottom: '1px solid #12140F' }}>
                    <span style={{ fontSize: '1rem' }}>{app.emoji}</span>
                    <div>
                      <p style={{ fontFamily: '"DM Sans", sans-serif', fontSize: '0.85rem', color: '#8A9E96' }}>{app.label}</p>
                      <p style={{ fontFamily: 'monospace', fontSize: '0.55rem', color: '#3A4A40' }}>{app.sub}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', color: '#2A3530', fontSize: '0.75rem' }}>↗</span>
                  </a>
                ))}
              </div>

              {user && (
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #1A1C16' }}>
                  <button onClick={() => { signOut(); setOpen(false) }}
                    style={{ background: 'none', border: 'none', fontFamily: 'monospace', fontSize: '0.6rem', color: '#3A4A40', cursor: 'pointer', letterSpacing: '0.1em' }}>
                    Sign out
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

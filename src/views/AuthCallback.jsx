'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase/client'

export default function AuthCallback() {
  const router = useRouter()
  useEffect(() => {
    supabase.auth.getSession().then(() => router.push('/'))
  }, [router])
  return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <p style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#4A6A5A' }}>signing in…</p>
    </div>
  )
}

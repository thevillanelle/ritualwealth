import { create } from 'zustand'
import { supabase } from '../lib/supabase/client'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  initialize: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    set({ user: session?.user ?? null, loading: false })
    supabase.auth.onAuthStateChange(async (_e, session) => {
      set({ user: session?.user ?? null })

      if (session?.user) {
        const uid = session.user.id
        const slugs = ['fire_type', 'career', 'home', 'creative', 'risk']
        for (const slug of slugs) {
          const key = `vile_fire_result_${slug}`
          const pending = localStorage.getItem(key)
          if (!pending) continue
          try {
            const { answers, result } = JSON.parse(pending)
            await supabase.from('fire_quiz_results').insert({ user_id: uid, quiz_slug: slug, answers, result })
            if (slug === 'fire_type' && result?.fire_type) {
              await supabase.from('user_fire_plans').upsert({
                user_id: uid,
                fire_type: result.fire_type,
                target_number: result.number,
                source: 'quiz',
                updated_at: new Date().toISOString(),
              })
            }
            localStorage.removeItem(key)
          } catch (e) { console.error(`flush fire_quiz_results (${slug}):`, e) }
        }
      }
    })
  },

  signInWithGoogle: () => supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/auth/callback` },
  }),

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null })
  },
}))

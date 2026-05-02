import { createClient } from '@supabase/supabase-js'

// TODO: Replace with your Supabase credentials
// Get from: https://supabase.com/dashboard/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tknkmdqvxeiwsvzlomva.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_BJFQBg61rvNFVjAH6Z_6vA__ohpNSnB'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export const ensureAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (session?.user) return session.user
  return null
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

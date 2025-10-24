import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase configuration:', {
    url: supabaseUrl ? 'Set' : 'Missing',
    key: supabaseAnonKey ? 'Set' : 'Missing'
  })
  throw new Error('Supabase configuration is missing. Please check your .env file.')
}

if (!supabaseUrl.startsWith('https://')) {
  console.error('Invalid Supabase URL:', supabaseUrl)
  throw new Error('Invalid Supabase URL format. Must start with https://')
}

console.log('🔍 [SUPABASE CONFIG]', {
  url: supabaseUrl ? '✅ Set' : '❌ Missing',
  key: supabaseAnonKey ? '✅ Set' : '❌ Missing',
  urlLength: supabaseUrl.length,
  keyLength: supabaseAnonKey.length
})

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
    debug: true, // Debug aktivieren
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: `sb-${supabaseUrl.split('//')[1].split('.')[0]}-auth-token`
  }
})

// Test der Auth-Funktionalität beim Initialisieren
if (typeof window !== 'undefined') {
  supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('🔍 [SUPABASE INIT] Session check:', {
      hasSession: !!session,
      user: session?.user?.email,
      expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'No expiry'
    })
  }).catch(error => {
    console.error('🔍 [SUPABASE INIT] Session check failed:', error)
  })
}

// Database types
export interface User {
  id: string
  email: string
  password_hash: string
  salt: string
  display_name?: string
  is_admin?: boolean
  payment_status?: 'pending' | 'paid' | 'expired' | 'free' | 'trial'
  trial_expires_at?: string
  created_at: string
  last_login?: string
}

export interface GradeProfile {
  id: string
  user_id: string
  name: string
  main_tasks: any[]
  sub_tasks: any[]
  use_sub_tasks: boolean
  created_at: string
  updated_at: string
}

export interface TodoItem {
  id: string
  user_id: string
  text: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  due_date?: string
  category: string
  created_at: string
  completed_at?: string
}
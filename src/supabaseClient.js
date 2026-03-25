import { createClient } from '@supabase/supabase-js'

// Pegue esses dados no seu painel do Supabase (Settings > API)
const supabaseUrl = 'PEGAR A KEY NO SUPABASE'
const supabaseAnonKey = 'PEGAR A KEY NO SUPABASE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
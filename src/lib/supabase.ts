import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.https://alkreorzcgvtnllbfknz.supabase.co
const supabaseAnonKey = process.env.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa3Jlb3J6Y2d2dG5sbGJma256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjI3OTgsImV4cCI6MjA4NjczODc5OH0.juR53i3c_6KnBvOyx_iZv-tyAaHC_yeNb4qhsriEeVE

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

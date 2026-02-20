import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://alkreorzcgvtnllbfknz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa3Jlb3J6Y2d2dG5sbGJma256Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExNjI3OTgsImV4cCI6MjA4NjczODc5OH0.juR53i3c_6KnBvOyx_iZv-tyAaHC_yeNb4qhsriEeVE'
)

export const supabaseAdmin = createClient(
  'https://alkreorzcgvtnllbfknz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFsa3Jlb3J6Y2d2dG5sbGJma256Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTE2Mjc5OCwiZXhwIjoyMDg2NzM4Nzk4fQ.0gkmr1JPfdkQVqYEpvt52LDCSocJdvzWKaWSiFiR068'
)

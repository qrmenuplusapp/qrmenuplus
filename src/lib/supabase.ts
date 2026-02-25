import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://njgxkydxyipqliqdcqzz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3hreWR4eWlwcWxpcWRjcXp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwMDI0MzUsImV4cCI6MjA4NzU3ODQzNX0.qiFD13yyDlw-b7-Bwse0ra9jBL-SP1dMNRIa6Udvz7o'
)

export const supabaseAdmin = createClient(
  'https://njgxkydxyipqliqdcqzz.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5qZ3hreWR4eWlwcWxpcWRjcXp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjAwMjQzNSwiZXhwIjoyMDg3NTc4NDM1fQ.KxhQiJ80pMANW-5Oio5llyjsZTUJElgDFmIJu_zcoJw'
)

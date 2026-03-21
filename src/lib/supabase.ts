import { createClient } from "@supabase/supabase-js"

const url = import.meta.env.VITE_SUPABASE_URL
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.warn(
    "[ChartSense] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing — add them to .env.local"
  )
}

export const supabase = createClient(url ?? "", anon ?? "")

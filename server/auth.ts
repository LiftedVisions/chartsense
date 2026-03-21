import { createClient } from "@supabase/supabase-js"

function supabaseUrl(): string | undefined {
  return (
    process.env.SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim()
  )
}

function supabaseAnonKey(): string | undefined {
  return (
    process.env.SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim()
  )
}

/** Validates Bearer JWT and returns the Supabase user id, or null if invalid. */
export async function getUserIdFromAuthHeader(
  authHeader: string | undefined
): Promise<string | null> {
  if (!authHeader?.startsWith("Bearer ")) return null
  const jwt = authHeader.slice(7).trim()
  if (!jwt) return null

  const url = supabaseUrl()
  const anon = supabaseAnonKey()
  if (!url || !anon) {
    throw new Error(
      "Supabase is not configured (set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, or SUPABASE_* on the server)"
    )
  }

  const supabase = createClient(url, anon)
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(jwt)

  if (error || !user) return null
  return user.id
}

import { getSupabase } from './supabase'

// Supabase-based rate limiter (works across Vercel serverless instances)
export async function checkRateLimit(key: string, maxRequests = 30, windowSeconds = 60): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = getSupabase()

  const { data, error } = await supabase.rpc('check_rate_limit', {
    p_key: key,
    p_max: maxRequests,
    p_window_seconds: windowSeconds,
  })

  if (error) {
    // If RPC fails (e.g., table doesn't exist), allow the request
    return { allowed: true, remaining: maxRequests }
  }

  return { allowed: data === true, remaining: data === true ? maxRequests - 1 : 0 }
}

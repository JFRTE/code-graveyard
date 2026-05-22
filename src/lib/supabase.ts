// Lazy Supabase client - only creates a real client when env vars are available
// During build time (no env vars), returns a no-op proxy that won't hang

let _supabase: any = null

function createMockClient(): any {
  // Create a chainable mock that always resolves with empty data
  const chainable: any = new Proxy({}, {
    get(target, prop) {
      if (prop === 'then') {
        // Make it thenable - resolves with empty data
        return (resolve: any) => resolve({ data: [], error: null, count: 0 })
      }
      if (prop === 'single') {
        return () => Promise.resolve({ data: null, error: null })
      }
      // All other methods return the chainable itself
      return () => chainable
    }
  })

  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'from') {
        return () => chainable
      }
      if (prop === 'rpc') {
        return () => Promise.resolve({ data: null, error: null })
      }
      return () => Promise.resolve({ data: null, error: null })
    }
  })
}

export function getSupabase() {
  if (_supabase) return _supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return createMockClient()
  }

  const { createClient } = require('@supabase/supabase-js')
  _supabase = createClient(url, key)
  return _supabase
}

// Lazy Supabase client - only creates a real client when env vars are available
let _supabase: any = null

function createMockClient(): any {
  // Create a fully chainable mock that resolves with empty data
  const mock: any = new Proxy(function() {}, {
    apply: () => {
      return mock
    },
    get(target, prop) {
      if (prop === 'then') {
        return (resolve: any) => resolve({ data: [], error: null, count: 0 })
      }
      if (prop === 'single') {
        return () => ({ then: (resolve: any) => resolve({ data: null, error: null }) })
      }
      // Every other property returns a function that returns the mock
      return () => mock
    }
  })

  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'from') {
        return () => mock
      }
      if (prop === 'rpc') {
        return () => ({ then: (resolve: any) => resolve({ data: null, error: null }) })
      }
      return () => ({ then: (resolve: any) => resolve({ data: null, error: null }) })
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

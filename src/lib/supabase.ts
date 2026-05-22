// Lazy Supabase client - only creates a real client when env vars are available
// During build time (no env vars), returns a no-op proxy that won't hang

let _supabase: any = null

function createMockClient(): any {
  // Return a proxy that chains methods and returns empty results
  const handler: ProxyHandler<any> = {
    get(target, prop) {
      if (prop === 'from') {
        return () => new Proxy({}, {
          get(_, method) {
            if (method === 'select') return () => new Proxy({}, {
              get(_, m2) {
                if (m2 === 'eq' || m2 === 'order' || m2 === 'range' || m2 === 'single') return () => Promise.resolve({ data: [], error: null, count: 0 })
                if (m2 === 'then') return (resolve: any) => resolve({ data: [], error: null, count: 0 })
                return () => Promise.resolve({ data: [], error: null, count: 0 })
              }
            })
            if (method === 'insert') return () => new Proxy({}, {
              get(_, m2) {
                if (m2 === 'select') return () => new Proxy({}, {
                  get(_, m3) {
                    if (m3 === 'single') return () => Promise.resolve({ data: null, error: null })
                    return () => Promise.resolve({ data: [], error: null })
                  }
                })
                return () => Promise.resolve({ data: null, error: null })
              }
            })
            if (method === 'delete') return () => new Proxy({}, {
              get(_, m2) {
                if (m2 === 'eq') return () => Promise.resolve({ data: null, error: null })
                return () => Promise.resolve({ data: null, error: null })
              }
            })
            return () => Promise.resolve({ data: [], error: null, count: 0 })
          }
        })
      }
      if (prop === 'rpc') return () => Promise.resolve({ data: null, error: null })
      return () => Promise.resolve({ data: null, error: null })
    }
  }
  return new Proxy({}, handler)
}

export function getSupabase() {
  if (_supabase) return _supabase

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Return mock client during build time - won't make any HTTP requests
    return createMockClient()
  }

  const { createClient } = require('@supabase/supabase-js')
  _supabase = createClient(url, key)
  return _supabase
}

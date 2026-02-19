import { createBrowserClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

// Build-time mock that returns chainable query builder methods
const createBuildTimeMock = (): SupabaseClient => {
  const chainable = (): unknown => ({
    select: chainable,
    eq: chainable,
    neq: chainable,
    gt: chainable,
    gte: chainable,
    lt: chainable,
    lte: chainable,
    like: chainable,
    ilike: chainable,
    is: chainable,
    in: chainable,
    contains: chainable,
    containedBy: chainable,
    range: chainable,
    textSearch: chainable,
    not: chainable,
    or: chainable,
    filter: chainable,
    order: chainable,
    limit: chainable,
    single: chainable,
    maybeSingle: chainable,
    insert: chainable,
    update: chainable,
    upsert: chainable,
    delete: chainable,
    then: (resolve: (v: { data: []; error: null; count: 0 }) => void) =>
      resolve({ data: [], error: null, count: 0 }),
  })

  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Not available during build' } }),
      signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Not available during build' } }),
      signOut: async () => ({ error: null }),
      resetPasswordForEmail: async () => ({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: chainable,
    rpc: async () => ({ data: null, error: null }),
  } as unknown as SupabaseClient
}

export const createClient = (): SupabaseClient => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    return createBuildTimeMock()
  }

  // Use createBrowserClient from @supabase/ssr to properly sync session with cookies
  // This ensures the middleware can read the session for auth checks
  return createBrowserClient(url, key)
}

// Runtime-only singleton - uses Object.defineProperty to defer evaluation
let _supabase: SupabaseClient | undefined

export const getSupabase = (): SupabaseClient => {
  if (!_supabase) {
    _supabase = createClient()
  }
  return _supabase
}

// For backwards compatibility: proxy that defers to getSupabase() at access time
// This ensures the real client is created at runtime, not build time
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_, prop: string) {
    const client = getSupabase()
    const value = client[prop as keyof SupabaseClient]
    if (typeof value === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return (value as Function).bind(client)
    }
    return value
  },
})

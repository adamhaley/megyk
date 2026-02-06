import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During build time, env vars may not be available
  // Return a placeholder that will be replaced at runtime
  if (!url || !key) {
    // Return a mock client for build time - actual client created at runtime
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        signInWithPassword: async () => ({ data: { user: null, session: null }, error: { message: 'Not available during build' } }),
        signUp: async () => ({ data: { user: null, session: null }, error: { message: 'Not available during build' } }),
        signOut: async () => ({ error: null }),
        resetPasswordForEmail: async () => ({ error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      },
      from: () => ({
        select: () => ({ data: [], error: null, eq: () => ({ data: [], error: null }) }),
      }),
      rpc: async () => ({ data: null, error: null }),
    } as unknown as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}

// Lazy singleton for backwards compatibility with `import { supabase }`
let _instance: ReturnType<typeof createBrowserClient> | null = null

function getInstance() {
  if (!_instance) {
    _instance = createClient()
  }
  return _instance
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = new Proxy({} as any, {
  get(_, prop) {
    const instance = getInstance()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (instance as any)[prop]
    if (typeof value === 'function') {
      return value.bind(instance)
    }
    return value
  }
}) as ReturnType<typeof createBrowserClient>

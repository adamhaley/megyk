import { createBrowserClient } from '@supabase/ssr'

export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
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

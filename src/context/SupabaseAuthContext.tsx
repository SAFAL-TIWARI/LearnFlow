import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

const SupabaseContext = createContext({ user: null })

export const SupabaseProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
  }, [])

  return (
    <SupabaseContext.Provider value={{ user }}>
      {children}
    </SupabaseContext.Provider>
  )
}

export const useSupabase = () => useContext(SupabaseContext)

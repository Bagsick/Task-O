import { Session } from '@supabase/supabase-js'
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react'

import { devError, devLog } from '../lib/devLog'
import { supabase } from '../lib/supabase'

type SessionContextValue = {
  session: Session | null
  loading: boolean
}

const SessionContext = createContext<SessionContextValue>({
  session: null,
  loading: true,
})

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (mounted) {
          devLog('auth', 'initial session loaded', {
            hasSession: !!data.session,
            userId: data.session?.user?.id,
          })
          setSession(data.session)
          setLoading(false)
        }
      })
      .catch(error => {
        devError('auth', 'failed to read initial session', error)
        if (mounted) {
          setLoading(false)
        }
      })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      devLog('auth', 'auth state changed', {
        event,
        hasSession: !!nextSession,
        userId: nextSession?.user?.id,
      })
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      loading,
    }),
    [session, loading],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  return useContext(SessionContext)
}
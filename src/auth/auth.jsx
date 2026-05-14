import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'artifacterp.session'

const defaultSession = {
  user: {
    name: 'Invitado',
  },
  role: 3,
}

const AuthContext = createContext({
  session: null,
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return defaultSession
    }

    try {
      return JSON.parse(stored)
    } catch {
      return defaultSession
    }
  })

  const signIn = async () => {
    setSession({
      user: {
        name: 'Admin Demo',
      },
      role: 0,
    })
  }

  const signOut = async () => {
    setSession(defaultSession)
  }

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  }, [session])

  const value = useMemo(
    () => ({
      session,
      signIn,
      signOut,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSession() {
  return useContext(AuthContext)
}

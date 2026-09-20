import { createContext, useContext, useEffect, useState } from 'react'
import { setAuthToken, setUnauthorizedHandler } from '../services/api'
import * as authApi from '../services/auth'

const AuthContext = createContext(null)

const STORAGE_KEY = 'ktrip-auth'

export function AuthProvider({ children }) {
  // { user: {id, email, nickname}, token: string } | null
  const [session, setSession] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  // Keep the shared api.js token in sync with whatever session is active,
  // and clear the session automatically if any request comes back 401
  // (expired/invalid token) so isLoggedIn always reflects reality.
  useEffect(() => {
    setAuthToken(session?.token || null)
  }, [session])

  useEffect(() => {
    setUnauthorizedHandler(() => setSession(null))
    return () => setUnauthorizedHandler(null)
  }, [])

  useEffect(() => {
    try {
      if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* storage unavailable — session lives in memory only */
    }
  }, [session])

  const login = async ({ email, password }) => {
    const { access_token } = await authApi.login({ email, password })
    setSession({ user: { email }, token: access_token })
  }

  const signup = async ({ email, nickname, password }) => {
    const user = await authApi.signup({ email, nickname, password })
    // POST /auth/signup returns the created user but no token (see auth.py) —
    // log in immediately after with the same credentials to start a session.
    const { access_token } = await authApi.login({ email, password })
    setSession({ user, token: access_token })
  }

  const logout = () => setSession(null)

  return (
    <AuthContext.Provider
      value={{ user: session?.user || null, isLoggedIn: !!session, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

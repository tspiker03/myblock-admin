import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import axios from 'axios'
import { clearTokens, getToken, setTokens } from '../api/client'

export interface AuthUser {
  id: string
  username: string
  displayName: string
  role: 'student' | 'facilitator' | 'school_admin' | 'admin'
}

interface AuthContextValue {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(getToken)

  // On mount, restore user from localStorage if token exists
  useEffect(() => {
    const stored = localStorage.getItem('myblock_user')
    if (stored && token) {
      try {
        setUser(JSON.parse(stored))
      } catch {
        clearTokens()
        setToken(null)
      }
    }
  }, [])

  async function login(username: string, password: string) {
    const { data } = await axios.post('/api/v1/auth/login', { username, password })
    const { token: newToken, refreshToken, user: newUser } = data
    setTokens(newToken, refreshToken)
    localStorage.setItem('myblock_user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
  }

  function logout() {
    clearTokens()
    localStorage.removeItem('myblock_user')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated: !!token && !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

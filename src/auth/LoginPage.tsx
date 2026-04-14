import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard', { replace: true })
    } catch {
      setError('Invalid username or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f6fa]">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <h1
            className="text-4xl font-bold mb-1"
            style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
          >
            MyBlock
          </h1>
          <p className="text-gray-500 text-sm">Facilitator Admin Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-8">
          <h2
            className="text-xl font-semibold mb-6 text-gray-800"
            style={{ fontFamily: "'Nunito', sans-serif" }}
          >
            Sign in to your account
          </h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
                style={{ '--tw-ring-color': '#4DA6FF' } as React.CSSProperties}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg text-white font-semibold text-sm transition disabled:opacity-60"
              style={{ backgroundColor: loading ? '#2a4d9e' : '#1A3A7D' }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget.style.backgroundColor = '#122960')
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget.style.backgroundColor = '#1A3A7D')
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

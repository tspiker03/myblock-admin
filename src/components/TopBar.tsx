import { Menu } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

interface TopBarProps {
  pageTitle: string
  onMenuClick: () => void
}

export function TopBar({ pageTitle, onMenuClick }: TopBarProps) {
  const { user } = useAuth()

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-1.5 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <h2
        className="text-lg font-semibold flex-1"
        style={{ color: '#1A3A7D', fontFamily: "'Nunito', sans-serif" }}
      >
        {pageTitle}
      </h2>

      <span className="text-sm text-gray-500 hidden sm:block">
        {user?.displayName ?? 'Facilitator'}
      </span>
    </header>
  )
}

import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  BarChart2,
  Settings,
  LogOut,
  Gift,
} from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number
}

interface SidebarProps {
  pendingApprovals?: number
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ pendingApprovals = 0, isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    {
      to: '/approvals',
      label: 'Approval Queue',
      icon: <ClipboardCheck size={20} />,
      badge: pendingApprovals > 0 ? pendingApprovals : undefined,
    },
    { to: '/students', label: 'Students', icon: <Users size={20} /> },
    { to: '/reports', label: 'Reports', icon: <BarChart2 size={20} /> },
    ...(user?.role === 'admin'
      ? [{ to: '/sponsors', label: 'Sponsors', icon: <Gift size={20} /> }]
      : []),
    { to: '/settings', label: 'Settings', icon: <Settings size={20} /> },
  ]

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  const activeStyle = {
    backgroundColor: '#2a4d9e',
    color: '#ffffff',
  }

  const inactiveStyle = {
    color: '#93b4e8',
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full z-30 flex flex-col
          transition-transform duration-200
          lg:relative lg:translate-x-0 lg:z-auto
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: 240, backgroundColor: '#1A3A7D' }}
      >
        {/* Logo */}
        <div className="px-6 py-5 border-b border-white/10">
          <h1
            className="text-white text-2xl"
            style={{ fontFamily: "'Lilita One', cursive" }}
          >
            MyBlock
          </h1>
          <p className="text-blue-200 text-xs mt-0.5">Admin Dashboard</p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={({ isActive }) => (isActive ? activeStyle : inactiveStyle)}
            >
              {item.icon}
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && (
                <span className="bg-[#FF6B6B] text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-[#4DA6FF] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
              {user?.displayName?.[0]?.toUpperCase() ?? 'F'}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">
                {user?.displayName ?? 'Facilitator'}
              </p>
              <p className="text-blue-300 text-xs capitalize">{user?.role ?? ''}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-blue-300 hover:text-white text-sm transition-colors w-full px-1 py-1"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

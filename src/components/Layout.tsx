import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { getDashboard } from '../api/facilitator'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/approvals': 'Approval Queue',
  '/students': 'Students',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function getPageTitle(pathname: string): string {
  if (pathname.startsWith('/students/')) return 'Student Detail'
  return PAGE_TITLES[pathname] ?? 'MyBlock Admin'
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const location = useLocation()

  useEffect(() => {
    getDashboard()
      .then((data) => setPendingApprovals(data.approvalQueueCount))
      .catch(() => { /* non-critical — badge stays at 0 */ })
  }, []) // fetch once on mount — approval queue page updates its own count

  return (
    <div className="flex h-screen overflow-hidden bg-[#f5f6fa]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        pendingApprovals={pendingApprovals}
      />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar
          pageTitle={getPageTitle(location.pathname)}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

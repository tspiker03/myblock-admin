import { useEffect, useState } from 'react'
import { Building2, Mail, Phone, Globe, Calendar, Package, DollarSign, CheckCircle, XCircle, PauseCircle } from 'lucide-react'
import {
  getSponsors,
  approveSponsor,
  rejectSponsor,
  getPendingPrizes,
  approvePrize,
  type Sponsor,
  type Prize,
} from '../api/admin'

// ── Shared helpers ────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="py-16 text-center text-gray-400">
      <Package size={40} className="mx-auto mb-3 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ── Tab navigation ────────────────────────────────────────────────────────────

type Tab = 'pending' | 'active' | 'prizes'

const TABS: { id: Tab; label: string }[] = [
  { id: 'pending', label: 'Pending Sponsors' },
  { id: 'active', label: 'Active Sponsors' },
  { id: 'prizes', label: 'Pending Prizes' },
]

// ── Pending Sponsors ──────────────────────────────────────────────────────────

function PendingSponsorsTab() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  // Track IDs being animated out
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  useEffect(() => {
    getSponsors({ status: 'pending' })
      .then((res) => setSponsors(res.sponsors))
      .catch(() => setError('Failed to load pending sponsors.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleAction(id: string, action: 'approve' | 'reject') {
    setActing(id)
    try {
      if (action === 'approve') await approveSponsor(id)
      else await rejectSponsor(id)

      // Animate out then remove
      setRemoving((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setSponsors((prev) => prev.filter((s) => s._id !== id))
        setRemoving((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, 300)
    } catch {
      setError(`Failed to ${action} sponsor. Please try again.`)
    } finally {
      setActing(null)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorBanner message={error} />
  if (sponsors.length === 0) return <EmptyState message="No pending sponsor applications." />

  return (
    <div className="space-y-4">
      {sponsors.map((s) => (
        <div
          key={s._id}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all duration-300"
          style={removing.has(s._id) ? { opacity: 0, transform: 'translateX(12px)' } : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-800 text-base">{s.businessName}</h3>
              <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  {s.contactName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {s.contactEmail}
                </span>
                {s.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone size={14} />
                    {s.phone}
                  </span>
                )}
                {s.website && (
                  <a
                    href={s.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-[#4DA6FF] hover:underline"
                  >
                    <Globe size={14} />
                    {s.website.replace(/^https?:\/\//, '')}
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  Applied {formatDate(s.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button
                onClick={() => handleAction(s._id, 'approve')}
                disabled={acting === s._id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
              >
                <CheckCircle size={15} />
                Approve
              </button>
              <button
                onClick={() => handleAction(s._id, 'reject')}
                disabled={acting === s._id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
              >
                <XCircle size={15} />
                Reject
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Active Sponsors ───────────────────────────────────────────────────────────

function ActiveSponsorsTab() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)

  useEffect(() => {
    getSponsors({ status: 'approved' })
      .then((res) => setSponsors(res.sponsors))
      .catch(() => setError('Failed to load active sponsors.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSuspend(id: string) {
    setActing(id)
    try {
      await rejectSponsor(id) // using reject as suspend placeholder
      setSponsors((prev) => prev.filter((s) => s._id !== id))
    } catch {
      setError('Failed to suspend sponsor. Please try again.')
    } finally {
      setActing(null)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorBanner message={error} />
  if (sponsors.length === 0) return <EmptyState message="No active sponsors." />

  return (
    <div className="space-y-4">
      {sponsors.map((s) => (
        <div key={s._id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-800 text-base">{s.businessName}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                  Active
                </span>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  {s.contactName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail size={14} />
                  {s.contactEmail}
                </span>
                {s.schoolIds.length > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Building2 size={14} />
                    {s.schoolIds.length} school{s.schoolIds.length !== 1 ? 's' : ''}
                  </span>
                )}
                {s.approvedAt && (
                  <span className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    Approved {formatDate(s.approvedAt)}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleSuspend(s._id)}
              disabled={acting === s._id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              <PauseCircle size={15} />
              Suspend
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Pending Prizes ────────────────────────────────────────────────────────────

function PendingPrizesTab() {
  const [prizes, setPrizes] = useState<Prize[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [acting, setActing] = useState<string | null>(null)
  const [removing, setRemoving] = useState<Set<string>>(new Set())

  useEffect(() => {
    getPendingPrizes()
      .then(setPrizes)
      .catch(() => setError('Failed to load pending prizes.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleApprove(id: string) {
    setActing(id)
    try {
      await approvePrize(id)
      setRemoving((prev) => new Set(prev).add(id))
      setTimeout(() => {
        setPrizes((prev) => prev.filter((p) => p._id !== id))
        setRemoving((prev) => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }, 300)
    } catch {
      setError('Failed to approve prize. Please try again.')
    } finally {
      setActing(null)
    }
  }

  if (loading) return <LoadingSkeleton />
  if (error) return <ErrorBanner message={error} />
  if (prizes.length === 0) return <EmptyState message="No prizes awaiting approval." />

  return (
    <div className="space-y-4">
      {prizes.map((p) => (
        <div
          key={p._id}
          className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 transition-all duration-300"
          style={removing.has(p._id) ? { opacity: 0, transform: 'translateX(12px)' } : undefined}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-800 text-base">{p.name}</h3>
                <span
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: '#e8eef9', color: '#1A3A7D' }}
                >
                  Tier {p.tier}
                </span>
              </div>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{p.description}</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <DollarSign size={14} />
                  ${p.estimatedValue.toLocaleString()} est. value
                </span>
                <span className="flex items-center gap-1.5">
                  <Package size={14} />
                  {p.deliveryMethod}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 size={14} />
                  {p.sponsorId.businessName}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar size={14} />
                  {formatDate(p.createdAt)}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleApprove(p._id)}
              disabled={acting === p._id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors flex-shrink-0"
            >
              <CheckCircle size={15} />
              Approve
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="h-5 w-48 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-72 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  )
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{message}</div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SponsorsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('pending')

  return (
    <div>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
      >
        Sponsors
      </h2>

      {/* Tab bar */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            style={activeTab === tab.id ? { backgroundColor: '#1A3A7D' } : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pending' && <PendingSponsorsTab />}
      {activeTab === 'active' && <ActiveSponsorsTab />}
      {activeTab === 'prizes' && <PendingPrizesTab />}
    </div>
  )
}

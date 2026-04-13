import { useEffect, useState } from 'react'
import {
  ClipboardCheck,
  Zap,
  Target,
  Bell,
  AlertTriangle,
  Users,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { StatCard } from '../components/StatCard'
import { getDashboard, getAlerts } from '../api/facilitator'
import type { DashboardData, Alert, TeamStanding } from '../api/facilitator'

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="w-11 h-11 rounded-lg bg-gray-200 flex-shrink-0" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 bg-gray-200 rounded w-24" />
          <div className="h-7 bg-gray-200 rounded w-12" />
        </div>
      </div>
    </div>
  )
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className ?? ''}`} />
}

// ── Team Standings ────────────────────────────────────────────────────────────

const BAR_COLORS = [
  '#3B82F6', '#22C55E', '#EAB308', '#A855F7',
  '#F97316', '#EF4444', '#4DA6FF', '#1A3A7D',
]

function TeamStandingsCard({ standings }: { standings: TeamStanding[] }) {
  if (standings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400 text-sm">No team data yet.</div>
    )
  }

  const sorted = [...standings].sort((a, b) => b.totalTeamPoints - a.totalTeamPoints)
  const max = sorted[0].totalTeamPoints || 1

  return (
    <div className="space-y-3">
      {sorted.map((team, i) => {
        const pct = Math.max(4, Math.round((team.totalTeamPoints / max) * 100))
        const color = BAR_COLORS[i % BAR_COLORS.length]
        return (
          <div key={team.teamId} className="flex items-center gap-3">
            <span className="text-xs font-bold text-gray-400 w-4 text-right flex-shrink-0">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold text-gray-700 truncate">
                  {team.teamName}
                </span>
                <span className="text-sm font-bold flex-shrink-0 ml-2" style={{ color }}>
                  {team.totalTeamPoints.toLocaleString()} pts
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Alerts Panel ──────────────────────────────────────────────────────────────

function AlertRow({ alert }: { alert: Alert }) {
  if (alert.type === 'inactive_student') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Users size={16} className="text-orange-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">
            {alert.username}
          </p>
          <p className="text-xs text-orange-600 mt-0.5">
            Inactive for {alert.daysSinceActive} {alert.daysSinceActive === 1 ? 'day' : 'days'}
          </p>
        </div>
        <span className="ml-auto text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-0.5 rounded-full self-start flex-shrink-0">
          Inactive
        </span>
      </div>
    )
  }

  if (alert.type === 'team_imbalance') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <AlertTriangle size={16} className="text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Team imbalance detected</p>
          <p className="text-xs text-red-600 mt-0.5">
            {alert.leadTeam} is {alert.ratio.toFixed(1)}× ahead of {alert.trailTeam}
          </p>
        </div>
        <span className="ml-auto text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full self-start flex-shrink-0">
          Imbalance
        </span>
      </div>
    )
  }

  if (alert.type === 'stale_queue') {
    return (
      <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
        <div className="w-8 h-8 rounded-lg bg-[#FF6B6B]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Clock size={16} className="text-[#FF6B6B]" />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-700">Stale approval queue</p>
          <p className="text-xs text-[#FF6B6B] mt-0.5">
            {alert.count} {alert.count === 1 ? 'submission' : 'submissions'} pending over 3 days
          </p>
        </div>
        <span className="ml-auto text-xs bg-[#FF6B6B]/10 text-[#FF6B6B] font-semibold px-2 py-0.5 rounded-full self-start flex-shrink-0">
          Stale
        </span>
      </div>
    )
  }

  return null
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const [dashData, alertData] = await Promise.all([getDashboard(), getAlerts()])
      setDashboard(dashData)
      setAlerts(alertData.alerts)
    } catch {
      setError('Failed to load dashboard data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3A7D] text-white text-sm font-semibold rounded-lg hover:bg-[#2a4d9e] transition-colors"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <div>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
      >
        Dashboard
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          <>
            <StatCard
              icon={<ClipboardCheck size={20} />}
              label="Pending Approvals"
              value={dashboard?.approvalQueueCount ?? 0}
              accentColor={dashboard && dashboard.approvalQueueCount > 0 ? '#FF6B6B' : '#4DA6FF'}
              highlight={!!dashboard && dashboard.approvalQueueCount > 0}
              linkTo="/approvals"
            />
            <StatCard
              icon={<Target size={20} />}
              label="Missions This Week"
              value={dashboard?.weeklyMissionCount ?? 0}
              accentColor="#4DA6FF"
            />
            <StatCard
              icon={<Zap size={20} />}
              label="Quick Reps This Week"
              value={dashboard?.weeklyQuickRepCount ?? 0}
              accentColor="#22C55E"
            />
            <StatCard
              icon={<Bell size={20} />}
              label="Active Alerts"
              value={dashboard?.alertCount ?? 0}
              accentColor={dashboard && dashboard.alertCount > 0 ? '#FF6B6B' : '#4DA6FF'}
              highlight={!!dashboard && dashboard.alertCount > 0}
            />
          </>
        )}
      </div>

      {/* Middle + bottom rows */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Team Standings */}
        <div className="lg:col-span-3 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3
            className="text-lg font-bold mb-5"
            style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
          >
            Team Standings
          </h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="space-y-1.5">
                  <div className="flex justify-between">
                    <SkeletonBlock className="h-3 w-28" />
                    <SkeletonBlock className="h-3 w-16" />
                  </div>
                  <SkeletonBlock className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : (
            <TeamStandingsCard standings={dashboard?.teamStandings ?? []} />
          )}
        </div>

        {/* Alerts Panel */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3
            className="text-lg font-bold mb-4"
            style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
          >
            Alerts
          </h3>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="flex items-start gap-3 py-1">
                  <SkeletonBlock className="w-8 h-8 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-1.5 pt-1">
                    <SkeletonBlock className="h-3 w-32" />
                    <SkeletonBlock className="h-3 w-48" />
                  </div>
                </div>
              ))}
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">✓</p>
              <p className="text-sm text-gray-400">No active alerts</p>
            </div>
          ) : (
            <div>
              {alerts.map((alert, i) => (
                <AlertRow key={i} alert={alert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

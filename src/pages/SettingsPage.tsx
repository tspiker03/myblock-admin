import { useEffect, useState } from 'react'
import { useAuth } from '../auth/AuthContext'
import { ToggleSwitch } from '../components/ToggleSwitch'
import {
  getNotificationPrefs,
  updateNotificationPrefs,
  type NotificationPrefs,
  type NotificationChannel,
} from '../api/settings'

// ── Notification Preferences ──────────────────────────────────────────────────

type PrefKey = keyof NotificationPrefs

interface ReminderRow {
  key: PrefKey
  label: string
  description: string
}

const REMINDER_ROWS: ReminderRow[] = [
  {
    key: 'mondayLaunch',
    label: 'Monday Launch',
    description: 'New mission week begins',
  },
  {
    key: 'thursdayQueue',
    label: 'Thursday Queue Reminder',
    description: 'Pending submissions need review',
  },
  {
    key: 'fridaySlideshow',
    label: 'Friday Slideshow',
    description: 'Weekly results are ready',
  },
]

function NotificationPrefsCard() {
  const [prefs, setPrefs] = useState<NotificationPrefs | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getNotificationPrefs()
      .then(setPrefs)
      .catch(() => setError('Failed to load notification preferences.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(key: PrefKey, channel: keyof NotificationChannel, value: boolean) {
    if (!prefs) return

    // Optimistic update
    const previous = prefs
    const updated: NotificationPrefs = {
      ...prefs,
      [key]: { ...prefs[key], [channel]: value },
    }
    setPrefs(updated)

    try {
      await updateNotificationPrefs({ [key]: updated[key] })
    } catch {
      // Rollback on error
      setPrefs(previous)
      setError('Failed to save preference. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-base font-semibold text-gray-700 mb-4">Weekly Reminders</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-700 mb-1">Weekly Reminders</h3>
      <p className="text-xs text-gray-400 mb-5">
        Choose how you want to be notified for each weekly event.
      </p>

      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>
      )}

      <div className="divide-y divide-gray-100">
        {/* Header row */}
        <div className="flex items-center pb-2">
          <div className="flex-1" />
          <div className="flex gap-8 pr-1">
            <span className="text-xs font-medium text-gray-500 w-12 text-center">Push</span>
            <span className="text-xs font-medium text-gray-500 w-12 text-center">Email</span>
          </div>
        </div>

        {REMINDER_ROWS.map(({ key, label, description }) => (
          <div key={key} className="flex items-center py-4">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800">{label}</p>
              <p className="text-xs text-gray-400">{description}</p>
            </div>
            <div className="flex gap-8 pr-1">
              <div className="w-12 flex justify-center">
                <ToggleSwitch
                  checked={prefs?.[key]?.push ?? false}
                  onChange={(v) => handleToggle(key, 'push', v)}
                  label={`${label} push notification`}
                />
              </div>
              <div className="w-12 flex justify-center">
                <ToggleSwitch
                  checked={prefs?.[key]?.email ?? false}
                  onChange={(v) => handleToggle(key, 'email', v)}
                  label={`${label} email notification`}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Class Mode ────────────────────────────────────────────────────────────────

function ClassModeCard() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-700 mb-1">Class Mode</h3>
      <p className="text-xs text-gray-400 mb-5">Current classroom configuration.</p>

      <div className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold"
          style={{ backgroundColor: '#e8eef9', color: '#1A3A7D' }}
        >
          School Mode
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
        <div>
          <dt className="text-xs text-gray-400 mb-0.5">Team Size</dt>
          <dd className="font-medium text-gray-700">4 – 6 students</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 mb-0.5">Grade Handicap</dt>
          <dd className="font-medium text-gray-700">Enabled</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-400 mb-0.5">Season Type</dt>
          <dd className="font-medium text-gray-700">Academic Year</dd>
        </div>
      </dl>

      <p className="mt-5 text-xs text-gray-400 bg-gray-50 rounded-lg px-3 py-2">
        Mode cannot be changed after students join.
      </p>
    </div>
  )
}

// ── Account ───────────────────────────────────────────────────────────────────

function AccountCard() {
  const { user } = useAuth()

  const roleLabel: Record<string, string> = {
    facilitator: 'Facilitator',
    school_admin: 'School Admin',
    admin: 'Admin',
    student: 'Student',
  }

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-base font-semibold text-gray-700 mb-1">Account</h3>
      <p className="text-xs text-gray-400 mb-5">Your account details.</p>

      <dl className="space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Display Name</dt>
          <dd className="font-medium text-gray-800">{user?.displayName ?? '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Username</dt>
          <dd className="font-medium text-gray-800">{user?.username ?? '—'}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-gray-500">Role</dt>
          <dd className="font-medium text-gray-800">
            {user?.role ? (roleLabel[user.role] ?? user.role) : '—'}
          </dd>
        </div>
      </dl>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SettingsPage() {
  return (
    <div>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
      >
        Settings
      </h2>

      <div className="max-w-2xl space-y-6">
        <NotificationPrefsCard />
        <ClassModeCard />
        <AccountCard />
      </div>
    </div>
  )
}

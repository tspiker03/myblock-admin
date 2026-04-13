import client from './client'

// ── Types ────────────────────────────────────────────────────────────────────

export interface NotificationChannel {
  push: boolean
  email: boolean
}

export interface NotificationPrefs {
  mondayLaunch: NotificationChannel
  thursdayQueue: NotificationChannel
  fridaySlideshow: NotificationChannel
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getNotificationPrefs(): Promise<NotificationPrefs> {
  const { data } = await client.get('/notifications/preferences')
  return data.notificationPrefs
}

export async function updateNotificationPrefs(prefs: Partial<NotificationPrefs>): Promise<void> {
  await client.patch('/notifications/preferences', prefs)
}

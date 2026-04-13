import client from './client'

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PillarCounts {
  agency: number
  helping: number
  character: number
  curiosity: number
  learning: number
  problemSolving: number
}

export interface TeamPillarRow extends PillarCounts {
  teamId: string
  teamName: string
}

export interface StudentPillarRow extends PillarCounts {
  userId: string
  username: string
}

export interface PillarReport {
  classTotal: PillarCounts
  byTeam: TeamPillarRow[]
  byStudent: StudentPillarRow[]
  insight: string
}

// ── Slideshow types ───────────────────────────────────────────────────────────

export interface TitleSlide {
  type: 'title'
  title: string
  content: { weekNumber: number; className: string; dateRange: string }
}

export interface LeaderboardSlide {
  type: 'leaderboard'
  title: string
  content: { teams: Array<{ name: string; points: number; rank: number; movement: number }> }
}

export interface MissionHighlightSlide {
  type: 'mission_highlight'
  title: string
  content: {
    username: string
    displayName: string
    missionTitle: string
    pillar: string
    tier: number
    evidenceUrl: string
  } | null
}

export interface PillarChartSlide {
  type: 'pillar_chart'
  title: string
  content: PillarCounts
}

export interface StarStudentSlide {
  type: 'star_student'
  title: string
  content: { username: string; displayName: string; totalPointsThisWeek: number; topPillar: string } | null
}

export interface SeasonProgressSlide {
  type: 'season_progress'
  title: string
  content: { seasonName: string; daysRemaining: number } | null
}

export type Slide =
  | TitleSlide
  | LeaderboardSlide
  | MissionHighlightSlide
  | PillarChartSlide
  | StarStudentSlide
  | SeasonProgressSlide

export interface SlideshowData {
  slides: Slide[]
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getPillarDistribution(start: string, end: string): Promise<PillarReport> {
  const { data } = await client.get('/reports/pillars', { params: { start, end } })
  return data.data ?? data
}

export async function exportReport(
  start: string,
  end: string,
  format: 'csv' | 'json',
): Promise<void> {
  const response = await client.get('/reports/export', {
    params: { start, end, format },
    responseType: 'blob',
  })

  const disposition: string = response.headers['content-disposition'] ?? ''
  const match = disposition.match(/filename="?([^";\n]+)"?/)
  const filename = match ? match[1] : `myblock-report-${start}-${end}.${format}`

  const url = URL.createObjectURL(response.data as Blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export async function getSlideshowData(): Promise<SlideshowData> {
  const { data } = await client.get('/reports/slideshow')
  return data
}

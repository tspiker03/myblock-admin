import client from './client'

// ── Types ────────────────────────────────────────────────────────────────────

export interface TeamStanding {
  teamId: string
  teamName: string
  totalTeamPoints: number
}

export interface DashboardData {
  approvalQueueCount: number
  weeklyMissionCount: number
  weeklyQuickRepCount: number
  teamStandings: TeamStanding[]
  alertCount: number
}

export type Alert =
  | { type: 'inactive_student'; studentId: string; username: string; daysSinceActive: number }
  | { type: 'team_imbalance'; leadTeam: string; trailTeam: string; ratio: number }
  | { type: 'stale_queue'; count: number; oldestDate: string }

export interface AlertsResponse {
  alerts: Alert[]
}

export interface Student {
  id: string
  username: string
  displayName: string
  gradeLevel: number
  teamId: string
  teamName: string
  enhancedReview: boolean
  totalPoints: number
  lastActiveAt: string | null
  approvedMissionCount: number
}

export interface PaginatedStudents {
  students: Student[]
  total: number
  page: number
  limit: number
}

export interface MissionTemplateRef {
  title: string
  description: string
  tier: number
  pillar: string
}

export interface Submission {
  _id: string
  userId: string
  missionTemplateId: MissionTemplateRef
  status: 'pending_approval'
  evidenceUrls: string[]
  startedAt: string
  createdAt: string
}

export interface SubmissionsResponse {
  submissions: Submission[]
}

export interface StudentsParams {
  page?: number
  limit?: number
  sortBy?: string
  search?: string
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await client.get('/facilitator/dashboard')
  return data
}

export async function getAlerts(): Promise<AlertsResponse> {
  const { data } = await client.get('/facilitator/alerts')
  return data
}

export async function getStudents(params?: StudentsParams): Promise<PaginatedStudents> {
  const { data } = await client.get('/facilitator/students', { params })
  return data
}

export async function getApprovalQueue(): Promise<SubmissionsResponse> {
  const { data } = await client.get('/submissions', {
    params: { status: 'pending_approval' },
  })
  return data
}

export async function approveSubmission(id: string): Promise<void> {
  await client.patch(`/submissions/${id}/approve`)
}

export async function rejectSubmission(id: string, reason: string): Promise<void> {
  await client.patch(`/submissions/${id}/reject`, { reason })
}

// kept for existing pages that use these
export async function getStudent(id: string): Promise<Student> {
  const { data } = await client.get(`/facilitator/students/${id}`)
  return data
}

export async function toggleEnhancedReview(id: string): Promise<void> {
  await client.patch(`/facilitator/students/${id}/enhanced-review`)
}

export async function resetPassword(id: string, password: string): Promise<void> {
  await client.post(`/facilitator/students/${id}/reset-password`, { password })
}

export async function moveStudentTeam(id: string, teamId: string): Promise<void> {
  await client.patch(`/facilitator/students/${id}/move-team`, { teamId })
}

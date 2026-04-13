import client from './client'

// ── Types ────────────────────────────────────────────────────────────────────

export type SponsorStatus = 'pending' | 'approved' | 'rejected' | 'suspended'

export interface Sponsor {
  _id: string
  businessName: string
  contactName: string
  contactEmail: string
  website: string
  phone: string
  status: SponsorStatus
  schoolIds: string[]
  approvedAt: string | null
  createdAt: string
}

export interface PaginatedSponsors {
  sponsors: Sponsor[]
  total: number
  page: number
  limit: number
}

export interface Prize {
  _id: string
  name: string
  description: string
  estimatedValue: number
  deliveryMethod: string
  tier: string
  sponsorId: { businessName: string }
  status: 'pending_approval'
  createdAt: string
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getSponsors(params?: {
  status?: string
  page?: number
}): Promise<PaginatedSponsors> {
  const { data } = await client.get('/admin/sponsors', { params })
  return data
}

export async function approveSponsor(id: string): Promise<void> {
  await client.patch(`/admin/sponsors/${id}/approve`)
}

export async function rejectSponsor(id: string): Promise<void> {
  await client.patch(`/admin/sponsors/${id}/reject`)
}

export async function getPendingPrizes(): Promise<Prize[]> {
  const { data } = await client.get('/admin/prizes/pending')
  return data.prizes
}

export async function approvePrize(id: string): Promise<void> {
  await client.patch(`/admin/prizes/${id}/approve`)
}

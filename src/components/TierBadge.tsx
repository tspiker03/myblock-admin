const TIER_CONFIG: Record<number, { bg: string; text: string; label: string }> = {
  1: { bg: '#F0FDF4', text: '#16A34A', label: 'Tier 1' },
  2: { bg: '#EFF6FF', text: '#2563EB', label: 'Tier 2' },
  3: { bg: '#FAF5FF', text: '#7C3AED', label: 'Tier 3' },
}

interface TierBadgeProps {
  tier: number
}

export function TierBadge({ tier }: TierBadgeProps) {
  const config = TIER_CONFIG[tier] ?? { bg: '#F3F4F6', text: '#6B7280', label: `Tier ${tier}` }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}

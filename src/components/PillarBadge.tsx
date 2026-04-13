const PILLAR_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  agency:          { bg: '#EFF6FF', text: '#3B82F6', label: 'Agency' },
  helping:         { bg: '#F0FDF4', text: '#22C55E', label: 'Helping' },
  character:       { bg: '#FEFCE8', text: '#CA8A04', label: 'Character' },
  curiosity:       { bg: '#FAF5FF', text: '#A855F7', label: 'Curiosity' },
  learning:        { bg: '#FFF7ED', text: '#F97316', label: 'Learning' },
  problem_solving: { bg: '#FFF1F2', text: '#EF4444', label: 'Problem Solving' },
  problemSolving:  { bg: '#FFF1F2', text: '#EF4444', label: 'Problem Solving' },
}

interface PillarBadgeProps {
  pillar: string
}

export function PillarBadge({ pillar }: PillarBadgeProps) {
  const key = pillar.toLowerCase().replace(/\s+/g, '_')
  const config = PILLAR_COLORS[key] ?? PILLAR_COLORS[pillar] ?? { bg: '#F3F4F6', text: '#6B7280', label: pillar }

  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold capitalize"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}

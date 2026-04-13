import { Calendar } from 'lucide-react'

// ── Date helpers ──────────────────────────────────────────────────────────────

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function startOfWeek() {
  const d = new Date()
  d.setDate(d.getDate() - d.getDay())
  return toISO(d)
}

function startOfMonth() {
  const d = new Date()
  d.setDate(1)
  return toISO(d)
}

const PRESETS = [
  {
    label: 'This Week',
    start: () => startOfWeek(),
    end: () => toISO(new Date()),
  },
  {
    label: 'This Month',
    start: () => startOfMonth(),
    end: () => toISO(new Date()),
  },
  {
    label: 'This Season',
    start: () => {
      const d = new Date()
      d.setMonth(d.getMonth() - 3)
      return toISO(d)
    },
    end: () => toISO(new Date()),
  },
  {
    label: 'All Time',
    start: () => '2020-01-01',
    end: () => toISO(new Date()),
  },
]

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  start: string
  end: string
  onChange: (start: string, end: string) => void
}

export function DateRangePicker({ start, end, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
        <Calendar size={16} className="text-gray-400" />
        <input
          type="date"
          value={start}
          max={end}
          onChange={(e) => onChange(e.target.value, end)}
          className="text-sm text-gray-700 outline-none bg-transparent"
        />
        <span className="text-gray-300 mx-1">→</span>
        <input
          type="date"
          value={end}
          min={start}
          onChange={(e) => onChange(start, e.target.value)}
          className="text-sm text-gray-700 outline-none bg-transparent"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((p) => {
          const ps = p.start()
          const pe = p.end()
          const active = start === ps && end === pe
          return (
            <button
              key={p.label}
              onClick={() => onChange(ps, pe)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
              style={{
                backgroundColor: active ? '#1A3A7D' : '#f0f4ff',
                color: active ? '#fff' : '#1A3A7D',
              }}
            >
              {p.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

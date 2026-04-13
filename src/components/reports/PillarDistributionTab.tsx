import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts'
import { TrendingUp, ArrowUpDown } from 'lucide-react'
import { getPillarDistribution } from '../../api/reports'
import type { PillarReport, StudentPillarRow } from '../../api/reports'
import { DateRangePicker } from './DateRangePicker'

// ── Constants ─────────────────────────────────────────────────────────────────

const PILLARS = ['agency', 'helping', 'character', 'curiosity', 'learning', 'problemSolving'] as const
type Pillar = typeof PILLARS[number]

const PILLAR_COLORS: Record<Pillar, string> = {
  agency: '#3B82F6',
  helping: '#22C55E',
  character: '#EAB308',
  curiosity: '#A855F7',
  learning: '#F97316',
  problemSolving: '#EF4444',
}

const PILLAR_LABELS: Record<Pillar, string> = {
  agency: 'Agency',
  helping: 'Helping',
  character: 'Character',
  curiosity: 'Curiosity',
  learning: 'Learning',
  problemSolving: 'Problem Solving',
}

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function defaultRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - start.getDay())
  return { start: toISO(start), end: toISO(end) }
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-gray-200 rounded animate-pulse ${className ?? ''}`} />
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <Skeleton className="h-4 w-40 mb-6" />
      <div className="flex items-end gap-4 h-48">
        {[60, 80, 45, 90, 70, 55].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

// ── Class total bar chart ─────────────────────────────────────────────────────

function ClassTotalChart({ data }: { data: PillarReport['classTotal'] }) {
  const chartData = PILLARS.map((p) => ({ name: PILLAR_LABELS[p], value: data[p], pillar: p }))
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-base font-bold text-gray-700 mb-4">Class Total</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} barCategoryGap="30%">
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
            cursor={{ fill: '#f3f4f6' }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {chartData.map((entry) => (
              <Cell key={entry.pillar} fill={PILLAR_COLORS[entry.pillar as Pillar]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── By-team stacked bar chart ─────────────────────────────────────────────────

function ByTeamChart({ data }: { data: PillarReport['byTeam'] }) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-gray-400 text-sm py-16">
        No team data for this period.
      </div>
    )
  }
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-base font-bold text-gray-700 mb-4">By Team</h3>
      <div className="flex gap-3 flex-wrap mb-4">
        {PILLARS.map((p) => (
          <div key={p} className="flex items-center gap-1.5 text-xs text-gray-500">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: PILLAR_COLORS[p] }} />
            {PILLAR_LABELS[p]}
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={data} barCategoryGap="25%">
          <XAxis dataKey="teamName" tick={{ fontSize: 11, fill: '#6b7280' }} />
          <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 13 }}
            cursor={{ fill: '#f3f4f6' }}
          />
          {PILLARS.map((p) => (
            <Bar key={p} dataKey={p} stackId="a" fill={PILLAR_COLORS[p]} name={PILLAR_LABELS[p]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── By-student sortable table ─────────────────────────────────────────────────

type SortKey = 'username' | Pillar | 'total'

function pillarTotal(row: StudentPillarRow) {
  return PILLARS.reduce((s, p) => s + row[p], 0)
}

function ByStudentTable({ data }: { data: StudentPillarRow[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('total')
  const [asc, setAsc] = useState(false)

  function toggleSort(key: SortKey) {
    if (sortKey === key) setAsc((a) => !a)
    else { setSortKey(key); setAsc(false) }
  }

  const sorted = [...data].sort((a, b) => {
    let av: number | string = sortKey === 'username' ? a.username : sortKey === 'total' ? pillarTotal(a) : a[sortKey as Pillar]
    let bv: number | string = sortKey === 'username' ? b.username : sortKey === 'total' ? pillarTotal(b) : b[sortKey as Pillar]
    if (typeof av === 'string') return asc ? av.localeCompare(bv as string) : (bv as string).localeCompare(av)
    return asc ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  function ColHeader({ col, label }: { col: SortKey; label: string }) {
    const active = sortKey === col
    return (
      <th
        className="px-3 py-2 text-left text-xs font-semibold text-gray-500 cursor-pointer hover:text-gray-700 select-none whitespace-nowrap"
        onClick={() => toggleSort(col)}
      >
        <span className="flex items-center gap-1">
          {label}
          <ArrowUpDown size={11} className={active ? 'text-[#1A3A7D]' : 'text-gray-300'} />
        </span>
      </th>
    )
  }

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center text-gray-400 text-sm py-10">
        No student data for this period.
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-bold text-gray-700">By Student</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <ColHeader col="username" label="Student" />
              {PILLARS.map((p) => <ColHeader key={p} col={p} label={PILLAR_LABELS[p]} />)}
              <ColHeader col="total" label="Total" />
            </tr>
          </thead>
          <tbody>
            {sorted.map((row) => (
              <tr key={row.userId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2.5 font-medium text-gray-700">{row.username}</td>
                {PILLARS.map((p) => (
                  <td key={p} className="px-3 py-2.5 text-gray-600">
                    <span className="font-semibold" style={{ color: PILLAR_COLORS[p] }}>
                      {row[p]}
                    </span>
                  </td>
                ))}
                <td className="px-3 py-2.5 font-bold text-gray-800">{pillarTotal(row)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Insight card ──────────────────────────────────────────────────────────────

function InsightCard({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
      <TrendingUp size={18} className="text-[#1A3A7D] flex-shrink-0 mt-0.5" />
      <p className="text-sm text-[#1A3A7D] font-medium leading-relaxed">{text}</p>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

export function PillarDistributionTab() {
  const { start: ds, end: de } = defaultRange()
  const [start, setStart] = useState(ds)
  const [end, setEnd] = useState(de)
  const [report, setReport] = useState<PillarReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPillarDistribution(start, end)
      setReport(data)
    } catch {
      setError('Failed to load report data.')
    } finally {
      setLoading(false)
    }
  }, [start, end])

  useEffect(() => { load() }, [load])

  function handleRange(s: string, e: string) {
    setStart(s)
    setEnd(e)
  }

  return (
    <div className="space-y-6">
      <DateRangePicker start={start} end={end} onChange={handleRange} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-sm text-red-600 flex items-center justify-between">
          {error}
          <button onClick={load} className="text-xs font-semibold underline ml-4">Retry</button>
        </div>
      )}

      {loading ? (
        <div className="space-y-6">
          <ChartSkeleton />
          <ChartSkeleton />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : report ? (
        <>
          {report.insight && <InsightCard text={report.insight} />}
          <ClassTotalChart data={report.classTotal} />
          <ByTeamChart data={report.byTeam} />
          <ByStudentTable data={report.byStudent} />
        </>
      ) : null}
    </div>
  )
}

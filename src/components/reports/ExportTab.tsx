import { useState } from 'react'
import { Download, FileText, FileJson } from 'lucide-react'
import { exportReport } from '../../api/reports'
import { DateRangePicker } from './DateRangePicker'

function toISO(d: Date) {
  return d.toISOString().split('T')[0]
}

function defaultRange() {
  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - start.getDay())
  return { start: toISO(start), end: toISO(end) }
}

export function ExportTab() {
  const { start: ds, end: de } = defaultRange()
  const [start, setStart] = useState(ds)
  const [end, setEnd] = useState(de)
  const [downloading, setDownloading] = useState<'csv' | 'json' | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExport(format: 'csv' | 'json') {
    setDownloading(format)
    setError(null)
    try {
      await exportReport(start, end, format)
    } catch {
      setError(`Failed to download ${format.toUpperCase()} report.`)
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6 max-w-lg">
      <DateRangePicker start={start} end={end} onChange={(s, e) => { setStart(s); setEnd(e) }} />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h3 className="text-base font-bold text-gray-700 mb-2">Download Report</h3>

        <button
          onClick={() => handleExport('csv')}
          disabled={!!downloading}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-[#1A3A7D] text-[#1A3A7D] font-semibold hover:bg-[#1A3A7D] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText size={22} />
          <div className="text-left flex-1">
            <p className="text-sm font-bold">Download CSV</p>
            <p className="text-xs opacity-70 font-normal">Spreadsheet-compatible data export</p>
          </div>
          {downloading === 'csv' ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download size={18} />
          )}
        </button>

        <button
          onClick={() => handleExport('json')}
          disabled={!!downloading}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:border-[#1A3A7D] hover:text-[#1A3A7D] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileJson size={22} />
          <div className="text-left flex-1">
            <p className="text-sm font-bold">Download JSON</p>
            <p className="text-xs opacity-70 font-normal">Structured data for integrations</p>
          </div>
          {downloading === 'json' ? (
            <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download size={18} />
          )}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        Exports include all pillar points, team standings, and student activity for the selected date range.
      </p>
    </div>
  )
}

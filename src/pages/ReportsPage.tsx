import { useState } from 'react'
import { BarChart2, Download, Presentation } from 'lucide-react'
import { PillarDistributionTab } from '../components/reports/PillarDistributionTab'
import { ExportTab } from '../components/reports/ExportTab'
import { SlideshowTab } from '../components/reports/SlideshowTab'

// ── Tab definition ────────────────────────────────────────────────────────────

type TabId = 'pillars' | 'export' | 'slideshow'

const TABS: Array<{ id: TabId; label: string; icon: React.ReactNode }> = [
  { id: 'pillars', label: 'Pillar Distribution', icon: <BarChart2 size={16} /> },
  { id: 'export', label: 'Export', icon: <Download size={16} /> },
  { id: 'slideshow', label: 'Slideshow', icon: <Presentation size={16} /> },
]

// ── Page ──────────────────────────────────────────────────────────────────────

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('pillars')

  return (
    <div>
      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
      >
        Reports
      </h2>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-100 w-fit">
        {TABS.map((tab) => {
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              style={{
                backgroundColor: active ? '#1A3A7D' : 'transparent',
                color: active ? '#fff' : '#6b7280',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'pillars' && <PillarDistributionTab />}
      {activeTab === 'export' && <ExportTab />}
      {activeTab === 'slideshow' && <SlideshowTab />}
    </div>
  )
}

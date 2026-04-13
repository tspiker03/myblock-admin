import { useState } from 'react'
import {
  Play, ChevronUp, ChevronDown, X, Edit2, Check,
  Presentation, Loader2,
} from 'lucide-react'
import { getSlideshowData } from '../../api/reports'
import type { Slide } from '../../api/reports'
import { SlideshowPresenter } from '../SlideshowPresenter'

// ── Slide type label ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  title: 'Title Slide',
  leaderboard: 'Team Leaderboard',
  mission_highlight: 'Mission Spotlight',
  pillar_chart: 'Pillar Chart',
  star_student: 'Star of the Week',
  season_progress: 'Season Progress',
}

const TYPE_COLORS: Record<string, string> = {
  title: '#1A3A7D',
  leaderboard: '#EAB308',
  mission_highlight: '#A855F7',
  pillar_chart: '#3B82F6',
  star_student: '#F97316',
  season_progress: '#22C55E',
}

// ── Slide preview summary ─────────────────────────────────────────────────────

function slideSummary(slide: Slide): string {
  switch (slide.type) {
    case 'title':
      return `Week ${slide.content.weekNumber} · ${slide.content.className} · ${slide.content.dateRange}`
    case 'leaderboard':
      return `${slide.content.teams.length} teams ranked`
    case 'mission_highlight':
      return slide.content ? `${slide.content.displayName} — ${slide.content.missionTitle}` : 'No mission data'
    case 'pillar_chart':
      return Object.entries(slide.content)
        .map(([k, v]) => `${k}: ${v}`)
        .join(' · ')
    case 'star_student':
      return slide.content ? `${slide.content.displayName} · ${slide.content.totalPointsThisWeek} pts` : 'No data this week'
    case 'season_progress':
      return slide.content ? `${slide.content.seasonName} · ${slide.content.daysRemaining} days remaining` : 'No season data'
  }
}

// ── Slide card ────────────────────────────────────────────────────────────────

interface SlideCardProps {
  slide: Slide
  index: number
  total: number
  onMoveUp: () => void
  onMoveDown: () => void
  onRemove: () => void
  onTitleChange: (title: string) => void
}

function SlideCard({ slide, index, total, onMoveUp, onMoveDown, onRemove, onTitleChange }: SlideCardProps) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(slide.title)
  const color = TYPE_COLORS[slide.type] ?? '#4DA6FF'

  function commitEdit() {
    onTitleChange(draft.trim() || slide.title)
    setEditing(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex items-stretch overflow-hidden">
      {/* Color accent */}
      <div className="w-1.5 flex-shrink-0" style={{ backgroundColor: color }} />

      {/* Index + type badge */}
      <div className="w-14 flex-shrink-0 flex flex-col items-center justify-center gap-1 py-4 bg-gray-50 border-r border-gray-100">
        <span className="text-lg font-black text-gray-300">{index + 1}</span>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-3 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
            style={{ backgroundColor: color }}
          >
            {TYPE_LABELS[slide.type] ?? slide.type}
          </span>
        </div>

        {editing ? (
          <div className="flex items-center gap-2 mt-1">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') commitEdit(); if (e.key === 'Escape') setEditing(false) }}
              className="flex-1 text-sm font-semibold text-gray-800 border-b border-[#4DA6FF] outline-none bg-transparent pb-0.5"
            />
            <button onClick={commitEdit} className="text-green-500 hover:text-green-600">
              <Check size={15} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <p className="text-sm font-semibold text-gray-800 truncate">{slide.title}</p>
            <button
              onClick={() => { setDraft(slide.title); setEditing(true) }}
              className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-[#1A3A7D] transition-opacity"
            >
              <Edit2 size={13} />
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-1 truncate">{slideSummary(slide)}</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col items-center justify-center gap-1 px-3 border-l border-gray-100">
        <button
          onClick={onMoveUp}
          disabled={index === 0}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-default transition-colors"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={onMoveDown}
          disabled={index === total - 1}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-20 disabled:cursor-default transition-colors"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={onRemove}
          className="p-1 rounded hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  )
}

// ── Main tab ──────────────────────────────────────────────────────────────────

let slideIdCounter = 0

interface KeyedSlide extends Slide {
  _key: string
}

export function SlideshowTab() {
  const [slides, setSlides] = useState<KeyedSlide[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [presenting, setPresenting] = useState(false)

  async function generate() {
    setLoading(true)
    setError(null)
    try {
      const data = await getSlideshowData()
      const filtered = data.slides.filter((s) => {
        if ('content' in s && s.content === null) return false
        return true
      })
      setSlides(filtered.map((s) => ({ ...s, _key: `slide-${++slideIdCounter}` })))
    } catch {
      setError('Failed to generate slideshow. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function moveUp(i: number) {
    if (i === 0) return
    setSlides((prev) => {
      const next = [...prev]
      ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
      return next
    })
  }

  function moveDown(i: number) {
    setSlides((prev) => {
      if (i >= prev.length - 1) return prev
      const next = [...prev]
      ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
      return next
    })
  }

  function remove(i: number) {
    setSlides((prev) => prev.filter((_, idx) => idx !== i))
  }

  function updateTitle(i: number, title: string) {
    setSlides((prev) => prev.map((s, idx) => (idx === i ? { ...s, title } : s)))
  }

  return (
    <div className="space-y-5">
      {presenting && slides.length > 0 && (
        <SlideshowPresenter slides={slides} onClose={() => setPresenting(false)} />
      )}

      {/* Generate button */}
      <div className="flex items-center gap-4">
        <button
          onClick={generate}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1A3A7D] text-white text-sm font-semibold rounded-xl hover:bg-[#2a4d9e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Presentation size={16} />}
          {slides.length > 0 ? 'Regenerate Slideshow' : "Generate This Week's Slideshow"}
        </button>

        {slides.length > 0 && (
          <button
            onClick={() => setPresenting(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#4DA6FF] text-white text-sm font-semibold rounded-xl hover:bg-[#3a8fe0] transition-colors"
          >
            <Play size={16} />
            Start Presentation
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Slide list */}
      {slides.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider px-1">
            {slides.length} slides — drag to reorder, click title to edit
          </p>
          {slides.map((slide, i) => (
            <SlideCard
              key={slide._key}
              slide={slide}
              index={i}
              total={slides.length}
              onMoveUp={() => moveUp(i)}
              onMoveDown={() => moveDown(i)}
              onRemove={() => remove(i)}
              onTitleChange={(title) => updateTitle(i, title)}
            />
          ))}
        </div>
      )}

      {slides.length === 0 && !loading && (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center text-gray-400">
          <Presentation size={40} className="mx-auto mb-4 opacity-30" />
          <p className="text-sm">Click the button above to generate this week's slideshow.</p>
          <p className="text-xs mt-1 opacity-70">Pulls live data: leaderboards, mission highlights, star student, and more.</p>
        </div>
      )}
    </div>
  )
}

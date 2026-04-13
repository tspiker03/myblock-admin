import { useEffect, useRef, useState, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Slide, PillarCounts } from '../api/reports'

// ── Constants ─────────────────────────────────────────────────────────────────

const PILLAR_COLORS: Record<string, string> = {
  agency: '#3B82F6',
  helping: '#22C55E',
  character: '#EAB308',
  curiosity: '#A855F7',
  learning: '#F97316',
  problemSolving: '#EF4444',
}

const PILLAR_LABELS: Record<string, string> = {
  agency: 'Agency',
  helping: 'Helping',
  character: 'Character',
  curiosity: 'Curiosity',
  learning: 'Learning',
  problemSolving: 'Problem Solving',
}

// ── Individual slide renderers ────────────────────────────────────────────────

function TitleSlideView({ slide }: { slide: Extract<Slide, { type: 'title' }> }) {
  const { weekNumber, className, dateRange } = slide.content
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-12">
      <p className="text-[#4DA6FF] text-xl font-semibold mb-4 tracking-widest uppercase">
        Week {weekNumber}
      </p>
      <h1 className="text-6xl font-black text-white mb-6" style={{ fontFamily: "'Lilita One', cursive" }}>
        {slide.title}
      </h1>
      <p className="text-2xl text-white/70">{className}</p>
      <p className="text-lg text-white/50 mt-3">{dateRange}</p>
    </div>
  )
}

function LeaderboardSlideView({ slide }: { slide: Extract<Slide, { type: 'leaderboard' }> }) {
  const { teams } = slide.content
  const medals = ['🥇', '🥈', '🥉']
  const movementIcon = (m: number) => {
    if (m > 0) return <span className="text-green-400 text-xl">↑</span>
    if (m < 0) return <span className="text-red-400 text-xl">↓</span>
    return <span className="text-white/40 text-xl">−</span>
  }
  return (
    <div className="flex flex-col h-full px-16 py-10">
      <h2 className="text-4xl font-black text-white mb-8 text-center" style={{ fontFamily: "'Lilita One', cursive" }}>
        {slide.title}
      </h2>
      <div className="flex-1 flex flex-col justify-center gap-4">
        {teams.map((team) => (
          <div key={team.name} className="flex items-center gap-5 bg-white/10 rounded-2xl px-6 py-4">
            <span className="text-3xl w-10 text-center">{medals[team.rank - 1] ?? `#${team.rank}`}</span>
            <span className="flex-1 text-2xl font-bold text-white">{team.name}</span>
            <span className="text-2xl font-black text-[#4DA6FF]">{team.points.toLocaleString()} pts</span>
            <span className="w-8 text-center">{movementIcon(team.movement)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MissionHighlightSlideView({ slide }: { slide: Extract<Slide, { type: 'mission_highlight' }> }) {
  if (!slide.content) {
    return <div className="flex items-center justify-center h-full text-white/50 text-xl">No mission data</div>
  }
  const { displayName, missionTitle, pillar, tier, evidenceUrl } = slide.content
  const color = PILLAR_COLORS[pillar] ?? '#4DA6FF'
  const label = PILLAR_LABELS[pillar] ?? pillar
  return (
    <div className="flex flex-col items-center justify-center h-full px-16 gap-6">
      <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Lilita One', cursive" }}>
        {slide.title}
      </h2>
      <div className="flex gap-8 items-start w-full max-w-4xl">
        {evidenceUrl && (
          <div className="w-64 h-48 rounded-2xl overflow-hidden flex-shrink-0 bg-white/10">
            <img src={evidenceUrl} alt="Evidence" className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 flex flex-col gap-4">
          <p className="text-3xl font-bold text-white">{displayName}</p>
          <p className="text-xl text-white/70 leading-snug">"{missionTitle}"</p>
          <div className="flex gap-3 mt-2">
            <span
              className="px-4 py-1.5 rounded-full text-white text-sm font-bold"
              style={{ backgroundColor: color }}
            >
              {label}
            </span>
            <span className="px-4 py-1.5 rounded-full text-white text-sm font-bold bg-white/20">
              Tier {tier}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function PillarChartSlideView({ slide }: { slide: Extract<Slide, { type: 'pillar_chart' }> }) {
  const counts = slide.content
  const pillars = Object.keys(PILLAR_COLORS) as (keyof PillarCounts)[]
  const max = Math.max(...pillars.map((p) => counts[p] as number), 1)
  return (
    <div className="flex flex-col h-full px-16 py-10">
      <h2 className="text-4xl font-black text-white mb-8 text-center" style={{ fontFamily: "'Lilita One', cursive" }}>
        {slide.title}
      </h2>
      <div className="flex-1 flex items-end justify-around gap-4 pb-6">
        {pillars.map((pillar) => {
          const val = counts[pillar] as number
          const pct = Math.max(4, Math.round((val / max) * 100))
          const color = PILLAR_COLORS[pillar]
          return (
            <div key={pillar} className="flex flex-col items-center gap-2 flex-1">
              <span className="text-white/70 text-sm font-bold">{val}</span>
              <div className="w-full flex items-end" style={{ height: '200px' }}>
                <div
                  className="w-full rounded-t-xl transition-all duration-700"
                  style={{ height: `${pct}%`, backgroundColor: color }}
                />
              </div>
              <span className="text-white/60 text-xs text-center leading-tight">
                {PILLAR_LABELS[pillar]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StarStudentSlideView({ slide }: { slide: Extract<Slide, { type: 'star_student' }> }) {
  if (!slide.content) {
    return <div className="flex items-center justify-center h-full text-white/50 text-xl">No star student this week</div>
  }
  const { displayName, totalPointsThisWeek, topPillar } = slide.content
  const color = PILLAR_COLORS[topPillar] ?? '#4DA6FF'
  const label = PILLAR_LABELS[topPillar] ?? topPillar
  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 text-center px-12">
      <span className="text-7xl">⭐</span>
      <h2 className="text-4xl font-black text-white/60 uppercase tracking-widest">
        {slide.title}
      </h2>
      <p className="text-7xl font-black text-white" style={{ fontFamily: "'Lilita One', cursive" }}>
        {displayName}
      </p>
      <p className="text-3xl font-bold text-[#4DA6FF]">
        {totalPointsThisWeek.toLocaleString()} pts this week
      </p>
      <span
        className="px-6 py-2 rounded-full text-white text-lg font-bold"
        style={{ backgroundColor: color }}
      >
        Top pillar: {label}
      </span>
    </div>
  )
}

function SeasonProgressSlideView({ slide }: { slide: Extract<Slide, { type: 'season_progress' }> }) {
  if (!slide.content) {
    return <div className="flex items-center justify-center h-full text-white/50 text-xl">No season data</div>
  }
  const { seasonName, daysRemaining } = slide.content
  const totalDays = (slide.content as Record<string, unknown>).totalDays as number | undefined
  const SEASON_TOTAL = totalDays && totalDays > 0 ? totalDays : 90
  const elapsed = Math.max(0, Math.min(SEASON_TOTAL, SEASON_TOTAL - daysRemaining))
  const pct = Math.min(100, Math.round((elapsed / SEASON_TOTAL) * 100))
  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-20 text-center">
      <h2 className="text-4xl font-black text-white" style={{ fontFamily: "'Lilita One', cursive" }}>
        {slide.title}
      </h2>
      <p className="text-2xl text-[#4DA6FF] font-bold">{seasonName}</p>
      <div className="w-full max-w-2xl">
        <div className="flex justify-between text-white/60 text-sm mb-3">
          <span>Day {elapsed}</span>
          <span>{daysRemaining} days remaining</span>
        </div>
        <div className="h-6 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, backgroundColor: '#4DA6FF' }}
          />
        </div>
        <p className="text-white/40 text-sm mt-3">{pct}% complete</p>
      </div>
    </div>
  )
}

function renderSlide(slide: Slide) {
  switch (slide.type) {
    case 'title': return <TitleSlideView slide={slide} />
    case 'leaderboard': return <LeaderboardSlideView slide={slide} />
    case 'mission_highlight': return <MissionHighlightSlideView slide={slide} />
    case 'pillar_chart': return <PillarChartSlideView slide={slide} />
    case 'star_student': return <StarStudentSlideView slide={slide} />
    case 'season_progress': return <SeasonProgressSlideView slide={slide} />
  }
}

// ── Main presenter ────────────────────────────────────────────────────────────

interface Props {
  slides: Slide[]
  onClose: () => void
}

export function SlideshowPresenter({ slides, onClose }: Props) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState<'left' | 'right' | null>(null)
  const [animating, setAnimating] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)

  // Request fullscreen on mount
  useEffect(() => {
    const el = containerRef.current
    if (el && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {/* non-critical */})
    }
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {/* non-critical */})
      }
    }
  }, [])

  const go = useCallback((dir: 'prev' | 'next') => {
    if (animating) return
    if (dir === 'prev' && current === 0) return
    if (dir === 'next' && current === slides.length - 1) return

    setDirection(dir === 'next' ? 'left' : 'right')
    setAnimating(true)
    setTimeout(() => {
      setCurrent((c) => (dir === 'next' ? c + 1 : c - 1))
      setAnimating(false)
      setDirection(null)
    }, 350)
  }, [animating, current, slides.length])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go('next')
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') go('prev')
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, onClose])

  // Touch swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(dx) > 50) go(dx < 0 ? 'next' : 'prev')
    touchStartX.current = null
  }

  const slideTransform = animating && direction
    ? direction === 'left' ? 'translateX(-100%)' : 'translateX(100%)'
    : 'translateX(0)'

  const isTitleSlide = slides[current]?.type === 'title'
  const bgColor = isTitleSlide ? '#1A3A7D' : '#1a1a2e'

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-stretch select-none"
      style={{ backgroundColor: bgColor, transition: 'background-color 0.5s' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Slide content */}
      <div
        className="flex-1 overflow-hidden relative"
        style={{
          transform: slideTransform,
          transition: animating ? 'transform 0.35s cubic-bezier(0.4,0,0.2,1)' : 'none',
        }}
      >
        {slides[current] && renderSlide(slides[current])}
      </div>

      {/* Left click zone */}
      <button
        onClick={() => go('prev')}
        disabled={current === 0}
        className="absolute left-0 top-0 h-full w-24 flex items-center justify-start pl-4 opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default"
        aria-label="Previous slide"
      >
        <ChevronLeft size={40} className="text-white/60" />
      </button>

      {/* Right click zone */}
      <button
        onClick={() => go('next')}
        disabled={current === slides.length - 1}
        className="absolute right-0 top-0 h-full w-24 flex items-center justify-end pr-4 opacity-0 hover:opacity-100 transition-opacity disabled:cursor-default"
        aria-label="Next slide"
      >
        <ChevronRight size={40} className="text-white/60" />
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
        aria-label="Exit presentation"
      >
        <X size={20} />
      </button>

      {/* Slide counter */}
      <div className="absolute bottom-4 right-4 text-white/40 text-sm font-mono">
        {current + 1} / {slides.length}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="rounded-full transition-all"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              backgroundColor: i === current ? '#4DA6FF' : 'rgba(255,255,255,0.3)',
            }}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

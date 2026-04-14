import { useEffect, useRef, useState } from 'react'
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  RefreshCw,
  CheckSquare,
  Square,
  ExternalLink,
  PartyPopper,
} from 'lucide-react'
import { getApprovalQueue, approveSubmission, rejectSubmission } from '../api/facilitator'
import type { Submission } from '../api/facilitator'
import { TierBadge } from '../components/TierBadge'
import { PillarBadge } from '../components/PillarBadge'

// ── Helpers ───────────────────────────────────────────────────────────────────

function daysWaiting(createdAt: string): number {
  const ms = Date.now() - new Date(createdAt).getTime()
  return Math.floor(ms / (1000 * 60 * 60 * 24))
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url)
}

function isSafeUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

// ── Reject Inline Form ────────────────────────────────────────────────────────

interface RejectFormProps {
  onConfirm: (reason: string) => void
  onCancel: () => void
  loading: boolean
}

function RejectForm({ onConfirm, onCancel, loading }: RejectFormProps) {
  const [reason, setReason] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="mt-3 border-t border-gray-100 pt-3">
      <p className="text-xs font-semibold text-gray-600 mb-1.5">
        Rejection reason <span className="text-gray-400 font-normal">(min 10 chars)</span>
      </p>
      <textarea
        ref={inputRef}
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#FF6B6B]/40 focus:border-[#FF6B6B]"
        placeholder="Explain why this submission is being rejected…"
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => onConfirm(reason)}
          disabled={reason.trim().length < 10 || loading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FF6B6B] text-white text-xs font-semibold rounded-lg hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? <RefreshCw size={12} className="animate-spin" /> : <X size={12} />}
          Confirm Reject
        </button>
        <button
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ── Image Lightbox ────────────────────────────────────────────────────────────

function Lightbox({ src, onClose }: { src: string; onClose: () => void }) {
  useEffect(() => {
    function handleKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Evidence preview"
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <img
        src={src}
        alt="Evidence"
        className="max-w-full max-h-full rounded-lg shadow-2xl object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
      >
        <X size={20} />
      </button>
    </div>
  )
}

// ── Submission Card ───────────────────────────────────────────────────────────

interface SubmissionCardProps {
  submission: Submission
  checked: boolean
  onToggleCheck: () => void
  onApprove: () => Promise<void>
  onReject: (reason: string) => Promise<void>
  removing: boolean
}

function SubmissionCard({
  submission,
  checked,
  onToggleCheck,
  onApprove,
  onReject,
  removing,
}: SubmissionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null)
  const days = daysWaiting(submission.createdAt)
  const mission = submission.missionTemplateId

  async function handleApprove() {
    setActionLoading(true)
    try {
      await onApprove()
    } finally {
      setActionLoading(false)
    }
  }

  async function handleReject(reason: string) {
    setActionLoading(true)
    try {
      await onReject(reason)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <>
      {lightboxSrc && (
        <Lightbox src={lightboxSrc} onClose={() => setLightboxSrc(null)} />
      )}

      <div
        className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
          removing ? 'opacity-0 max-h-0 border-0 shadow-none mb-0' : 'opacity-100 max-h-[2000px] border-gray-100 mb-3'
        }`}
        style={{ transitionProperty: 'opacity, max-height, margin' }}
      >
        {/* Collapsed header — always visible */}
        <div className="px-4 py-3.5 flex items-center gap-3">
          {/* Checkbox */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggleCheck() }}
            className="flex-shrink-0 text-gray-400 hover:text-[#1A3A7D] transition-colors"
            aria-label={checked ? 'Deselect' : 'Select'}
          >
            {checked ? (
              <CheckSquare size={18} className="text-[#1A3A7D]" />
            ) : (
              <Square size={18} />
            )}
          </button>

          {/* Main info — clickable to expand */}
          <button
            onClick={() => { setExpanded((v) => !v); setShowRejectForm(false) }}
            className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 text-left"
          >
            <span className="text-sm font-semibold text-gray-800 truncate">
              {submission.userId}
            </span>
            <span className="text-sm text-gray-600 truncate flex-1">
              {mission.title}
            </span>
            <div className="flex items-center gap-2 flex-shrink-0">
              <TierBadge tier={mission.tier} />
              <PillarBadge pillar={mission.pillar} />
              <span className={`text-xs font-medium flex-shrink-0 ${days >= 3 ? 'text-[#FF6B6B]' : 'text-gray-400'}`}>
                {days === 0 ? 'Today' : `${days}d ago`}
              </span>
            </div>
          </button>

          {/* Quick actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={handleApprove}
              disabled={actionLoading}
              title="Approve"
              className="w-8 h-8 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <Check size={15} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setExpanded(true)
                setShowRejectForm((v) => !v)
              }}
              disabled={actionLoading}
              title="Reject"
              className="w-8 h-8 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center transition-colors disabled:opacity-40"
            >
              <X size={15} />
            </button>
            <button
              onClick={() => { setExpanded((v) => !v); setShowRejectForm(false) }}
              className="w-8 h-8 rounded-lg text-gray-400 hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="px-4 pb-4 border-t border-gray-100 pt-3">
            {/* Description */}
            <p className="text-sm text-gray-600 mb-3">{mission.description}</p>

            {/* Evidence */}
            {submission.evidenceUrls.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                  Evidence ({submission.evidenceUrls.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {submission.evidenceUrls.filter(isSafeUrl).map((url, i) => (
                    isImageUrl(url) ? (
                      <button
                        key={i}
                        onClick={() => setLightboxSrc(url)}
                        className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 hover:border-[#4DA6FF] transition-colors flex-shrink-0"
                      >
                        <img src={url} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ) : (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-[#1A3A7D] font-medium hover:bg-blue-50 hover:border-[#4DA6FF] transition-colors"
                      >
                        <ExternalLink size={12} />
                        Link {i + 1}
                      </a>
                    )
                  ))}
                </div>
              </div>
            )}

            {/* Reject form */}
            {showRejectForm && (
              <RejectForm
                onConfirm={handleReject}
                onCancel={() => setShowRejectForm(false)}
                loading={actionLoading}
              />
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ── Bulk Confirm Dialog ───────────────────────────────────────────────────────

interface BulkConfirmProps {
  count: number
  onConfirm: () => void
  onCancel: () => void
}

function BulkConfirmDialog({ count, onConfirm, onCancel }: BulkConfirmProps) {
  return (
    <div className="fixed inset-0 z-40 bg-black/40 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full">
        <h3
          className="text-lg font-bold mb-2"
          style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
        >
          Approve {count} submission{count !== 1 ? 's' : ''}?
        </h3>
        <p className="text-sm text-gray-500 mb-5">
          This will approve all {count} selected submissions. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Approve All
          </button>
          <button
            onClick={onCancel}
            className="flex-1 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function ApprovalQueuePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [removing, setRemoving] = useState<Set<string>>(new Set())
  const [showBulkConfirm, setShowBulkConfirm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { submissions: subs } = await getApprovalQueue()
      setSubmissions(subs)
      setChecked(new Set())
    } catch {
      setError('Failed to load approval queue.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function removeItem(id: string) {
    setRemoving((prev) => new Set(prev).add(id))
    setTimeout(() => {
      setSubmissions((prev) => prev.filter((s) => s._id !== id))
      setChecked((prev) => { const n = new Set(prev); n.delete(id); return n })
      setRemoving((prev) => { const n = new Set(prev); n.delete(id); return n })
    }, 300)
  }

  async function handleApprove(id: string) {
    setActionError(null)
    try {
      await approveSubmission(id)
      removeItem(id)
    } catch {
      setActionError('Failed to approve submission. Please try again.')
    }
  }

  async function handleReject(id: string, reason: string) {
    setActionError(null)
    try {
      await rejectSubmission(id, reason)
      removeItem(id)
    } catch {
      setActionError('Failed to reject submission. Please try again.')
    }
  }

  async function handleBulkApprove() {
    setShowBulkConfirm(false)
    setActionError(null)
    const ids = Array.from(checked)
    const results = await Promise.allSettled(ids.map((id) => approveSubmission(id).then(() => removeItem(id))))
    const failed = results.filter((r) => r.status === 'rejected').length
    if (failed > 0) {
      setActionError(`${ids.length - failed} of ${ids.length} approved. ${failed} failed — please retry.`)
    }
    setChecked(new Set())
  }

  function toggleCheck(id: string) {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id) } else { next.add(id) }
      return next
    })
  }

  const checkedCount = checked.size

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <p className="text-gray-500 text-sm">{error}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 px-4 py-2 bg-[#1A3A7D] text-white text-sm font-semibold rounded-lg hover:bg-[#2a4d9e] transition-colors"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      {showBulkConfirm && (
        <BulkConfirmDialog
          count={checkedCount}
          onConfirm={handleBulkApprove}
          onCancel={() => setShowBulkConfirm(false)}
        />
      )}

      <div>
        {/* Action error banner */}
        {actionError && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
            <p className="text-sm text-red-700">{actionError}</p>
            <button onClick={() => setActionError(null)} className="text-red-400 hover:text-red-600"><X size={16} /></button>
          </div>
        )}

        {/* Page header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h2
              className="text-2xl font-bold"
              style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
            >
              Approval Queue
            </h2>
            {!loading && (
              <p className="text-sm text-gray-500 mt-0.5">
                {submissions.length === 0
                  ? 'No submissions awaiting review'
                  : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} awaiting review`}
              </p>
            )}
          </div>

          {checkedCount > 0 && (
            <button
              onClick={() => setShowBulkConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Check size={15} />
              Approve {checkedCount} Selected
            </button>
          )}
        </div>

        {/* Loading skeletons */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse flex items-center gap-3"
              >
                <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                  <div className="w-8 h-8 bg-gray-100 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && submissions.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm py-16 flex flex-col items-center gap-3">
            <PartyPopper size={40} className="text-[#4DA6FF]" />
            <p
              className="text-xl font-bold"
              style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
            >
              All caught up!
            </p>
            <p className="text-sm text-gray-400">No submissions to review right now.</p>
          </div>
        )}

        {/* Queue list */}
        {!loading && submissions.length > 0 && (
          <div>
            {submissions.map((sub) => (
              <SubmissionCard
                key={sub._id}
                submission={sub}
                checked={checked.has(sub._id)}
                onToggleCheck={() => toggleCheck(sub._id)}
                onApprove={() => handleApprove(sub._id)}
                onReject={(reason) => handleReject(sub._id, reason)}
                removing={removing.has(sub._id)}
              />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface StatCardProps {
  icon: ReactNode
  label: string
  value: number | string
  accentColor: string
  highlight?: boolean
  linkTo?: string
}

export function StatCard({ icon, label, value, accentColor, highlight, linkTo }: StatCardProps) {
  const inner = (
    <div
      className={`bg-white rounded-xl p-5 shadow-sm border flex items-start gap-4 transition-shadow hover:shadow-md ${
        highlight ? 'border-[#FF6B6B]/40' : 'border-gray-100'
      }`}
    >
      <div
        className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0 text-white"
        style={{ backgroundColor: accentColor }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 font-medium leading-tight">{label}</p>
        <p
          className="text-3xl font-bold mt-0.5 leading-none"
          style={{ color: highlight ? '#FF6B6B' : '#1A3A7D' }}
        >
          {value}
        </p>
      </div>
      {highlight && (
        <span className="ml-auto text-xs bg-[#FF6B6B]/10 text-[#FF6B6B] font-semibold px-2 py-0.5 rounded-full self-start whitespace-nowrap">
          Action needed
        </span>
      )}
    </div>
  )

  if (linkTo) {
    return (
      <Link to={linkTo} className="block">
        {inner}
      </Link>
    )
  }
  return inner
}

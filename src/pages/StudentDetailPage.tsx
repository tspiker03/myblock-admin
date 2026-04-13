import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export function StudentDetailPage() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <Link
        to="/students"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        Back to Students
      </Link>

      <h2
        className="text-2xl font-bold mb-6"
        style={{ fontFamily: "'Lilita One', cursive", color: '#1A3A7D' }}
      >
        Student Detail
      </h2>

      <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center text-gray-400">
        <p className="text-sm">Detail view for student <code className="bg-gray-100 px-1 rounded">{id}</code> will appear here.</p>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Business } from '../types'
import LeadCard from '../components/LeadCard'
import toast from 'react-hot-toast'

export default function SavedLeads() {
  const [leads, setLeads] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leads', { params: { website_status: 'no_website', limit: 200 } })
      .then((r) => setLeads(r.data.businesses))
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[...Array(4)].map((_, i) => <div key={i} className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}</div>

  if (!leads.length) return (
    <div className="text-center py-20">
      <div className="text-5xl mb-4">🔖</div>
      <p className="font-semibold text-gray-700 dark:text-gray-300">No saved leads</p>
      <p className="text-sm text-gray-500 mt-1">Leads discovered via search are automatically saved here</p>
    </div>
  )

  const converted = leads.filter((b) => b.lead_status === 'converted')
  const interested = leads.filter((b) => b.lead_status === 'interested')
  const others = leads.filter((b) => !['converted', 'interested'].includes(b.lead_status))

  function Section({ title, items, emoji }: { title: string; items: Business[]; emoji: string }) {
    if (!items.length) return null
    return (
      <div>
        <h2 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
          <span>{emoji}</span> {title}
          <span className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs px-2 py-0.5 rounded-full">{items.length}</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((biz) => (
            <LeadCard key={biz.id} business={biz}
              onUpdate={(u) => setLeads((prev) => prev.map((b) => b.id === u.id ? u : b))}
              onDelete={(id) => setLeads((prev) => prev.filter((b) => b.id !== id))}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Section title="Converted" items={converted} emoji="🏆" />
      <Section title="Interested" items={interested} emoji="⭐" />
      <Section title="All Other Leads" items={others} emoji="📋" />
    </div>
  )
}


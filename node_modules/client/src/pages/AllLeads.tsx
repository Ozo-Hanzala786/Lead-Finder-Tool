import { useEffect, useState, useCallback } from 'react'
import { Search, Filter, RefreshCw, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import api from '../lib/api'
import { Business, BUSINESS_CATEGORIES, LeadStatus, LEAD_STATUS_CONFIG } from '../types'
import LeadCard from '../components/LeadCard'
import toast from 'react-hot-toast'

export default function AllLeads() {
  const [leads, setLeads] = useState<Business[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ search: '', category: '', status: '', has_phone: false })
  const limit = 20

  const fetchLeads = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit, website_status: 'no_website' }
      if (filters.search) params.search = filters.search
      if (filters.category) params.category = filters.category
      if (filters.status) params.status = filters.status
      if (filters.has_phone) params.has_phone = 'true'
      const r = await api.get('/leads', { params })
      setLeads(r.data.businesses)
      setTotal(r.data.total)
    } catch {
      toast.error('Failed to load leads')
    } finally {
      setLoading(false)
    }
  }, [page, filters])

  useEffect(() => { fetchLeads() }, [fetchLeads])

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              placeholder="Search by name, city, category…"
              value={filters.search}
              onChange={(e) => { setFilters((f) => ({ ...f, search: e.target.value })); setPage(1) }}
              className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Category */}
          <select
            value={filters.category}
            onChange={(e) => { setFilters((f) => ({ ...f, category: e.target.value })); setPage(1) }}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Categories</option>
            {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>

          {/* Lead Status */}
          <select
            value={filters.status}
            onChange={(e) => { setFilters((f) => ({ ...f, status: e.target.value })); setPage(1) }}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>

          {/* Has Phone */}
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.has_phone}
              onChange={(e) => { setFilters((f) => ({ ...f, has_phone: e.target.checked })); setPage(1) }}
              className="rounded accent-violet-600"
            />
            Has Phone
          </label>

          <button onClick={fetchLeads} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {loading ? 'Loading…' : `${total} lead${total !== 1 ? 's' : ''} found`}
        </p>
        <span className="text-xs text-gray-400 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
          🌐 Showing: No Website Only
        </span>
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {leads.map((biz) => (
            <LeadCard
              key={biz.id}
              business={biz}
              onUpdate={(updated) => setLeads((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))}
              onDelete={(id) => { setLeads((prev) => prev.filter((b) => b.id !== id)); setTotal((t) => t - 1) }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-4xl mb-3">📋</p>
          <p className="font-semibold text-gray-700 dark:text-gray-300">No leads yet</p>
          <p className="text-sm mt-1">Use Find Leads to discover businesses without websites</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-700 dark:text-gray-300 px-3">
            Page {page} of {totalPages}
          </span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}


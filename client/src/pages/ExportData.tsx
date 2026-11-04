import { useState } from 'react'
import { Download, FileText, Table, FileJson, Filter } from 'lucide-react'
import { BUSINESS_CATEGORIES, LEAD_STATUS_CONFIG } from '../types'
import toast from 'react-hot-toast'

export default function ExportData() {
  const [filters, setFilters] = useState({ city: '', category: '', lead_status: '' })

  function buildQuery() {
    const q = new URLSearchParams()
    if (filters.city) q.set('city', filters.city)
    if (filters.category) q.set('category', filters.category)
    if (filters.lead_status) q.set('lead_status', filters.lead_status)
    return q.toString()
  }

  function handleExport(format: 'csv' | 'xlsx' | 'json') {
    const query = buildQuery()
    const url = `/api/export/${format}${query ? `?${query}` : ''}`
    const link = document.createElement('a')
    link.href = url
    link.download = `leads.${format}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success(`Exporting ${format.toUpperCase()}…`)
  }

  const formats = [
    {
      key: 'csv' as const,
      label: 'CSV',
      desc: 'Compatible with Excel, Google Sheets, and any spreadsheet app.',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-green-500 to-emerald-500',
    },
    {
      key: 'xlsx' as const,
      label: 'Excel (XLSX)',
      desc: 'Native Excel file with formatted columns.',
      icon: <Table className="w-6 h-6" />,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      key: 'json' as const,
      label: 'JSON',
      desc: 'Raw data for developers and API integrations.',
      icon: <FileJson className="w-6 h-6" />,
      color: 'from-orange-500 to-amber-500',
    },
  ]

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Download className="w-6 h-6" />
          <h2 className="text-xl font-bold">Export Leads</h2>
        </div>
        <p className="text-violet-200 text-sm">
          Download all verified leads (no website only) with full business information.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Filter Before Exporting (optional)</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            placeholder="City…"
            value={filters.city}
            onChange={(e) => setFilters((f) => ({ ...f, city: e.target.value }))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Categories</option>
            {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select
            value={filters.lead_status}
            onChange={(e) => setFilters((f) => ({ ...f, lead_status: e.target.value }))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">All Statuses</option>
            {Object.entries(LEAD_STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {formats.map(({ key, label, desc, icon, color }) => (
          <button
            key={key}
            onClick={() => handleExport(key)}
            className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 text-left hover:shadow-md hover:-translate-y-0.5 transition-all group"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
              {icon}
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{label}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{desc}</p>
            <div className="mt-3 flex items-center gap-1 text-xs font-medium text-violet-600 dark:text-violet-400">
              <Download className="w-3.5 h-3.5" /> Download
            </div>
          </button>
        ))}
      </div>

      {/* Info */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900 rounded-xl p-4">
        <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">📌 Export includes:</p>
        <ul className="mt-2 text-xs text-amber-600 dark:text-amber-400 space-y-1 list-disc list-inside">
          <li>Business Name, Phone, Email, Address, City, Country</li>
          <li>Category, Description, Website Status</li>
          <li>Google Maps URL, Social Media Links</li>
          <li>Lead Status, Quality Score, Notes, Assigned To</li>
          <li>Date Added</li>
        </ul>
      </div>
    </div>
  )
}


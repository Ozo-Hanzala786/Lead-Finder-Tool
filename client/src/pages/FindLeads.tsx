import { useState, useRef } from 'react'
import { Search, Globe, X, CheckCircle, AlertCircle, Loader2, ChevronDown } from 'lucide-react'
import toast from 'react-hot-toast'
import { BUSINESS_CATEGORIES, COUNTRIES, Business } from '../types'
import { cn } from '../lib/utils'
import LeadCard from '../components/LeadCard'

interface SearchForm {
  country: string
  city: string
  area: string
  category: string
  customCategory: string
  keywords: string
  limit: number
}

interface SearchEvent {
  type: 'status' | 'progress' | 'lead' | 'excluded' | 'done' | 'error'
  data: unknown
}

export default function FindLeads() {
  const [form, setForm] = useState<SearchForm>({
    country: '', city: '', area: '', category: '', customCategory: '', keywords: '', limit: 25,
  })
  const [isCustomCategory, setIsCustomCategory] = useState(false)
  const [searching, setSearching] = useState(false)
  const [statusLog, setStatusLog] = useState<string[]>([])
  const [leads, setLeads] = useState<Business[]>([])
  const [stats, setStats] = useState({ searched: 0, found: 0, excluded: 0 })
  const [done, setDone] = useState(false)
  const abortRef = useRef<(() => void) | null>(null)

  const update = (field: keyof SearchForm, value: string | number) => setForm((f) => ({ ...f, [field]: value }))

  const addLog = (msg: string) => setStatusLog((prev) => [...prev.slice(-49), msg])

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!form.country || !form.city) { toast.error('Country and city are required'); return }
    const cat = isCustomCategory ? form.customCategory : form.category
    if (!cat) { toast.error('Please select or enter a category'); return }

    setSearching(true)
    setStatusLog([])
    setLeads([])
    setDone(false)
    setStats({ searched: 0, found: 0, excluded: 0 })

    const payload = JSON.stringify({ country: form.country, city: form.city, area: form.area, category: cat, keywords: form.keywords, limit: form.limit })

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })

      if (!response.ok) throw new Error('Search failed')

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      abortRef.current = () => reader.cancel()

      while (true) {
        const { value, done: streamDone } = await reader.read()
        if (streamDone) break
        buffer += decoder.decode(value, { stream: true })
        const parts = buffer.split('\n\n')
        buffer = parts.pop() || ''

        for (const part of parts) {
          const lines = part.split('\n')
          const eventLine = lines.find((l) => l.startsWith('event:'))
          const dataLine = lines.find((l) => l.startsWith('data:'))
          if (!eventLine || !dataLine) continue
          const eventType = eventLine.slice(7).trim()
          const data = JSON.parse(dataLine.slice(5).trim())

          if (eventType === 'status') addLog(`${data.message}`)
          if (eventType === 'excluded') addLog(`⛔ Excluded: ${data.name} — ${data.reason}`)
          if (eventType === 'lead') {
            setLeads((prev) => [...prev, data as Business])
            setStats((s) => ({ ...s, found: s.found + 1 }))
            addLog(`✅ Found: ${data.name}`)
          }
          if (eventType === 'progress') {
            setStats((s) => ({ ...s, searched: data.searched, excluded: data.total - data.found }))
          }
          if (eventType === 'done') {
            setDone(true)
            setStats({ searched: data.searched, found: data.total, excluded: data.excluded })
            toast.success(`Search complete! Found ${data.total} leads.`)
          }
          if (eventType === 'error') {
            toast.error(data.message)
            addLog(`❌ Error: ${data.message}`)
          }
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Search failed'
      toast.error(msg)
    } finally {
      setSearching(false)
    }
  }

  function handleStop() {
    abortRef.current?.()
    setSearching(false)
    addLog('🛑 Search stopped by user')
  }

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Search Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
            <Search className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Find Businesses Without Websites</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Search real businesses and auto-verify their website status</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Country */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Country *</label>
            <div className="relative">
              <select
                value={form.country}
                onChange={(e) => update('country', e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              >
                <option value="">Select Country…</option>
                {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* City */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">City *</label>
            <input
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              placeholder="e.g. Karachi, Dubai, Lagos…"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          {/* Area */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Area / Neighbourhood (optional)</label>
            <input
              value={form.area}
              onChange={(e) => update('area', e.target.value)}
              placeholder="e.g. Downtown, Gulshan, Marina…"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Category */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Category *</label>
              <button type="button" onClick={() => setIsCustomCategory(!isCustomCategory)} className="text-xs text-violet-600 dark:text-violet-400 hover:underline">
                {isCustomCategory ? '← Back to list' : '+ Custom'}
              </button>
            </div>
            {isCustomCategory ? (
              <input
                value={form.customCategory}
                onChange={(e) => update('customCategory', e.target.value)}
                placeholder="Type any category…"
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                required
              />
            ) : (
              <div className="relative">
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
                  required
                >
                  <option value="">Select Category…</option>
                  {BUSINESS_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            )}
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Keywords (optional)</label>
            <input
              value={form.keywords}
              onChange={(e) => update('keywords', e.target.value)}
              placeholder="e.g. halal, luxury, local…"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          {/* Limit */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Number of Leads</label>
            <div className="relative">
              <select
                value={form.limit}
                onChange={(e) => update('limit', parseInt(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                {[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} leads</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Actions */}
          <div className="md:col-span-2 flex gap-3 pt-2">
            <button
              type="submit"
              disabled={searching}
              className="flex-1 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? 'Searching…' : 'Search Businesses'}
            </button>
            {searching && (
              <button type="button" onClick={handleStop} className="px-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 font-semibold rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2">
                <X className="w-4 h-4" /> Stop
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Search Progress */}
      {(searching || done) && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {searching ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-violet-500" />Searching…</span> : '✅ Search Complete'}
            </h3>
            <div className="flex gap-4 text-sm">
              <span className="text-gray-500">Scanned: <strong className="text-gray-900 dark:text-white">{stats.searched}</strong></span>
              <span className="text-green-600 dark:text-green-400">Found: <strong>{stats.found}</strong></span>
              <span className="text-red-500">Excluded: <strong>{stats.excluded}</strong></span>
            </div>
          </div>

          {/* Log */}
          <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 h-36 overflow-y-auto font-mono text-xs text-gray-600 dark:text-gray-400 space-y-1">
            {statusLog.map((log, i) => <div key={i}>{log}</div>)}
            {searching && <div className="searching text-violet-500">● Processing…</div>}
          </div>
        </div>
      )}

      {/* Results */}
      {leads.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{leads.length} Verified Leads (No Website)</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {leads.map((biz) => <LeadCard key={biz.id} business={biz} />)}
          </div>
        </div>
      )}

      {done && leads.length === 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-10 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
          <p className="font-semibold text-gray-900 dark:text-white">No verified leads found</p>
          <p className="text-sm text-gray-500 mt-1">All discovered businesses either have a website or couldn't be verified. Try a different category or city.</p>
        </div>
      )}
    </div>
  )
}


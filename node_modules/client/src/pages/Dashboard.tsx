import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Globe, TrendingUp, Star, ArrowRight, Search } from 'lucide-react'
import api from '../lib/api'
import { LEAD_STATUS_CONFIG, LeadStatus } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

interface Stats {
  total: number
  noWebsite: number
  byStatus: { lead_status: LeadStatus; cnt: number }[]
  byCategory: { category: string; cnt: number }[]
}

const STATUS_COLORS = ['#8b5cf6', '#f59e0b', '#10b981', '#f97316', '#059669', '#ef4444']

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/leads/stats/overview').then((r) => setStats(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <DashboardSkeleton />

  const conversionRate = stats?.total ? Math.round(((stats.byStatus.find(s => s.lead_status === 'converted')?.cnt || 0) / stats.total) * 100) : 0

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
        <h2 className="text-2xl font-bold mb-1">Welcome back! 👋</h2>
        <p className="text-violet-200 text-sm">Find businesses without websites and turn them into your next clients.</p>
        <Link to="/find-leads" className="mt-4 inline-flex items-center gap-2 bg-white text-violet-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-violet-50 transition-colors">
          <Search className="w-4 h-4" />
          Find New Leads
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Leads" value={stats?.total ?? 0} icon={<Users className="w-5 h-5" />} color="violet" />
        <KpiCard label="No Website" value={stats?.noWebsite ?? 0} icon={<Globe className="w-5 h-5" />} color="green" />
        <KpiCard label="Converted" value={stats?.byStatus.find(s => s.lead_status === 'converted')?.cnt ?? 0} icon={<TrendingUp className="w-5 h-5" />} color="emerald" />
        <KpiCard label="Conversion Rate" value={`${conversionRate}%`} icon={<Star className="w-5 h-5" />} color="amber" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Lead Status Breakdown</h3>
          {stats?.byStatus.length ? (
            <div className="space-y-2">
              {stats.byStatus.map(({ lead_status, cnt }) => {
                const config = LEAD_STATUS_CONFIG[lead_status]
                const pct = stats.total ? Math.round((cnt / stats.total) * 100) : 0
                return (
                  <div key={lead_status} className="flex items-center gap-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.color} w-24 text-center`}>{config.label}</span>
                    <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-violet-500 h-2 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 w-8 text-right">{cnt}</span>
                  </div>
                )
              })}
            </div>
          ) : (
            <EmptyChart />
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top Categories</h3>
          {stats?.byCategory.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.byCategory.slice(0, 6)} margin={{ left: -20 }}>
                <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#9ca3af' }} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} />
                <Tooltip contentStyle={{ background: '#1f2937', border: 'none', borderRadius: 8, color: '#f9fafb' }} />
                <Bar dataKey="cnt" name="Leads" radius={[4, 4, 0, 0]}>
                  {stats.byCategory.slice(0, 6).map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/find-leads', label: 'Search Businesses', icon: '🔍', color: 'from-violet-500 to-indigo-500' },
            { to: '/all-leads', label: 'Manage Leads', icon: '📋', color: 'from-blue-500 to-cyan-500' },
            { to: '/export', label: 'Export Data', icon: '📤', color: 'from-green-500 to-emerald-500' },
            { to: '/team', label: 'Manage Team', icon: '👥', color: 'from-orange-500 to-amber-500' },
          ].map(({ to, label, icon, color }) => (
            <Link key={to} to={to} className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white text-center hover:opacity-90 transition-opacity`}>
              <div className="text-2xl mb-2">{icon}</div>
              <p className="text-sm font-semibold">{label}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon, color }: { label: string; value: string | number; icon: React.ReactNode; color: string }) {
  const colors: Record<string, string> = {
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
    green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
  }
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
    </div>
  )
}

function EmptyChart() {
  return <div className="h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">No data yet. Start finding leads!</div>
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl" />)}
      </div>
    </div>
  )
}


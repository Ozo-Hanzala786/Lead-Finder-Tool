import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Search, Users, Bookmark,
  UserCog, Download, Settings, Zap,
} from 'lucide-react'
import { cn } from '../lib/utils'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/find-leads', icon: Search, label: 'Find Leads' },
  { to: '/all-leads', icon: Users, label: 'All Leads' },
  { to: '/saved-leads', icon: Bookmark, label: 'Saved Leads' },
  { to: '/team', icon: UserCog, label: 'Team' },
  { to: '/export', icon: Download, label: 'Export Data' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-bold text-gray-900 dark:text-white text-sm leading-none">LeadFinder</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Business Discovery</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {nav.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
              )
            }
          >
            <Icon className="w-4 h-4" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-800">
        <div className="bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-xl p-3">
          <p className="text-xs font-semibold text-violet-700 dark:text-violet-300">Pro Tip</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">Add your SerpAPI key in Settings to enable live Google Maps business search.</p>
        </div>
      </div>
    </aside>
  )
}


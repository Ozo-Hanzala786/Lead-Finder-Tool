import { Moon, Sun, Bell } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLocation } from 'react-router-dom'

const titles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/find-leads': 'Find Leads',
  '/all-leads': 'All Leads',
  '/saved-leads': 'Saved Leads',
  '/team': 'Team Management',
  '/export': 'Export Data',
  '/settings': 'Settings',
}

export default function Header() {
  const { dark, toggle } = useTheme()
  const { pathname } = useLocation()
  const title = titles[pathname] || 'LeadFinder'

  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-6 shrink-0">
      <h1 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Toggle theme"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  )
}


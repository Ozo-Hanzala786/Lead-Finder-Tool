import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import FindLeads from './pages/FindLeads'
import AllLeads from './pages/AllLeads'
import SavedLeads from './pages/SavedLeads'
import Team from './pages/Team'
import ExportData from './pages/ExportData'
import Settings from './pages/Settings'
import { ThemeProvider, useTheme } from './context/ThemeContext'

function AppInner() {
  const { dark } = useTheme()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  return (
    <div className={dark ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="find-leads" element={<FindLeads />} />
            <Route path="all-leads" element={<AllLeads />} />
            <Route path="saved-leads" element={<SavedLeads />} />
            <Route path="team" element={<Team />} />
            <Route path="export" element={<ExportData />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  )
}

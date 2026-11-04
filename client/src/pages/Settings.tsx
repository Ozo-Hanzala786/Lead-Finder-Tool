import { useState } from 'react'
import { Settings2, Key, Building2, Save, ExternalLink } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import toast from 'react-hot-toast'

export default function Settings() {
  const { agencyName, setAgencyName } = useTheme()
  const [name, setName] = useState(agencyName)
  const [apiKey, setApiKey] = useState(localStorage.getItem('serpApiKey') || '')
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setAgencyName(name)
    localStorage.setItem('serpApiKey', apiKey)
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Agency Settings */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Agency Settings</h2>
            <p className="text-xs text-gray-500">Used in generated pitches and exports</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">Agency Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your agency name…"
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
      </div>

      {/* API Key */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
            <Key className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">SerpAPI Key</h2>
            <p className="text-xs text-gray-500">Powers real Google Maps business search</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1.5">API Key</label>
            <input
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              placeholder="AIza…"
              className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Store this key in <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">server/.env</code> as <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-[11px]">SERP_API_KEY</code>
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl p-4 space-y-2">
            <p className="text-sm font-medium text-blue-700 dark:text-blue-300">🔑 How to get a SerpAPI key:</p>
            <ol className="text-xs text-blue-600 dark:text-blue-400 space-y-1 list-decimal list-inside">
              <li>Go to serpapi.com and create a free account</li>
              <li>Free plan gives 100 searches/month</li>
              <li>Copy your API key from the dashboard</li>
              <li>Paste it in <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">server/.env</code> as <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">SERP_API_KEY</code></li>
              <li>Restart the backend server</li>
            </ol>
            <a
              href="https://serpapi.com/manage-api-key"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mt-1"
            >
              Open SerpAPI Dashboard <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <Settings2 className="w-5 h-5 text-gray-500" />
          </div>
          <h2 className="font-semibold text-gray-900 dark:text-white">About LeadFinder</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <p>🚀 <strong className="text-gray-800 dark:text-gray-200">LeadFinder</strong> — Business Lead Discovery Platform</p>
          <p>Helps digital agencies find real businesses without websites and turn them into clients.</p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            {[
              ['Backend', 'Node.js + Express'],
              ['Database', 'JSON (lowdb)'],
              ['Frontend', 'React + TypeScript'],
              ['Styling', 'Tailwind CSS'],
              ['Business Data', 'SerpAPI (Google Maps)'],
              ['Verification', 'HTTP Website Check'],
            ].map(([k, v]) => (
              <div key={k} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2">
                <span className="text-gray-400">{k}:</span> <span className="font-medium text-gray-700 dark:text-gray-300">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
      >
        <Save className="w-4 h-4" />
        {saved ? '✅ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}


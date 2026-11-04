import { useState } from 'react'
import { X, Copy, MessageCircle, Share2, Mail, Loader2 } from 'lucide-react'
import { Business } from '../types'
import api from '../lib/api'
import toast from 'react-hot-toast'
import { useTheme } from '../context/ThemeContext'

interface Props {
  business: Business
  onClose: () => void
}

type Channel = 'whatsapp' | 'instagram' | 'email'

const CHANNELS: { key: Channel; label: string; icon: React.ReactNode; color: string }[] = [
  { key: 'whatsapp', label: 'WhatsApp', icon: <MessageCircle className="w-4 h-4" />, color: 'bg-green-500 hover:bg-green-600' },
  { key: 'instagram', label: 'Instagram', icon: <Share2 className="w-4 h-4" />, color: 'bg-pink-500 hover:bg-pink-600' },
  { key: 'email', label: 'Email', icon: <Mail className="w-4 h-4" />, color: 'bg-blue-500 hover:bg-blue-600' },
]

export default function PitchModal({ business, onClose }: Props) {
  const { agencyName } = useTheme()
  const [channel, setChannel] = useState<Channel>('whatsapp')
  const [pitch, setPitch] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    try {
      const r = await api.post('/pitch', {
        business_id: business.id,
        channel,
        agency_name: agencyName,
        services: ['website development', 'digital marketing', 'AI automation', 'graphic design'],
      })
      setPitch(r.data.pitch)
    } catch {
      toast.error('Failed to generate pitch')
    } finally {
      setLoading(false)
    }
  }

  function copyPitch() {
    navigator.clipboard.writeText(pitch)
    toast.success('Copied to clipboard!')
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">AI Pitch Generator</h3>
            <p className="text-xs text-gray-500 mt-0.5">{business.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Channel selector */}
        <div className="p-5">
          <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Choose outreach channel:</p>
          <div className="flex gap-2">
            {CHANNELS.map(({ key, label, icon, color }) => (
              <button
                key={key}
                onClick={() => { setChannel(key); setPitch('') }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition-all ${color} ${channel === key ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-current scale-105' : 'opacity-70'}`}
              >
                {icon} {label}
              </button>
            ))}
          </div>

          <button
            onClick={generate}
            disabled={loading}
            className="mt-4 w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : '✨'}
            {loading ? 'Generating…' : 'Generate Pitch'}
          </button>

          {pitch && (
            <div className="mt-4">
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap border border-gray-200 dark:border-gray-800 max-h-64 overflow-y-auto">
                {pitch}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={copyPitch} className="flex-1 flex items-center justify-center gap-2 text-sm font-medium bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-xl transition-colors">
                  <Copy className="w-4 h-4" /> Copy
                </button>
                {channel === 'whatsapp' && business.phone && (
                  <a
                    href={`https://wa.me/${business.phone.replace(/\D/g, '')}?text=${encodeURIComponent(pitch)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 text-sm font-medium bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Send WhatsApp
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


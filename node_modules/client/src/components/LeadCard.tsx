import { useState } from 'react'
import { Phone, MapPin, Tag, ExternalLink, Star, ChevronDown, MessageSquare, Mail, Share2, Globe } from 'lucide-react'
import { Business, LEAD_STATUS_CONFIG, LeadStatus } from '../types'
import { cn } from '../lib/utils'
import api from '../lib/api'
import toast from 'react-hot-toast'
import PitchModal from './PitchModal'

interface Props {
  business: Business
  onUpdate?: (updated: Business) => void
  onDelete?: (id: string) => void
}

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-600 dark:text-green-400' :
  s >= 50 ? 'text-yellow-600 dark:text-yellow-400' :
  'text-red-500'

export default function LeadCard({ business: biz, onUpdate, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [status, setStatus] = useState<LeadStatus>(biz.lead_status)
  const [pitchOpen, setPitchOpen] = useState(false)

  async function updateStatus(s: LeadStatus) {
    setStatus(s)
    try {
      const r = await api.patch(`/leads/${biz.id}`, { lead_status: s })
      onUpdate?.(r.data)
      toast.success(`Status updated to ${LEAD_STATUS_CONFIG[s].label}`)
    } catch {
      toast.error('Failed to update status')
    }
  }

  async function handleDelete() {
    if (!confirm(`Delete "${biz.name}"?`)) return
    try {
      await api.delete(`/leads/${biz.id}`)
      onDelete?.(biz.id)
      toast.success('Lead deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const score = biz.quality_score ?? 0
  const statusConf = LEAD_STATUS_CONFIG[status]

  return (
    <>
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow">
        {/* Top bar */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">{biz.name}</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 shrink-0">
                No Website ✓
              </span>
            </div>
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500 dark:text-gray-400">
              <Tag className="w-3 h-3" />
              {biz.category}
            </div>
          </div>
          {/* Score */}
          <div className="text-center ml-3 shrink-0">
            <div className={cn('text-xl font-bold', SCORE_COLOR(score))}>{score}</div>
            <div className="text-[10px] text-gray-400">Score</div>
          </div>
        </div>

        {/* Info */}
        <div className="px-4 pb-3 space-y-1.5">
          {biz.phone && (
            <a href={`tel:${biz.phone}`} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              <Phone className="w-3.5 h-3.5" /> {biz.phone}
            </a>
          )}
          {biz.address && (
            <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
              <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="line-clamp-1">{biz.address}</span>
            </div>
          )}
          {biz.description && (
            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{biz.description}</p>
          )}
        </div>

        {/* Status + Actions */}
        <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
          <div className="relative group">
            <button className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1', statusConf.color)}>
              {statusConf.label}
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg py-1 z-10 w-36 hidden group-hover:block">
              {Object.entries(LEAD_STATUS_CONFIG).map(([key, conf]) => (
                <button key={key} onClick={() => updateStatus(key as LeadStatus)} className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {conf.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1 ml-auto">
            {biz.google_maps_url && (
              <a href={biz.google_maps_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title="View on Maps">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {biz.instagram_url && (
              <a href={biz.instagram_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-pink-500 transition-colors" title="Instagram">
                <Share2 className="w-3.5 h-3.5" />
              </a>
            )}
            {biz.facebook_url && (
              <a href={biz.facebook_url} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-500 transition-colors" title="Facebook">
                <Globe className="w-3.5 h-3.5" />
              </a>
            )}
            <button onClick={() => setPitchOpen(true)} className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-500 transition-colors" title="Generate Pitch">
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setExpanded(!expanded)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
              <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', expanded && 'rotate-180')} />
            </button>
          </div>
        </div>

        {/* Expanded section */}
        {expanded && (
          <div className="border-t border-gray-100 dark:border-gray-800 px-4 py-3 bg-gray-50 dark:bg-gray-950 space-y-2">
            {biz.email && <p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{biz.email}</p>}
            <p className="text-xs text-gray-500"><span className="font-medium">Country:</span> {biz.country}</p>
            <p className="text-xs text-gray-500"><span className="font-medium">Added:</span> {new Date(biz.created_at).toLocaleDateString()}</p>
            {biz.notes && <p className="text-xs text-gray-500 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-2 border border-yellow-200 dark:border-yellow-900">{biz.notes}</p>}
            <button onClick={handleDelete} className="text-xs text-red-500 hover:underline">Delete Lead</button>
          </div>
        )}
      </div>

      {pitchOpen && <PitchModal business={biz} onClose={() => setPitchOpen(false)} />}
    </>
  )
}


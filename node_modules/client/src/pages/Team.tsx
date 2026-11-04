import { useEffect, useState } from 'react'
import { UserPlus, Trash2, Users } from 'lucide-react'
import api from '../lib/api'
import { TeamMember } from '../types'
import toast from 'react-hot-toast'

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', email: '', role: 'agent' })
  const [adding, setAdding] = useState(false)

  useEffect(() => {
    api.get('/team').then((r) => setMembers(r.data)).finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.email) return
    setAdding(true)
    try {
      const r = await api.post('/team', form)
      setMembers((prev) => [...prev, r.data])
      setForm({ name: '', email: '', role: 'agent' })
      toast.success('Team member added')
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to add member')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Remove ${name} from the team?`)) return
    try {
      await api.delete(`/team/${id}`)
      setMembers((prev) => prev.filter((m) => m.id !== id))
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  const ROLE_COLORS: Record<string, string> = {
    admin: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
    manager: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    agent: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Add Member Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">Add Team Member</h2>
            <p className="text-xs text-gray-500">Assign leads to team members for outreach</p>
          </div>
        </div>

        <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            placeholder="Full name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <input
            placeholder="Email address"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
            required
          />
          <div className="flex gap-2">
            <select
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
            >
              <option value="agent">Agent</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={adding}
              className="bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white font-semibold px-4 rounded-lg text-sm transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Team List */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-200 dark:border-gray-800">
          <Users className="w-4 h-4 text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Team Members</h3>
          <span className="ml-auto text-sm text-gray-500">{members.length} member{members.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />)}
          </div>
        ) : members.length === 0 ? (
          <div className="p-10 text-center text-gray-400 dark:text-gray-600">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm">No team members yet. Add one above.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((m) => (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white text-sm font-bold">
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{m.name}</p>
                  <p className="text-xs text-gray-500 truncate">{m.email}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${ROLE_COLORS[m.role] || ROLE_COLORS.agent}`}>
                  {m.role}
                </span>
                <button
                  onClick={() => handleDelete(m.id, m.name)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}


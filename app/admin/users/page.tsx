'use client'
import { useMemo, useState } from 'react'
import { api, useList, FilterTabs } from '@/components/admin/kit'
import { useFeedback } from '@/components/ui/feedback'
import { PageHeader, EmptyState, ErrorState, SkeletonList, StatusPill, Avatar } from '@/components/ui/states'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/brand/icons'
import { formatDate } from '@/lib/utils'

type User = { id: string; fullName: string; email: string; username: string; role: string; plan: string; status: string; studentId: string; createdAt: string }

const PLAN_LABELS: Record<string, string> = {
  FREE: 'Free',
  BASIC: 'Basic Training ($30)',
  ADVANCED: 'Advanced Trading ($103)',
  MASTERY: 'Mastery Bundle ($124)',
  PREMIUM: 'Premium Signals ($51/mo)',
  MENTORSHIP: 'Personal Mentorship ($207)',
}

type Filter = 'ALL' | 'PENDING' | 'APPROVED' | 'AFFILIATE'

export default function AdminUsersPage() {
  const { toast, confirm } = useFeedback()
  const { data: users, setData: setUsers, loading, error, reload } = useList<User>('/api/admin/users')
  const [filter, setFilter] = useState<Filter>('ALL')
  const [q, setQ] = useState('')

  async function updateUser(u: User, updates: Partial<User>, msg: string) {
    try {
      const updated = await api<Partial<User>>('/api/admin/users', 'PATCH', { id: u.id, ...updates })
      setUsers((prev) => prev.map((x) => (x.id === u.id ? { ...x, ...updated } : x)))
      toast(msg)
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Update failed', 'error')
    }
  }

  async function reject(u: User) {
    if (!(await confirm({ title: `Reject ${u.fullName}?`, message: 'They will not be able to sign in until re-approved.', confirmLabel: 'Reject' }))) return
    updateUser(u, { status: 'REJECTED' }, 'User rejected')
  }

  const counts = useMemo(() => ({
    ALL: users.length,
    PENDING: users.filter((u) => u.status === 'PENDING').length,
    APPROVED: users.filter((u) => u.status === 'APPROVED').length,
    AFFILIATE: users.filter((u) => u.role === 'AFFILIATE').length,
  }), [users])

  const term = q.trim().toLowerCase()
  const filtered = users.filter((u) => {
    if (filter === 'PENDING' && u.status !== 'PENDING') return false
    if (filter === 'APPROVED' && u.status !== 'APPROVED') return false
    if (filter === 'AFFILIATE' && u.role !== 'AFFILIATE') return false
    if (!term) return true
    return [u.fullName, u.email, u.username, u.studentId].some((v) => v.toLowerCase().includes(term))
  })

  return (
    <div className="fade-in">
      <PageHeader title="Users" subtitle={`${users.length} members · ${counts.PENDING} awaiting approval`} />

      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
        <div className="flex-1 min-w-0"><FilterTabs value={filter} onChange={setFilter} options={(['ALL', 'PENDING', 'APPROVED', 'AFFILIATE'] as Filter[]).map((k) => ({ key: k, label: k.charAt(0) + k.slice(1).toLowerCase(), count: counts[k] }))} /></div>
        <div className="relative md:w-72">
          <Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-dim" />
          <input className="field field-sm pl-9" placeholder="Search name, email, ID…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search users" />
        </div>
      </div>

      {loading ? <SkeletonList rows={5} height={64} /> : error ? <ErrorState description={error} action={<Button variant="secondary" onClick={reload}>Retry</Button>} /> : filtered.length === 0 ? (
        <EmptyState icon="users" title="No users found" />
      ) : (
        <div className="table-wrap">
          <table className="table !min-w-[860px]">
            <thead><tr><th>Member</th><th>Email</th><th>Role</th><th>Plan</th><th>Status</th><th className="text-right">Actions</th></tr></thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.fullName} size={32} />
                      <div className="min-w-0"><div className="text-ink font-semibold truncate">{u.fullName}</div><div className="text-dim text-xs num">{u.studentId} · joined {formatDate(u.createdAt)}</div></div>
                    </div>
                  </td>
                  <td className="text-muted">{u.email}</td>
                  <td><span className={`pill ${u.role === 'AFFILIATE' ? 'pill-gold' : 'pill-neutral'}`}>{u.role}</span></td>
                  <td>
                    <select className="field field-sm !w-auto !min-h-[32px] !py-1" value={u.plan} onChange={(e) => updateUser(u, { plan: e.target.value }, 'Plan updated')} aria-label={`Plan for ${u.fullName}`}>
                      {Object.entries(PLAN_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                  </td>
                  <td><StatusPill status={u.status} /></td>
                  <td className="text-right whitespace-nowrap">
                    {u.status === 'PENDING' ? (
                      <div className="inline-flex gap-1.5">
                        <Button size="sm" variant="success-soft" icon="check" onClick={() => updateUser(u, { status: 'APPROVED' }, 'User approved')}>Approve</Button>
                        <Button size="sm" variant="danger-soft" onClick={() => reject(u)}>Reject</Button>
                      </div>
                    ) : u.status === 'REJECTED' ? (
                      <Button size="sm" variant="outline" onClick={() => updateUser(u, { status: 'APPROVED' }, 'User re-approved')}>Re-approve</Button>
                    ) : (
                      <span className="text-dim text-xs inline-flex items-center gap-1"><Icon name="checkCircle" size={14} className="text-success-text" /> Active</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

import React, { useState } from 'react'
import { View, ScrollView, TextInput } from 'react-native'
import { useQueryClient } from '@tanstack/react-query'
import { Ionicons } from '@expo/vector-icons'
import { useApi } from '@/api/hooks'
import { apiFetch } from '@/api/client'
import { Screen, Loader, ErrorState, EmptyState, Button, PlanBadge, StatusPill, Chip, Badge, useTheme, spacing, radius, family } from '@/components/ui'
import { Select } from '@/components/Select'
import { AdminRow } from '@/components/AdminRow'

type AdminUser = { id: string; fullName: string; email: string; username: string; role: 'USER' | 'AFFILIATE' | 'ADMIN'; plan: string; status: 'PENDING' | 'APPROVED' | 'REJECTED'; studentId: string }

const PLANS = [
  { label: 'Free', value: 'FREE' }, { label: 'Basic Training', value: 'BASIC' }, { label: 'Advanced Trading', value: 'ADVANCED' },
  { label: 'Mastery Bundle', value: 'MASTERY' }, { label: 'Premium Signals', value: 'PREMIUM' }, { label: 'Personal Mentorship', value: 'MENTORSHIP' },
]
const ROLES = [{ label: 'User', value: 'USER' }, { label: 'Affiliate', value: 'AFFILIATE' }, { label: 'Admin', value: 'ADMIN' }]

export default function AdminUsersScreen() {
  const qc = useQueryClient()
  const { c } = useTheme()
  const { data, isLoading, isError, refetch, isRefetching } = useApi<AdminUser[]>('/api/admin/users')
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'AFFILIATE'>('ALL')
  const [q, setQ] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const users = data ?? []

  async function patch(id: string, payload: Record<string, string>) {
    await apiFetch('/api/admin/users', { method: 'PATCH', body: { id, ...payload } }).catch(() => {})
    qc.invalidateQueries({ queryKey: ['/api/admin/users'] })
  }

  if (isLoading) return <Screen><Loader /></Screen>
  if (isError) return <Screen><ErrorState message="Couldn’t load users" onRetry={() => refetch()} /></Screen>

  const term = q.trim().toLowerCase()
  const shown = users.filter((u) =>
    (filter === 'ALL' || (filter === 'AFFILIATE' ? u.role === 'AFFILIATE' : u.status === filter)) &&
    (!term || [u.fullName, u.email, u.username, u.studentId].some((v) => v.toLowerCase().includes(term)))
  )

  return (
    <Screen scroll refreshing={isRefetching} onRefresh={refetch}>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.card, borderWidth: 1, borderColor: c.border, borderRadius: radius.md, paddingHorizontal: 12, height: 46 }}>
          <Ionicons name="search" size={18} color={c.dim} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search name, email, ID" placeholderTextColor={c.dim} style={{ flex: 1, color: c.ink, fontFamily: family.body, fontSize: 15 }} autoCapitalize="none" />
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, padding: spacing.lg }}>
        {(['ALL', 'PENDING', 'APPROVED', 'AFFILIATE'] as const).map((f) => (
          <Chip key={f} label={`${f.charAt(0) + f.slice(1).toLowerCase()} (${f === 'ALL' ? users.length : users.filter((u) => (f === 'AFFILIATE' ? u.role === 'AFFILIATE' : u.status === f)).length})`} active={filter === f} onPress={() => setFilter(f)} />
        ))}
      </ScrollView>
      <View style={{ paddingHorizontal: spacing.lg }}>
        {shown.length === 0 ? (
          <EmptyState icon="people-outline" title="No users found" />
        ) : (
          shown.map((u) => (
            <AdminRow
              key={u.id}
              title={u.fullName}
              subtitle={`@${u.username} · ${u.email}\n${u.studentId}`}
              badge={<View style={{ alignItems: 'flex-end', gap: 4 }}><StatusPill status={u.status} /><Badge label={u.role} tone={u.role === 'AFFILIATE' ? 'gold' : 'neutral'} /></View>}
            >
              <View style={{ width: '100%', gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <PlanBadge plan={u.plan} />
                  <Button title={expanded === u.id ? 'Done' : 'Edit plan & role'} variant="ghost" size="sm" block={false} onPress={() => setExpanded(expanded === u.id ? null : u.id)} />
                </View>
                {expanded === u.id ? (
                  <View>
                    <Select label="Plan" value={u.plan} options={PLANS} onChange={(v) => patch(u.id, { plan: v })} />
                    <Select label="Role" value={u.role} options={ROLES} onChange={(v) => patch(u.id, { role: v })} />
                  </View>
                ) : null}
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {u.status !== 'APPROVED' ? <Button title={u.status === 'REJECTED' ? 'Re-approve' : 'Approve'} variant="successSoft" icon="checkmark" size="sm" style={{ flex: 1 }} onPress={() => patch(u.id, { status: 'APPROVED' })} /> : null}
                  {u.status !== 'REJECTED' ? <Button title="Reject" variant="dangerSoft" size="sm" style={{ flex: 1 }} onPress={() => patch(u.id, { status: 'REJECTED' })} /> : null}
                </View>
              </View>
            </AdminRow>
          ))
        )}
      </View>
    </Screen>
  )
}

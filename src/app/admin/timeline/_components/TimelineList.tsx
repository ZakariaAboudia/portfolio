'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import * as AlertDialog from '@radix-ui/react-alert-dialog'
import TimelineForm from '@/components/admin/TimelineForm'
import { useToastContext } from '@/components/shared/ToastProvider'
import type { TimelineEntry } from '@/types/prisma'
import type { TranslatableField } from '@/types/prisma'

function getTitle(entry: TimelineEntry): string {
  const t = entry.title as TranslatableField
  return t?.en ?? ''
}

interface TimelineListProps {
  entries: TimelineEntry[]
}

export default function TimelineList({ entries: initialEntries }: TimelineListProps) {
  const { addToast } = useToastContext()
  const router = useRouter()
  const [, startTransition] = useTransition()
  const [entries, setEntries] = useState<TimelineEntry[]>(initialEntries)
  const [editTarget, setEditTarget] = useState<TimelineEntry | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<TimelineEntry | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSave(data: Record<string, unknown>, id?: string) {
    setSaving(true)
    async function doSave() {
      const url = id ? `/api/admin/timeline/${id}` : '/api/admin/timeline'
      const method = id ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.status === 403) { addToast({ type: 'demo-blocked' }); return }
      if (!res.ok) { addToast({ type: 'save-error', onRetry: doSave }); return }
      const saved = await res.json() as TimelineEntry
      if (id) setEntries(prev => prev.map(e => e.id === id ? saved : e))
      else setEntries(prev => [saved, ...prev])
      addToast({ type: 'save-success' })
      setEditTarget(null)
      setAddOpen(false)
      startTransition(() => router.refresh())
    }
    try { await doSave() } catch { addToast({ type: 'network-error' }) } finally { setSaving(false) }
  }

  async function handleDelete(entry: TimelineEntry) {
    const res = await fetch(`/api/admin/timeline/${entry.id}`, { method: 'DELETE' })
    if (res.status === 403) addToast({ type: 'demo-blocked' })
    else if (!res.ok) addToast({ type: 'network-error' })
    else { setEntries(prev => prev.filter(e => e.id !== entry.id)); addToast({ type: 'delete-success' }); startTransition(() => router.refresh()) }
    setDeleteTarget(null)
  }

  function formatDate(d: string | Date) {
    const dt = d instanceof Date ? d : new Date(d)
    return dt.getFullYear().toString()
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-end">
        <Dialog.Root open={addOpen} onOpenChange={setAddOpen}>
          <Dialog.Trigger asChild>
            <button className="min-h-[44px] px-4 py-2 text-sm font-medium text-accent hover:bg-accent-muted transition-colors" style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}>
              + Add entry
            </button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
            <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-bg-elevated rounded p-6" style={{ border: '1px solid var(--border-default)' }}>
              <Dialog.Title className="text-lg font-bold font-mono text-text-primary mb-4">Add timeline entry</Dialog.Title>
              <TimelineForm onSave={data => handleSave(data)} onCancel={() => setAddOpen(false)} saving={saving} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {entries.length === 0 && <p className="text-sm text-text-muted text-center py-8">No timeline entries added yet.</p>}

      <div className="flex flex-col gap-2">
        {entries.map(entry => (
          <div key={entry.id} className="group flex items-center justify-between gap-4 p-3 bg-bg-elevated rounded" style={{ border: '1px solid var(--border-subtle)' }}>
            <div className="flex flex-col gap-0.5 min-w-0">
              <p className="text-sm font-medium text-text-primary truncate">{getTitle(entry)}</p>
              <p className="text-xs font-mono text-text-muted">{entry.organization} · {formatDate(entry.startDate)} – {entry.endDate ? formatDate(entry.endDate) : 'Present'} · {entry.type}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Dialog.Root open={editTarget?.id === entry.id} onOpenChange={open => { if (!open) setEditTarget(null) }}>
                <Dialog.Trigger asChild>
                  <button onClick={() => setEditTarget(entry)} className="text-xs font-mono text-text-secondary hover:text-text-primary min-h-[36px] px-2">Edit</button>
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                  <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-bg-elevated rounded p-6" style={{ border: '1px solid var(--border-default)' }}>
                    <Dialog.Title className="text-lg font-bold font-mono text-text-primary mb-4">Edit timeline entry</Dialog.Title>
                    {editTarget && <TimelineForm initialData={{...editTarget, startDate: editTarget.startDate.toString(), endDate: editTarget.endDate?.toString()}} onSave={data => handleSave(data, editTarget.id)} onCancel={() => setEditTarget(null)} saving={saving} />}
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>

              <AlertDialog.Root open={deleteTarget?.id === entry.id} onOpenChange={open => { if (!open) setDeleteTarget(null) }}>
                <AlertDialog.Trigger asChild>
                  <button onClick={() => setDeleteTarget(entry)} className="text-xs font-mono text-error opacity-0 group-hover:opacity-100 transition-opacity min-h-[36px] px-2">Delete</button>
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
                  <AlertDialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm bg-bg-elevated rounded p-6" style={{ border: '1px solid var(--border-default)' }}>
                    <AlertDialog.Title className="text-base font-bold text-text-primary mb-2">Delete {getTitle(entry)}?</AlertDialog.Title>
                    <AlertDialog.Description className="text-sm text-text-secondary mb-4">This action cannot be undone.</AlertDialog.Description>
                    <div className="flex justify-end gap-3">
                      <AlertDialog.Cancel asChild>
                        <button className="min-h-[44px] px-4 py-2 text-sm text-text-secondary hover:text-text-primary" style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}>Cancel</button>
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <button onClick={() => handleDelete(entry)} className="min-h-[44px] px-4 py-2 text-sm text-error hover:bg-bg-subtle" style={{ border: '1px solid var(--error)', borderRadius: 4 }}>Delete</button>
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import * as Label from '@radix-ui/react-label'
import LocaleTabPanel from './LocaleTabPanel'
import type { TranslatableField } from '@/types/prisma'

interface TimelineFormData {
  titleEn: string
  titleFr: string
  descriptionEn: string
  descriptionFr: string
  organization: string
  startDate: string
  endDate: string
  type: 'work' | 'education' | 'project'
}

interface TimelineFormProps {
  initialData?: {
    id: string
    title: unknown
    description: unknown
    organization: string
    startDate: string | Date
    endDate?: string | Date | null
    type: string
  }
  onSave: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

function toT(v: unknown): TranslatableField {
  if (v && typeof v === 'object' && 'en' in v) return v as TranslatableField
  return { en: '' }
}

function toDateStr(d: string | Date | null | undefined): string {
  if (!d) return ''
  const dt = d instanceof Date ? d : new Date(d)
  return dt.toISOString().split('T')[0]
}

export default function TimelineForm({ initialData, onSave, onCancel, saving }: TimelineFormProps) {
  const initTitle = toT(initialData?.title)
  const initDesc = toT(initialData?.description)

  const [form, setForm] = useState<TimelineFormData>({
    titleEn: initTitle.en ?? '',
    titleFr: initTitle.fr ?? '',
    descriptionEn: initDesc.en ?? '',
    descriptionFr: initDesc.fr ?? '',
    organization: initialData?.organization ?? '',
    startDate: toDateStr(initialData?.startDate),
    endDate: toDateStr(initialData?.endDate),
    type: (initialData?.type as TimelineFormData['type']) ?? 'work',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TimelineFormData, string>>>({})

  function validate(field: keyof TimelineFormData) {
    const errs = { ...errors }
    const required: (keyof TimelineFormData)[] = ['titleEn', 'descriptionEn', 'organization', 'startDate']
    if (required.includes(field) && !form[field].toString().trim()) errs[field] = 'Required'
    else delete errs[field]
    setErrors(errs)
  }

  const isValid =
    !!form.titleEn.trim() && !!form.descriptionEn.trim() &&
    !!form.organization.trim() && !!form.startDate

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${err ? '' : ''}`
  const fieldStyle = { border: '1px solid var(--border-default)', borderRadius: 4 }
  const errorFieldStyle = { border: '1px solid var(--error)', borderRadius: 4 }

  function set<K extends keyof TimelineFormData>(k: K, v: TimelineFormData[K]) {
    setForm(p => ({ ...p, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    const title: TranslatableField = { en: form.titleEn, ...(form.titleFr ? { fr: form.titleFr } : {}) }
    const description: TranslatableField = { en: form.descriptionEn, ...(form.descriptionFr ? { fr: form.descriptionFr } : {}) }
    await onSave({
      title,
      description,
      organization: form.organization.trim(),
      startDate: form.startDate,
      endDate: form.endDate || null,
      type: form.type,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LocaleTabPanel
        enContent={
          <div className="flex flex-col gap-3">
            <div>
              <Label.Root htmlFor="tf-title-en" className="block text-xs font-mono text-text-muted mb-1">Title (EN) *</Label.Root>
              <input
                id="tf-title-en"
                value={form.titleEn}
                onChange={e => set('titleEn', e.target.value)}
                onBlur={() => validate('titleEn')}
                className={inputClass(errors.titleEn)}
                style={errors.titleEn ? errorFieldStyle : fieldStyle}
              />
              {errors.titleEn && <p className="text-xs font-mono text-error mt-0.5">{errors.titleEn}</p>}
            </div>
            <div>
              <Label.Root htmlFor="tf-desc-en" className="block text-xs font-mono text-text-muted mb-1">Description (EN) *</Label.Root>
              <textarea
                id="tf-desc-en"
                value={form.descriptionEn}
                onChange={e => set('descriptionEn', e.target.value)}
                onBlur={() => validate('descriptionEn')}
                rows={3}
                className={`${inputClass(errors.descriptionEn)} resize-y`}
                style={errors.descriptionEn ? errorFieldStyle : fieldStyle}
              />
              {errors.descriptionEn && <p className="text-xs font-mono text-error mt-0.5">{errors.descriptionEn}</p>}
            </div>
          </div>
        }
        frContent={
          <div className="flex flex-col gap-3">
            <div>
              <Label.Root htmlFor="tf-title-fr" className="block text-xs font-mono text-text-muted mb-1">Title (FR)</Label.Root>
              <input id="tf-title-fr" value={form.titleFr} onChange={e => set('titleFr', e.target.value)} className={inputClass()} style={fieldStyle} />
            </div>
            <div>
              <Label.Root htmlFor="tf-desc-fr" className="block text-xs font-mono text-text-muted mb-1">Description (FR)</Label.Root>
              <textarea id="tf-desc-fr" value={form.descriptionFr} onChange={e => set('descriptionFr', e.target.value)} rows={3} className={`${inputClass()} resize-y`} style={fieldStyle} />
            </div>
          </div>
        }
      />

      <div>
        <Label.Root htmlFor="tf-org" className="block text-xs font-mono text-text-muted mb-1">Organization *</Label.Root>
        <input
          id="tf-org"
          value={form.organization}
          onChange={e => set('organization', e.target.value)}
          onBlur={() => validate('organization')}
          className={inputClass(errors.organization)}
          style={errors.organization ? errorFieldStyle : fieldStyle}
        />
        {errors.organization && <p className="text-xs font-mono text-error mt-0.5">{errors.organization}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label.Root htmlFor="tf-start" className="block text-xs font-mono text-text-muted mb-1">Start date *</Label.Root>
          <input
            id="tf-start"
            type="date"
            value={form.startDate}
            onChange={e => set('startDate', e.target.value)}
            onBlur={() => validate('startDate')}
            className={inputClass(errors.startDate)}
            style={errors.startDate ? errorFieldStyle : fieldStyle}
          />
          {errors.startDate && <p className="text-xs font-mono text-error mt-0.5">{errors.startDate}</p>}
        </div>
        <div>
          <Label.Root htmlFor="tf-end" className="block text-xs font-mono text-text-muted mb-1">End date</Label.Root>
          <input
            id="tf-end"
            type="date"
            value={form.endDate}
            onChange={e => set('endDate', e.target.value)}
            className={inputClass()}
            style={fieldStyle}
            placeholder="Leave empty for present"
          />
        </div>
      </div>

      <div>
        <Label.Root htmlFor="tf-type" className="block text-xs font-mono text-text-muted mb-1">Type *</Label.Root>
        <select
          id="tf-type"
          value={form.type}
          onChange={e => set('type', e.target.value as TimelineFormData['type'])}
          className="w-full px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
          style={fieldStyle}
        >
          <option value="work">Work</option>
          <option value="education">Education</option>
          <option value="project">Project</option>
        </select>
      </div>

      <div className="flex gap-3 justify-end pt-2 sticky bottom-0 bg-bg-elevated py-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="min-h-[44px] px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
          style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isValid || saving}
          aria-busy={saving}
          className="min-h-[44px] px-4 py-2 text-sm font-medium text-accent hover:bg-accent-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}

'use client'

import { useState } from 'react'
import * as Label from '@radix-ui/react-label'
import LocaleTabPanel from './LocaleTabPanel'
import TagInput from './TagInput'
import RichTextEditor from './RichTextEditor'
import type { TranslatableField } from '@/types/prisma'
import { REGION_OPTIONS } from '@/lib/region-coords'

interface ProjectFormData {
  slug: string
  titleEn: string
  titleFr: string
  descriptionEn: string
  descriptionFr: string
  bodyEn: string
  bodyFr: string
  techStack: string[]
  clientRegion: string
  published: boolean
}

interface ProjectFormProps {
  initialData?: {
    id: string
    slug: string
    title: unknown
    description: unknown
    body: unknown
    techStack: string[]
    clientRegion: string | null
    published: boolean
  }
  onSave: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

function toTranslatable(v: unknown): TranslatableField {
  if (v && typeof v === 'object' && 'en' in v) return v as TranslatableField
  return { en: '' }
}

export default function ProjectForm({ initialData, onSave, onCancel, saving }: ProjectFormProps) {
  const initTitle = toTranslatable(initialData?.title)
  const initDesc = toTranslatable(initialData?.description)
  const initBody = toTranslatable(initialData?.body)

  const [form, setForm] = useState<ProjectFormData>({
    slug: initialData?.slug ?? '',
    titleEn: initTitle.en ?? '',
    titleFr: initTitle.fr ?? '',
    descriptionEn: initDesc.en ?? '',
    descriptionFr: initDesc.fr ?? '',
    bodyEn: initBody.en ?? '',
    bodyFr: initBody.fr ?? '',
    techStack: initialData?.techStack ?? [],
    clientRegion: initialData?.clientRegion ?? '',
    published: initialData?.published ?? false,
  })
  const [slugLocked, setSlugLocked] = useState(!!initialData)
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({})

  function slugify(text: string) {
    return text.toLowerCase().trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  function validate(field: keyof ProjectFormData) {
    const errs = { ...errors }
    if (field === 'slug' && !form.slug.trim()) errs.slug = 'Required'
    else if (field === 'slug') delete errs.slug
    if (field === 'titleEn' && !form.titleEn.trim()) errs.titleEn = 'Required'
    else if (field === 'titleEn') delete errs.titleEn
    if (field === 'descriptionEn' && !form.descriptionEn.trim()) errs.descriptionEn = 'Required'
    else if (field === 'descriptionEn') delete errs.descriptionEn
    setErrors(errs)
  }

  const isValid = !!form.slug.trim() && !!form.titleEn.trim() && !!form.descriptionEn.trim()

  function set<K extends keyof ProjectFormData>(key: K, value: ProjectFormData[K]) {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'titleEn' && !slugLocked) {
        next.slug = slugify(value as string)
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    const title: TranslatableField = { en: form.titleEn, ...(form.titleFr ? { fr: form.titleFr } : {}) }
    const description: TranslatableField = { en: form.descriptionEn, ...(form.descriptionFr ? { fr: form.descriptionFr } : {}) }
    const body: TranslatableField = { en: form.bodyEn, ...(form.bodyFr ? { fr: form.bodyFr } : {}) }
    await onSave({
      slug: form.slug.trim(),
      title,
      description,
      body,
      techStack: form.techStack,
      clientRegion: form.clientRegion || null,
      published: form.published,
    })
  }

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${err ? 'ring-1 ring-error' : ''}`

  const fieldStyle = { border: '1px solid var(--border-default)', borderRadius: 4 }
  const errorFieldStyle = { border: '1px solid var(--error)', borderRadius: 4 }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <LocaleTabPanel
        enContent={
          <div className="flex flex-col gap-3">
            <div>
              <Label.Root htmlFor="pf-title-en" className="block text-xs font-mono text-text-muted mb-1">Title (EN) *</Label.Root>
              <input
                id="pf-title-en"
                value={form.titleEn}
                onChange={e => set('titleEn', e.target.value)}
                onBlur={() => validate('titleEn')}
                className={inputClass(errors.titleEn)}
                style={errors.titleEn ? errorFieldStyle : fieldStyle}
                aria-describedby={errors.titleEn ? 'pf-title-en-err' : undefined}
              />
              {errors.titleEn && <p id="pf-title-en-err" className="text-xs font-mono text-error mt-0.5">{errors.titleEn}</p>}
            </div>
            <div>
              <Label.Root htmlFor="pf-desc-en" className="block text-xs font-mono text-text-muted mb-1">Description (EN) *</Label.Root>
              <textarea
                id="pf-desc-en"
                value={form.descriptionEn}
                onChange={e => set('descriptionEn', e.target.value)}
                onBlur={() => validate('descriptionEn')}
                rows={3}
                className={`${inputClass(errors.descriptionEn)} resize-y`}
                style={errors.descriptionEn ? errorFieldStyle : fieldStyle}
                aria-describedby={errors.descriptionEn ? 'pf-desc-en-err' : undefined}
              />
              {errors.descriptionEn && <p id="pf-desc-en-err" className="text-xs font-mono text-error mt-0.5">{errors.descriptionEn}</p>}
            </div>
            <div>
              <Label.Root className="block text-xs font-mono text-text-muted mb-1">Body (EN)</Label.Root>
              <RichTextEditor
                value={form.bodyEn}
                onChange={html => set('bodyEn', html)}
                placeholder="Full project write-up…"
              />
            </div>
          </div>
        }
        frContent={
          <div className="flex flex-col gap-3">
            <div>
              <Label.Root htmlFor="pf-title-fr" className="block text-xs font-mono text-text-muted mb-1">Title (FR)</Label.Root>
              <input
                id="pf-title-fr"
                value={form.titleFr}
                onChange={e => set('titleFr', e.target.value)}
                className={inputClass()}
                style={fieldStyle}
              />
            </div>
            <div>
              <Label.Root htmlFor="pf-desc-fr" className="block text-xs font-mono text-text-muted mb-1">Description (FR)</Label.Root>
              <textarea
                id="pf-desc-fr"
                value={form.descriptionFr}
                onChange={e => set('descriptionFr', e.target.value)}
                rows={3}
                className={`${inputClass()} resize-y`}
                style={fieldStyle}
              />
            </div>
            <div>
              <Label.Root className="block text-xs font-mono text-text-muted mb-1">Body (FR)</Label.Root>
              <RichTextEditor
                value={form.bodyFr}
                onChange={html => set('bodyFr', html)}
                placeholder="Version française…"
              />
            </div>
          </div>
        }
      />

      <div>
        <Label.Root htmlFor="pf-slug" className="block text-xs font-mono text-text-muted mb-1">
          Slug *
          {!slugLocked && <span className="ml-2 opacity-50">— auto from title</span>}
        </Label.Root>
        <input
          id="pf-slug"
          value={form.slug}
          onChange={e => {
            setSlugLocked(true)
            set('slug', e.target.value)
          }}
          onBlur={() => validate('slug')}
          className={inputClass(errors.slug)}
          style={errors.slug ? errorFieldStyle : fieldStyle}
          placeholder="auto-generated from title"
          aria-describedby={errors.slug ? 'pf-slug-err' : undefined}
        />
        {errors.slug && <p id="pf-slug-err" className="text-xs font-mono text-error mt-0.5">{errors.slug}</p>}
      </div>

      <TagInput
        label="Tech stack"
        value={form.techStack}
        onChange={tags => set('techStack', tags)}
      />

      <div>
        <Label.Root htmlFor="pf-region" className="block text-xs font-mono text-text-muted mb-1">Client region</Label.Root>
        <select
          id="pf-region"
          value={form.clientRegion}
          onChange={e => set('clientRegion', e.target.value)}
          className={inputClass()}
          style={fieldStyle}
        >
          <option value="">— none —</option>
          {REGION_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="pf-published"
          type="checkbox"
          checked={form.published}
          onChange={e => set('published', e.target.checked)}
          className="w-4 h-4 accent-amber-500"
        />
        <Label.Root htmlFor="pf-published" className="text-sm font-mono text-text-secondary">Published</Label.Root>
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

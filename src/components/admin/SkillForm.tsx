'use client'

import { useState } from 'react'
import * as Label from '@radix-ui/react-label'

interface SkillFormData {
  name: string
  category: string
  level: number
}

interface SkillFormProps {
  initialData?: { id: string; name: string; category: string; level: number }
  onSave: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
  saving?: boolean
}

export default function SkillForm({ initialData, onSave, onCancel, saving }: SkillFormProps) {
  const [form, setForm] = useState<SkillFormData>({
    name: initialData?.name ?? '',
    category: initialData?.category ?? '',
    level: initialData?.level ?? 3,
  })
  const [errors, setErrors] = useState<Partial<Record<keyof SkillFormData, string>>>({})

  function validate(field: keyof SkillFormData) {
    const errs = { ...errors }
    if (field === 'name' && !form.name.trim()) errs.name = 'Required'
    else if (field === 'name') delete errs.name
    if (field === 'category' && !form.category.trim()) errs.category = 'Required'
    else if (field === 'category') delete errs.category
    setErrors(errs)
  }

  const isValid = !!form.name.trim() && !!form.category.trim()

  const inputClass = (err?: string) =>
    `w-full px-3 py-2 text-sm text-text-primary bg-bg-base min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded ${err ? 'ring-1 ring-error' : ''}`
  const fieldStyle = { border: '1px solid var(--border-default)', borderRadius: 4 }
  const errorFieldStyle = { border: '1px solid var(--error)', borderRadius: 4 }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    await onSave({ name: form.name.trim(), category: form.category.trim(), level: form.level })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <Label.Root htmlFor="sf-name" className="block text-xs font-mono text-text-muted mb-1">Name *</Label.Root>
        <input
          id="sf-name"
          value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
          onBlur={() => validate('name')}
          className={inputClass(errors.name)}
          style={errors.name ? errorFieldStyle : fieldStyle}
          aria-describedby={errors.name ? 'sf-name-err' : undefined}
        />
        {errors.name && <p id="sf-name-err" className="text-xs font-mono text-error mt-0.5">{errors.name}</p>}
      </div>

      <div>
        <Label.Root htmlFor="sf-category" className="block text-xs font-mono text-text-muted mb-1">Category *</Label.Root>
        <input
          id="sf-category"
          value={form.category}
          onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          onBlur={() => validate('category')}
          className={inputClass(errors.category)}
          style={errors.category ? errorFieldStyle : fieldStyle}
          placeholder="e.g. Frontend, Backend, DevOps"
          aria-describedby={errors.category ? 'sf-category-err' : undefined}
        />
        {errors.category && <p id="sf-category-err" className="text-xs font-mono text-error mt-0.5">{errors.category}</p>}
      </div>

      <div>
        <Label.Root htmlFor="sf-level" className="block text-xs font-mono text-text-muted mb-1">
          Proficiency level: {form.level} / 5
        </Label.Root>
        <input
          id="sf-level"
          type="range"
          min={1}
          max={5}
          step={1}
          value={form.level}
          onChange={e => setForm(p => ({ ...p, level: Number(e.target.value) }))}
          className="w-full accent-amber-500 min-h-[44px]"
        />
        <div className="flex justify-between text-xs font-mono text-text-muted mt-0.5">
          {[1, 2, 3, 4, 5].map(n => <span key={n}>{n}</span>)}
        </div>
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

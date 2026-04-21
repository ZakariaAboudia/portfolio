'use client'

import { useState, useRef } from 'react'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  label?: string
}

export default function TagInput({ value, onChange, placeholder = 'Add tag, press Enter', label }: TagInputProps) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(tag: string) {
    const trimmed = tag.trim().replace(/,$/, '').trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed])
    }
    setInput('')
  }

  function removeTag(tag: string) {
    onChange(value.filter(t => t !== tag))
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && !input && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div>
      {label && (
        <label className="block text-xs font-mono text-text-muted mb-1">{label}</label>
      )}
      <div
        className="flex flex-wrap gap-1 p-2 min-h-[44px] cursor-text"
        style={{ border: '1px solid var(--border-default)', borderRadius: 4 }}
        onClick={() => inputRef.current?.focus()}
      >
        <div className="flex gap-1 overflow-x-auto flex-nowrap pb-0.5">
          {value.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono bg-accent-muted text-accent rounded shrink-0"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="hover:text-error focus:outline-none"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => { if (input) addTag(input) }}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] bg-transparent text-sm text-text-primary outline-none placeholder:text-text-muted"
        />
      </div>
    </div>
  )
}

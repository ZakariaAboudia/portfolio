'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect, useRef } from 'react'

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  hasError?: boolean
}

const btn =
  'px-3 py-2 text-sm font-mono text-text-secondary hover:text-text-primary hover:bg-bg-subtle rounded transition-colors disabled:opacity-40 min-h-[36px]'
const btnActive = 'bg-bg-subtle text-text-primary'
const sep = <span className="w-px self-stretch bg-border-default mx-1" />

export default function RichTextEditor({ value, onChange, placeholder, hasError }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'underline text-accent' } }),
      Image.configure({ HTMLAttributes: { class: 'rounded max-w-full' } }),
      Placeholder.configure({ placeholder: placeholder ?? 'Write something…' }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'min-h-[240px] px-4 py-3 focus:outline-none rich-text',
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current) editor.commands.setContent(value || '', false)
  }, [value, editor])

  async function handleImageUpload(file: File) {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/admin/images', { method: 'POST', body: formData })
    if (!res.ok) { alert('Image upload failed'); return }
    const { url } = await res.json()
    editor?.chain().focus().setImage({ src: url }).run()
  }

  if (!editor) return null

  const borderStyle = hasError
    ? { border: '1px solid var(--error)', borderRadius: 6 }
    : { border: '1px solid var(--border-default)', borderRadius: 6 }

  return (
    <div style={borderStyle} className="bg-bg-base overflow-hidden">
      <div
        className="flex flex-wrap items-center gap-1 px-3 py-2"
        style={{ borderBottom: '1px solid var(--border-default)' }}
      >
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}
          className={`${btn} ${editor.isActive('bold') ? btnActive : ''} font-bold`}>B</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`${btn} ${editor.isActive('italic') ? btnActive : ''} italic`}>I</button>
        <button type="button" onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`${btn} ${editor.isActive('strike') ? btnActive : ''} line-through`}>S</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${btn} ${editor.isActive('code') ? btnActive : ''}`}>`code`</button>
        {sep}
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${btn} ${editor.isActive('heading', { level: 2 }) ? btnActive : ''}`}>H2</button>
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`${btn} ${editor.isActive('heading', { level: 3 }) ? btnActive : ''}`}>H3</button>
        {sep}
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${btn} ${editor.isActive('bulletList') ? btnActive : ''}`}>• List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${btn} ${editor.isActive('orderedList') ? btnActive : ''}`}>1. List</button>
        <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`${btn} ${editor.isActive('codeBlock') ? btnActive : ''}`}>``` Block</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${btn} ${editor.isActive('blockquote') ? btnActive : ''}`}>" Quote</button>
        {sep}
        <button
          type="button"
          onClick={() => {
            const url = window.prompt('Link URL')
            if (url) editor.chain().focus().setLink({ href: url }).run()
            else editor.chain().focus().unsetLink().run()
          }}
          className={`${btn} ${editor.isActive('link') ? btnActive : ''}`}
        >
          🔗 Link
        </button>
        <button type="button"
          onClick={() => fileInputRef.current?.click()}
          className={btn}
        >
          🖼 Image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); e.target.value = '' }}
        />
        {sep}
        <button type="button" onClick={() => editor.chain().focus().undo().run()}
          className={btn} disabled={!editor.can().undo()}>↩ Undo</button>
        <button type="button" onClick={() => editor.chain().focus().redo().run()}
          className={btn} disabled={!editor.can().redo()}>↪ Redo</button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}

export default function RoughTopbar({ children }: { children: React.ReactNode }) {
  return (
    <header className="h-14 flex items-center justify-end gap-3 px-4 shrink-0">
      {children}
    </header>
  )
}

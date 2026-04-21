import RoughCard from '@/components/shared/RoughCard'

interface MapPlaceholderProps {
  label: string
}

export default function MapPlaceholder({ label }: MapPlaceholderProps) {
  return (
    <RoughCard className="min-h-[200px] flex items-center justify-center" padding="p-5">
      <p className="text-text-muted text-sm">{label}</p>
    </RoughCard>
  )
}

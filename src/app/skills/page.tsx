import { getTranslations } from 'next-intl/server'
import { getSkillsByCategory } from '@/lib/skills-data'
import SketchyChartDynamic from '@/components/portfolio/SketchyChartDynamic'
import EmptyState from '@/components/shared/EmptyState'
import SketchbookPage from '@/components/shared/SketchbookPage'

export default async function SkillsPage() {
  const [t, groups] = await Promise.all([
    getTranslations('skills'),
    getSkillsByCategory(),
  ])

  return (
    <main className="p-6 flex flex-col gap-6">
      <h1 className="text-2xl font-bold font-mono text-text-primary">{t('title')}</h1>
      <SketchbookPage>
        {groups.length === 0 ? (
          <EmptyState message={t('empty')} />
        ) : (
          <SketchyChartDynamic groups={groups} ariaLabel={t('ariaLabel')} />
        )}
      </SketchbookPage>
    </main>
  )
}

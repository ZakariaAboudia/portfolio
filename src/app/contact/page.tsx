import { getTranslations } from 'next-intl/server'
import ContactForm from '@/components/contact/ContactForm'
import PageHeading from '@/components/shared/PageHeading'

export async function generateMetadata() {
  const t = await getTranslations('contact')
  return { title: t('title') }
}

export default async function ContactPage() {
  const t = await getTranslations('contact')

  return (
    <main className="p-6 flex flex-col gap-6 max-w-lg">
      <PageHeading>{t('title')}</PageHeading>
      <p className="text-sm text-text-secondary">{t('subtitle')}</p>
      <ContactForm />
    </main>
  )
}

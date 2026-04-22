import { prisma } from '../src/lib/prisma'

const projects = [
  {
    slug: 'devflow',
    title: { en: 'DevFlow', fr: 'DevFlow' },
    description: {
      en: 'A developer productivity platform that aggregates GitHub, Jira, and CI/CD pipelines into a unified dashboard with real-time alerts and sprint analytics.',
      fr: 'Une plateforme de productivité qui agrège GitHub, Jira et les pipelines CI/CD dans un tableau de bord unifié.',
    },
    body: {
      en: '<p>DevFlow eliminates context-switching by pulling data from all your dev tools into one place. Built with a T3 stack, it uses tRPC for type-safe API calls, Prisma for data persistence, and WebSockets for live pipeline updates.</p>',
    },
    techStack: ['Next.js', 'tRPC', 'Prisma', 'PostgreSQL', 'Redis', 'GitHub API', 'Jira API'],
    clientRegion: 'North America',
    published: true,
  },
  {
    slug: 'fieldnotes-ai',
    title: { en: 'FieldNotes AI', fr: 'FieldNotes IA' },
    description: {
      en: 'An AI-powered field research tool that transcribes voice notes, extracts structured data, and syncs findings to a team knowledge base in real time.',
    },
    body: {
      en: '<p>Built for field researchers who need to capture observations without breaking flow. Audio is streamed to Whisper for transcription, then passed through a Gemini pipeline for entity extraction and tagging.</p>',
    },
    techStack: ['Next.js', 'Whisper API', 'Gemini', 'Supabase', 'PostgreSQL', 'Vercel'],
    clientRegion: 'Europe',
    published: true,
  },
  {
    slug: 'cartograph',
    title: { en: 'Cartograph' },
    description: {
      en: 'A collaborative mapping platform for urban planners. Teams annotate geospatial layers, run heatmap analyses, and export reports — all in the browser.',
    },
    body: {
      en: '<p>Cartograph replaces desktop GIS tools with a browser-native experience. MapLibre GL handles rendering, PostGIS powers spatial queries, and a WebSocket layer keeps annotations in sync across team members.</p>',
    },
    techStack: ['React', 'MapLibre GL', 'PostGIS', 'Node.js', 'WebSockets', 'S3'],
    clientRegion: 'EU Public Sector',
    published: true,
  },
  {
    slug: 'vaultpay',
    title: { en: 'VaultPay' },
    description: {
      en: 'A multi-currency payment orchestration layer that routes transactions across Stripe, Adyen, and PayPal based on fee optimization and regional compliance rules.',
    },
    body: {
      en: '<p>VaultPay abstracts payment provider complexity behind a single API. A rules engine evaluates each transaction against fee tables and compliance constraints before routing.</p>',
    },
    techStack: ['Node.js', 'Stripe', 'Adyen', 'PostgreSQL', 'Redis', 'BullMQ', 'Docker'],
    clientRegion: 'MENA',
    published: true,
  },
]

async function main() {
  console.log('Seeding projects...')

  for (const project of projects) {
    await prisma.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    })
    console.log(`  ✓ ${project.slug}`)
  }

  console.log('Done.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

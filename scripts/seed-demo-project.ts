import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const body = {
  en: `
<h2>Overview</h2>
<p>Built a real-time logistics coordination platform for a European freight operator managing cross-border shipments across 14 countries. The system replaced a patchwork of spreadsheets and email threads with a single source of truth — live shipment status, carrier assignment, exception handling, and automated customs documentation.</p>

<h2>The Problem</h2>
<p>Operations teams were losing 3–4 hours per day reconciling data between carriers, customs brokers, and warehouse systems. Delays in exception handling were costing roughly €40k/month in demurrage fees alone.</p>

<blockquote>The hardest part wasn't the tech — it was convincing twelve different carrier APIs to agree on what "in transit" means.</blockquote>

<h2>Architecture</h2>
<p>The system is built around an event-sourced core. Every state transition — pickup confirmed, border crossed, exception raised — is an immutable event. Read models are projections built on top. This made the audit trail trivial and gave ops the ability to replay any shipment history.</p>

<h3>Key decisions</h3>
<ul>
<li>PostgreSQL with LISTEN/NOTIFY for real-time push to the frontend — avoided adding a message broker for a team that didn't need one</li>
<li>Carrier adapters isolated behind a port/adapter boundary — adding a new carrier is a 2-hour task, not a week</li>
<li>Customs docs generated via a rule engine fed by HS codes and country pairs — no manual intervention for 94% of shipments</li>
</ul>

<h2>Results</h2>
<p>After 6 months in production across the full carrier network:</p>
<ul>
<li>Exception response time dropped from 4.2 hours to 22 minutes</li>
<li>Demurrage fees reduced by 78%</li>
<li>Ops headcount held flat while shipment volume grew 40%</li>
</ul>

<h2>What I'd do differently</h2>
<p>The carrier adapter layer works well but the schema for normalizing carrier events is too rigid. Edge cases in Eastern European customs handling required patching the normalizer repeatedly. A more flexible intermediate representation — something closer to a property bag with typed overlays — would have been cleaner.</p>

<pre><code>-- The query that ops teams run most often
SELECT s.id, s.status, s.last_event_at,
       c.name AS carrier, e.message AS last_exception
FROM shipments s
JOIN carriers c ON c.id = s.carrier_id
LEFT JOIN exceptions e ON e.shipment_id = s.id
  AND e.resolved_at IS NULL
WHERE s.region = 'EU' AND s.status != 'delivered'
ORDER BY e.raised_at ASC NULLS LAST;</code></pre>
`,
  fr: `
<h2>Vue d'ensemble</h2>
<p>Plateforme de coordination logistique en temps réel pour un opérateur de fret européen gérant des expéditions transfrontalières dans 14 pays. Le système a remplacé un ensemble hétéroclite de tableurs et de fils d'e-mails par une source unique de vérité.</p>

<h2>Résultats</h2>
<ul>
<li>Temps de réponse aux exceptions réduit de 4,2 heures à 22 minutes</li>
<li>Frais de surestarie réduits de 78%</li>
<li>Effectifs stables malgré une croissance de 40% du volume</li>
</ul>
`,
}

async function main() {
  // Remove existing demo project if any
  await prisma.project.deleteMany({ where: { slug: 'eu-logistics-platform' } })

  const project = await prisma.project.create({
    data: {
      slug: 'eu-logistics-platform',
      title: { en: 'EU Logistics Coordination Platform', fr: 'Plateforme Logistique Européenne' },
      description: {
        en: 'Real-time freight coordination across 14 countries — replacing spreadsheets with event-sourced shipment tracking, automated customs docs, and carrier exception management.',
        fr: 'Coordination du fret en temps réel dans 14 pays — remplacement des tableurs par un suivi des expéditions piloté par événements.',
      },
      body,
      techStack: ['PostgreSQL', 'Next.js', 'TypeScript', 'Event Sourcing', 'Docker', 'Redis', 'Prisma', 'REST'],
      clientRegion: 'Europe',
      published: true,
    },
  })

  console.log('Created project:', project.slug)

  // Also seed a few skills if none exist
  const skillCount = await prisma.skill.count()
  if (skillCount === 0) {
    await prisma.skill.createMany({
      data: [
        { name: 'TypeScript', category: 'Frontend', level: 5 },
        { name: 'React', category: 'Frontend', level: 5 },
        { name: 'Next.js', category: 'Frontend', level: 4 },
        { name: 'CSS / Tailwind', category: 'Frontend', level: 4 },
        { name: 'Node.js', category: 'Backend', level: 5 },
        { name: 'PostgreSQL', category: 'Backend', level: 4 },
        { name: 'Redis', category: 'Backend', level: 3 },
        { name: 'Docker', category: 'Backend', level: 3 },
        { name: 'Prisma', category: 'Backend', level: 4 },
        { name: 'Event Sourcing', category: 'Architecture', level: 3 },
        { name: 'System Design', category: 'Architecture', level: 4 },
        { name: 'DDD', category: 'Architecture', level: 2 },
        { name: 'Figma', category: 'Design', level: 3 },
        { name: 'roughjs', category: 'Design', level: 2 },
      ],
    })
    console.log('Seeded 14 skills')
  }

  // Seed timeline entries if none exist
  const timelineCount = await prisma.timelineEntry.count()
  if (timelineCount === 0) {
    await prisma.timelineEntry.createMany({
      data: [
        {
          title: { en: 'Senior Full-Stack Engineer', fr: 'Ingénieur Full-Stack Senior' },
          organization: 'Freelance / Independent',
          description: {
            en: 'Building product for European logistics, fintech, and SaaS clients. Focused on event-driven architecture, developer experience, and shipping things that last.',
            fr: 'Développement de produits pour des clients européens en logistique, fintech et SaaS.',
          },
          startDate: new Date('2021-03-01'),
          endDate: null,
          type: 'work',
        },
        {
          title: { en: 'Lead Engineer', fr: 'Ingénieur Lead' },
          organization: 'DataFlow GmbH',
          description: {
            en: 'Led a team of 6 engineers building a real-time data pipeline processing 40M events/day. Introduced event sourcing, reduced on-call incidents by 60%.',
            fr: 'Direction d\'une équipe de 6 ingénieurs sur un pipeline de données traitant 40M événements/jour.',
          },
          startDate: new Date('2018-06-01'),
          endDate: new Date('2021-02-01'),
          type: 'work',
        },
        {
          title: { en: 'Software Engineer', fr: 'Ingénieur Logiciel' },
          organization: 'Nexio Labs',
          description: {
            en: 'Full-stack engineer on a B2B SaaS platform. Owned the billing system migration from legacy Rails to a modern TypeScript microservice.',
            fr: 'Ingénieur full-stack sur une plateforme SaaS B2B. Migration du système de facturation.',
          },
          startDate: new Date('2016-09-01'),
          endDate: new Date('2018-05-01'),
          type: 'work',
        },
        {
          title: { en: 'M.Sc. Computer Science', fr: 'Master Informatique' },
          organization: 'Université de Montréal',
          description: {
            en: 'Specialisation in distributed systems. Thesis on consistency models in geo-replicated databases.',
            fr: 'Spécialisation en systèmes distribués. Thèse sur les modèles de cohérence dans les bases de données géo-répliquées.',
          },
          startDate: new Date('2014-09-01'),
          endDate: new Date('2016-06-01'),
          type: 'education',
        },
      ],
    })
    console.log('Seeded 4 timeline entries')
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })

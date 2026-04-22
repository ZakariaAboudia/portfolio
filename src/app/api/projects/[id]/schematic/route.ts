import { prisma } from '@/lib/prisma'
import { ratelimitStandard, getRateLimitIp } from '@/lib/rate-limit'
import { rateLimitedResponse } from '@/types/api'
import { GoogleGenerativeAI } from '@google/generative-ai'
import type { SchematicData } from '@/components/shared/ProjectSchematic'

const SYSTEM_PROMPT = `You are an architecture diagram generator for a developer portfolio.
Given a project title, description, and tech stack, return a JSON object describing a technical architecture schematic.

Rules:
- Return ONLY valid JSON, no markdown, no explanation
- 4–8 nodes maximum
- Nodes must fit in a 400×340 canvas with padding of 40px on all sides
- Space nodes clearly: minimum 80px apart
- Use simple short labels (1–2 words max)
- Edges show data flow direction
- Edge labels: 1 word max (e.g. "query", "fetch", "auth", "cache", "event")
- Mark 1–2 key nodes as accent: true (the most important ones)

JSON schema:
{
  "nodes": [{ "id": "string", "label": "string", "x": number, "y": number, "accent": boolean }],
  "edges": [{ "from": "string", "to": "string", "label": "string" }]
}

Layout guidelines — use these approximate y-bands:
- y=80: input/client layer
- y=180: core app layer
- y=280: data/infra layer`

function buildUserPrompt(title: string, description: string, techStack: string[]): string {
  return `Project: ${title}
Description: ${description}
Tech stack: ${techStack.join(', ')}`
}

function validateSchematic(data: unknown): data is SchematicData {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (!Array.isArray(d.nodes) || !Array.isArray(d.edges)) return false
  for (const n of d.nodes) {
    if (!n || typeof n !== 'object') return false
    const node = n as Record<string, unknown>
    if (typeof node.id !== 'string') return false
    if (typeof node.label !== 'string') return false
    if (typeof node.x !== 'number' || typeof node.y !== 'number') return false
  }
  for (const e of d.edges) {
    if (!e || typeof e !== 'object') return false
    const edge = e as Record<string, unknown>
    if (typeof edge.from !== 'string' || typeof edge.to !== 'string') return false
  }
  return true
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { schematicData: true, published: true },
  })

  if (!project || !project.published) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  if (project.schematicData) {
    return Response.json(project.schematicData)
  }

  return Response.json({ error: 'No schematic generated yet' }, { status: 404 })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const ip = getRateLimitIp(request)
  const { success } = await ratelimitStandard.limit(ip)
  if (!success) return rateLimitedResponse()

  const { id } = await params
  const project = await prisma.project.findUnique({
    where: { id },
    select: { id: true, title: true, description: true, techStack: true, schematicData: true, published: true, slug: true },
  })

  if (!project || !project.published) {
    return Response.json({ error: 'Not found' }, { status: 404 })
  }

  // Return cached if exists
  if (project.schematicData) {
    return Response.json(project.schematicData)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'GEMINI_API_KEY not configured' }, { status: 503 })
  }

  // Extract English text from translatable fields
  const titleField = project.title as Record<string, string>
  const descField = project.description as Record<string, string>
  const title = titleField.en ?? Object.values(titleField)[0] ?? project.slug
  const description = descField.en ?? Object.values(descField)[0] ?? ''

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: SYSTEM_PROMPT,
    })

    const result = await model.generateContent(buildUserPrompt(title, description, project.techStack))
    const text = result.response.text().trim()

    // Strip markdown code fences if present
    const json = text.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim()
    const parsed = JSON.parse(json)

    if (!validateSchematic(parsed)) {
      return Response.json({ error: 'Invalid schematic structure from AI' }, { status: 502 })
    }

    await prisma.project.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { schematicData: parsed as any },
    })

    return Response.json(parsed)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return Response.json({ error: `Generation failed: ${message}` }, { status: 502 })
  }
}

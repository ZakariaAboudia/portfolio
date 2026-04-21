import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

describe('Prisma schema and config', () => {
  it('prisma/schema.prisma exists', () => {
    expect(fs.existsSync(path.join(root, 'prisma/schema.prisma'))).toBe(true)
  })

  it('schema defines required models', () => {
    const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf-8')
    expect(schema).toContain('model Project')
    expect(schema).toContain('model Skill')
    expect(schema).toContain('model TimelineEntry')
    expect(schema).toContain('model ContactMessage')
    expect(schema).toContain('model User')
  })

  it('schema defines EntryType enum', () => {
    const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf-8')
    expect(schema).toContain('enum EntryType')
    expect(schema).toContain('work')
    expect(schema).toContain('education')
    expect(schema).toContain('project')
  })

  it('schema uses Json for translatable fields', () => {
    const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf-8')
    // Project title, description, body
    expect(schema).toMatch(/title\s+Json/)
    expect(schema).toMatch(/description\s+Json/)
    // TimelineEntry also has translatable fields
    const projectBlock = schema.match(/model Project \{[\s\S]*?\}/)
    expect(projectBlock?.[0]).toContain('Json')
  })

  it('schema uses @map for snake_case column names', () => {
    const schema = fs.readFileSync(path.join(root, 'prisma/schema.prisma'), 'utf-8')
    expect(schema).toContain('@map("created_at")')
    expect(schema).toContain('@map("updated_at")')
    expect(schema).toContain('@@map(')
  })

  it('prisma.config.ts exists at project root', () => {
    expect(fs.existsSync(path.join(root, 'prisma.config.ts'))).toBe(true)
  })

  it('src/lib/prisma.ts singleton exists', () => {
    expect(fs.existsSync(path.join(root, 'src/lib/prisma.ts'))).toBe(true)
  })

  it('prisma singleton uses globalThis pattern', () => {
    const content = fs.readFileSync(path.join(root, 'src/lib/prisma.ts'), 'utf-8')
    expect(content).toContain('globalThis')
    expect(content).toContain('PrismaClient')
  })

  it('src/types/prisma.ts exports TranslatableField type', () => {
    const content = fs.readFileSync(path.join(root, 'src/types/prisma.ts'), 'utf-8')
    expect(content).toContain('TranslatableField')
    expect(content).toContain('en: string')
  })

  it('initial migration exists', () => {
    const migrationsDir = path.join(root, 'prisma/migrations')
    expect(fs.existsSync(migrationsDir)).toBe(true)
    const migrations = fs.readdirSync(migrationsDir).filter(f => f !== 'migration_lock.toml')
    expect(migrations.length).toBeGreaterThan(0)
  })

  it('docker-compose includes postgres service', () => {
    const compose = fs.readFileSync(path.join(root, 'docker-compose.yml'), 'utf-8')
    expect(compose).toContain('postgres:')
    expect(compose).toContain('postgres:17-alpine')
    expect(compose).toContain('DATABASE_URL')
  })
})

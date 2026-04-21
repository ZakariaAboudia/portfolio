import { describe, it, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../..')

describe('Project scaffold', () => {
  it('required directories exist', () => {
    const dirs = [
      'src/app',
      'src/components/portfolio',
      'src/components/admin',
      'src/components/shared',
      'src/components/contact',
      'src/lib',
      'src/hooks',
      'src/i18n',
      'src/types',
    ]
    for (const dir of dirs) {
      expect(fs.existsSync(path.join(root, dir)), `${dir} should exist`).toBe(true)
    }
  })

  it('public/robots.txt disallows /admin/', () => {
    const robotsTxt = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf-8')
    expect(robotsTxt).toContain('User-agent: *')
    expect(robotsTxt).toContain('Disallow: /admin/')
  })

  it('.env.example exists with required variables', () => {
    const envExample = fs.readFileSync(path.join(root, '.env.example'), 'utf-8')
    expect(envExample).toContain('DATABASE_URL')
    expect(envExample).toContain('BETTER_AUTH_SECRET')
    expect(envExample).toContain('NEXT_PUBLIC_BASE_URL')
  })

  it('.github/workflows/ci.yml exists', () => {
    expect(fs.existsSync(path.join(root, '.github/workflows/ci.yml'))).toBe(true)
  })
})

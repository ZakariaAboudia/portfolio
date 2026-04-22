'use client'

import { useRef, useEffect } from 'react'

interface Props {
  seed: number
  techCount: number
  className?: string
}

function lcg(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0
    return s / 0x100000000
  }
}

function addLabel(
  svg: SVGSVGElement,
  x1: number, y1: number,
  x2: number, y2: number,
  text: string,
  accent: string,
) {
  const line = document.createElementNS('http://www.w3.org/2000/svg', 'line')
  line.setAttribute('x1', String(x1))
  line.setAttribute('y1', String(y1))
  line.setAttribute('x2', String(x2))
  line.setAttribute('y2', String(y2))
  line.setAttribute('stroke', accent)
  line.setAttribute('stroke-width', '0.6')
  line.setAttribute('opacity', '0.65')
  svg.appendChild(line)

  const label = document.createElementNS('http://www.w3.org/2000/svg', 'text')
  label.setAttribute('x', String(x2 + (x2 >= x1 ? 4 : -4)))
  label.setAttribute('y', String(y2 + 4))
  label.setAttribute('fill', accent)
  label.setAttribute('font-size', '9')
  label.setAttribute('font-family', 'monospace')
  label.setAttribute('opacity', '0.75')
  label.setAttribute('text-anchor', x2 >= x1 ? 'start' : 'end')
  label.textContent = text
  svg.appendChild(label)
}

export default function ProjectIllustration({ seed, techCount, className = '' }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const draw = async () => {
      try {
        const roughModule = await import('roughjs')
        const rough = (roughModule.default ?? roughModule) as typeof import('roughjs').default
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const rc = rough.svg(svg) as any

        svg.innerHTML = ''

        const rand = lcg(seed)
        const style = getComputedStyle(document.documentElement)
        const stroke = style.getPropertyValue('--border-default').trim() || '#3a342a'
        const accent = style.getPropertyValue('--accent').trim() || '#e8a020'
        const subtle = style.getPropertyValue('--border-subtle').trim() || '#2a2520'
        const bg = style.getPropertyValue('--bg-elevated').trim() || '#1a1710'

        const W = 400
        const H = 500

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const o = (roughness: number, sw: number, fill = 'none'): any => ({
          stroke,
          strokeWidth: sw,
          roughness,
          fill,
          fillStyle: 'hachure',
          fillWeight: 0.7,
          hachureGap: 7,
          seed: (seed + 3) >>> 0,
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const lo = (color: string, roughness = 0.5, sw = 0.8): any => ({
          stroke: color, strokeWidth: sw, roughness, fill: 'none', seed: (seed + 5) >>> 0,
        })

        // Corner brackets
        const bL = 22, bP = 16
        svg.appendChild(rc.line(bP, bP + bL, bP, bP, lo(subtle, 0.4)))
        svg.appendChild(rc.line(bP, bP, bP + bL, bP, lo(subtle, 0.4)))
        svg.appendChild(rc.line(W - bP, H - bP - bL, W - bP, H - bP, lo(subtle, 0.4)))
        svg.appendChild(rc.line(W - bP, H - bP, W - bP - bL, H - bP, lo(subtle, 0.4)))

        const animalType = seed % 6
        void techCount // reserved for future variation

        if (animalType === 0) {
          // ── CAT ──
          svg.appendChild(rc.ellipse(200, 340, 160, 165, o(1.4, 1.2, bg)))
          svg.appendChild(rc.circle(200, 195, 125, o(1.3, 1.2, bg)))
          // ears
          svg.appendChild(rc.polygon([[152, 148], [130, 92], [178, 135]], o(1.0, 1.0, bg)))
          svg.appendChild(rc.polygon([[248, 148], [270, 92], [222, 135]], o(1.0, 1.0, bg)))
          svg.appendChild(rc.polygon([[155, 141], [140, 101], [173, 132]], { ...lo(accent, 0.5, 0.6), fill: 'none' }))
          svg.appendChild(rc.polygon([[245, 141], [260, 101], [227, 132]], { ...lo(accent, 0.5, 0.6), fill: 'none' }))
          // eyes
          svg.appendChild(rc.ellipse(174, 188, 24, 17, o(0.5, 1.1)))
          svg.appendChild(rc.ellipse(226, 188, 24, 17, o(0.5, 1.1)))
          svg.appendChild(rc.ellipse(174, 188, 9, 14, o(0.3, 0.8, stroke)))
          svg.appendChild(rc.ellipse(226, 188, 9, 14, o(0.3, 0.8, stroke)))
          // nose
          svg.appendChild(rc.polygon([[197, 210], [203, 210], [200, 216]], { ...lo(accent, 0.4, 0.8), fill: accent }))
          // mouth
          svg.appendChild(rc.line(200, 216, 192, 224, lo(stroke, 0.8, 0.9)))
          svg.appendChild(rc.line(200, 216, 208, 224, lo(stroke, 0.8, 0.9)))
          // whiskers
          for (const [x1, y, x2] of [[118, 212, 188], [116, 221, 188], [120, 230, 188]] as number[][]) {
            svg.appendChild(rc.line(x1, y, x2, y + 1, lo(stroke, 0.4, 0.65)))
            svg.appendChild(rc.line(W - x1, y, W - x2, y + 1, lo(stroke, 0.4, 0.65)))
          }
          // tail
          svg.appendChild(rc.path('M 268 405 Q 345 368 322 298 Q 302 238 355 225', lo(stroke, 1.5, 1.3)))
          // paws
          svg.appendChild(rc.ellipse(158, 415, 48, 26, o(0.9, 0.9, bg)))
          svg.appendChild(rc.ellipse(242, 415, 48, 26, o(0.9, 0.9, bg)))

          addLabel(svg, 172, 132, 95, 92, '— ear floof', accent)
          addLabel(svg, 226, 188, 308, 163, '— murder eye', accent)
          addLabel(svg, 355, 225, 375, 205, '— boop zone', accent)

        } else if (animalType === 1) {
          // ── FOX ──
          svg.appendChild(rc.ellipse(295, 395, 118, 148, o(1.5, 1.2, bg)))
          svg.appendChild(rc.ellipse(308, 352, 52, 42, { ...lo(accent, 0.8, 1.0), fill: 'none' }))
          svg.appendChild(rc.ellipse(188, 345, 165, 155, o(1.3, 1.2, bg)))
          svg.appendChild(rc.circle(188, 200, 115, o(1.3, 1.2, bg)))
          // ears
          svg.appendChild(rc.polygon([[148, 160], [128, 96], [172, 150]], o(0.9, 1.0, bg)))
          svg.appendChild(rc.polygon([[228, 160], [248, 96], [204, 150]], o(0.9, 1.0, bg)))
          svg.appendChild(rc.polygon([[150, 154], [135, 105], [168, 147]], { ...lo(accent, 0.5, 0.6), fill: 'none' }))
          svg.appendChild(rc.polygon([[226, 154], [241, 105], [208, 147]], { ...lo(accent, 0.5, 0.6), fill: 'none' }))
          // snout
          svg.appendChild(rc.ellipse(188, 232, 62, 42, o(0.8, 1.0, bg)))
          // eyes
          svg.appendChild(rc.ellipse(164, 196, 19, 16, o(0.4, 1.0)))
          svg.appendChild(rc.ellipse(212, 196, 19, 16, o(0.4, 1.0)))
          svg.appendChild(rc.ellipse(164, 196, 9, 11, o(0.3, 0.8, stroke)))
          svg.appendChild(rc.ellipse(212, 196, 9, 11, o(0.3, 0.8, stroke)))
          // nose
          svg.appendChild(rc.ellipse(188, 221, 15, 11, { ...lo(stroke, 0.3, 0.8), fill: stroke }))
          // chest patch
          svg.appendChild(rc.ellipse(188, 334, 72, 84, lo(subtle, 0.9, 0.8)))

          addLabel(svg, 248, 96, 318, 76, '— pointy ear', accent)
          addLabel(svg, 188, 221, 100, 200, '— snoot', accent)
          addLabel(svg, 308, 352, 362, 330, '— fluffy tip', accent)

        } else if (animalType === 2) {
          // ── BUNNY ──
          svg.appendChild(rc.ellipse(200, 345, 158, 185, o(1.3, 1.2, bg)))
          svg.appendChild(rc.circle(200, 215, 108, o(1.2, 1.2, bg)))
          // ears
          svg.appendChild(rc.ellipse(168, 118, 42, 115, o(1.2, 1.0, bg)))
          svg.appendChild(rc.ellipse(232, 118, 42, 115, o(1.2, 1.0, bg)))
          svg.appendChild(rc.ellipse(168, 118, 22, 82, { ...lo(accent, 0.7, 0.7), fill: 'none' }))
          svg.appendChild(rc.ellipse(232, 118, 22, 82, { ...lo(accent, 0.7, 0.7), fill: 'none' }))
          // big eyes
          svg.appendChild(rc.circle(176, 208, 24, o(0.4, 1.0)))
          svg.appendChild(rc.circle(224, 208, 24, o(0.4, 1.0)))
          svg.appendChild(rc.circle(176, 208, 13, o(0.3, 0.9, stroke)))
          svg.appendChild(rc.circle(224, 208, 13, o(0.3, 0.9, stroke)))
          // eye shines
          for (const [cx, cy] of [[171, 204], [219, 204]]) {
            const sh = document.createElementNS('http://www.w3.org/2000/svg', 'circle')
            sh.setAttribute('cx', String(cx)); sh.setAttribute('cy', String(cy))
            sh.setAttribute('r', '3'); sh.setAttribute('fill', 'white'); sh.setAttribute('opacity', '0.85')
            svg.appendChild(sh)
          }
          // nose
          svg.appendChild(rc.ellipse(200, 228, 13, 9, { ...lo(accent, 0.4, 0.8), fill: accent }))
          // mouth
          svg.appendChild(rc.line(200, 232, 192, 240, lo(stroke, 0.8, 0.9)))
          svg.appendChild(rc.line(200, 232, 208, 240, lo(stroke, 0.8, 0.9)))
          // paws
          svg.appendChild(rc.ellipse(155, 422, 52, 28, o(0.9, 0.9, bg)))
          svg.appendChild(rc.ellipse(245, 422, 52, 28, o(0.9, 0.9, bg)))
          // tail
          svg.appendChild(rc.circle(272, 392, 38, o(1.3, 0.9, bg)))

          addLabel(svg, 168, 68, 88, 48, '— ear loaf', accent)
          addLabel(svg, 224, 208, 312, 185, '— big eye', accent)
          addLabel(svg, 272, 392, 342, 380, '— cotton tail', accent)

        } else if (animalType === 3) {
          // ── BEAR CUB ──
          svg.appendChild(rc.ellipse(200, 350, 195, 195, o(1.3, 1.3, bg)))
          svg.appendChild(rc.circle(200, 195, 145, o(1.2, 1.3, bg)))
          // round ears
          svg.appendChild(rc.circle(146, 135, 44, o(1.0, 1.1, bg)))
          svg.appendChild(rc.circle(254, 135, 44, o(1.0, 1.1, bg)))
          svg.appendChild(rc.circle(146, 135, 26, { ...lo(accent, 0.6, 0.7), fill: 'none' }))
          svg.appendChild(rc.circle(254, 135, 26, { ...lo(accent, 0.6, 0.7), fill: 'none' }))
          // snout
          svg.appendChild(rc.ellipse(200, 230, 75, 52, o(0.8, 1.0, bg)))
          // eyes
          svg.appendChild(rc.circle(174, 190, 22, o(0.4, 1.1)))
          svg.appendChild(rc.circle(226, 190, 22, o(0.4, 1.1)))
          svg.appendChild(rc.circle(174, 190, 11, o(0.3, 0.9, stroke)))
          svg.appendChild(rc.circle(226, 190, 11, o(0.3, 0.9, stroke)))
          // nose
          svg.appendChild(rc.ellipse(200, 220, 22, 15, { ...lo(stroke, 0.4, 1.0), fill: stroke }))
          // mouth
          svg.appendChild(rc.line(200, 227, 190, 237, lo(stroke, 0.8, 1.0)))
          svg.appendChild(rc.line(200, 227, 210, 237, lo(stroke, 0.8, 1.0)))
          // paws
          svg.appendChild(rc.ellipse(143, 432, 68, 40, o(1.0, 1.0, bg)))
          svg.appendChild(rc.ellipse(257, 432, 68, 40, o(1.0, 1.0, bg)))
          // belly patch
          svg.appendChild(rc.ellipse(200, 365, 92, 115, lo(subtle, 0.9, 0.8)))

          addLabel(svg, 254, 116, 322, 90, '— round ear', accent)
          addLabel(svg, 200, 220, 98, 196, '— snoot boop', accent)
          addLabel(svg, 200, 365, 300, 408, '— belly', accent)

        } else if (animalType === 4) {
          // ── DUCK ──
          svg.appendChild(rc.ellipse(195, 355, 215, 155, o(1.2, 1.2, bg)))
          svg.appendChild(rc.circle(295, 228, 82, o(1.2, 1.2, bg)))
          // beak
          svg.appendChild(rc.polygon([[326, 222], [378, 218], [328, 240]], { ...lo(accent, 0.7, 1.0), fill: accent + '99' }))
          // wing lines
          svg.appendChild(rc.path('M 130 335 Q 155 292 198 312 Q 242 332 264 310', lo(stroke, 1.4, 1.1)))
          svg.appendChild(rc.path('M 120 360 Q 150 318 192 338 Q 240 362 268 336', lo(subtle, 1.2, 0.8)))
          // eye
          svg.appendChild(rc.circle(308, 218, 19, o(0.4, 1.0)))
          svg.appendChild(rc.circle(308, 218, 10, o(0.3, 0.9, stroke)))
          // neck connection
          svg.appendChild(rc.line(268, 278, 242, 300, lo(stroke, 1.0, 1.4)))
          // feet
          svg.appendChild(rc.path('M 162 422 L 140 448 L 124 448 M 140 448 L 152 448', lo(accent, 1.0, 1.1)))
          svg.appendChild(rc.path('M 212 422 L 190 448 L 174 448 M 190 448 L 202 448', lo(accent, 1.0, 1.1)))
          // tail bump
          svg.appendChild(rc.path('M 98 340 Q 72 318 80 295 Q 88 272 108 280', lo(stroke, 1.3, 1.1)))

          addLabel(svg, 378, 218, 390, 192, '— quack hole', accent)
          addLabel(svg, 195, 318, 112, 278, '— wing flap', accent)
          addLabel(svg, 148, 448, 80, 462, '— flipper foot', accent)

        } else {
          // ── FROG ──
          svg.appendChild(rc.ellipse(200, 348, 228, 175, o(1.3, 1.3, bg)))
          svg.appendChild(rc.ellipse(200, 252, 185, 122, o(1.2, 1.2, bg)))
          // eyes on top
          svg.appendChild(rc.circle(148, 205, 54, o(0.9, 1.1, bg)))
          svg.appendChild(rc.circle(252, 205, 54, o(0.9, 1.1, bg)))
          svg.appendChild(rc.ellipse(148, 205, 24, 28, o(0.3, 1.0, stroke)))
          svg.appendChild(rc.ellipse(252, 205, 24, 28, o(0.3, 1.0, stroke)))
          // wide smile
          svg.appendChild(rc.arc(200, 298, 122, 62, 0.1, Math.PI - 0.1, false, lo(stroke, 1.2, 1.3)))
          // front legs
          svg.appendChild(rc.path('M 96 362 Q 65 394 76 426 Q 82 440 98 434 Q 114 444 122 432', lo(stroke, 1.4, 1.1)))
          svg.appendChild(rc.path('M 304 362 Q 335 394 324 426 Q 318 440 302 434 Q 286 444 278 432', lo(stroke, 1.4, 1.1)))
          // belly spots — count scales with techCount
          const spots = Math.min(Math.max(techCount, 3), 7)
          for (let i = 0; i < spots; i++) {
            const bx = 148 + i * (104 / spots) + (rand() - 0.5) * 12
            const by = 338 + (rand() - 0.5) * 22
            svg.appendChild(rc.circle(bx, by, 10 + rand() * 7, lo(subtle, 0.8, 0.5)))
          }
          // nostrils
          svg.appendChild(rc.circle(188, 258, 7, lo(subtle, 0.4, 0.6)))
          svg.appendChild(rc.circle(212, 258, 7, lo(subtle, 0.4, 0.6)))

          addLabel(svg, 148, 183, 76, 148, '— bloop eye', accent)
          addLabel(svg, 260, 298, 320, 275, '— big smile', accent)
          addLabel(svg, 80, 434, 46, 462, '— sticky toe', accent)
        }

      } catch {
        // roughjs unavailable — leave svg blank
      }
    }

    draw()
  }, [seed, techCount])

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox="0 0 400 500"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto' }}
    />
  )
}

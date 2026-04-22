'use client'

import { useRef, useEffect } from 'react'

export interface SchematicNode {
  id: string
  label: string
  x: number
  y: number
  accent?: boolean
}

export interface SchematicEdge {
  from: string
  to: string
  label?: string
}

export interface SchematicData {
  nodes: SchematicNode[]
  edges: SchematicEdge[]
}

interface Props {
  data: SchematicData
  className?: string
  seed?: number
}

export default function ProjectSchematic({ data, className = '', seed = 42 }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const draw = async () => {
      try {
        const roughModule = await import('roughjs')
        const rough = (roughModule.default ?? roughModule) as typeof import('roughjs').default
        const rc = rough.svg(svg)

        svg.innerHTML = ''

        const style = getComputedStyle(document.documentElement)
        const stroke = style.getPropertyValue('--text-secondary').trim() || '#a89f8c'
        const accent = style.getPropertyValue('--accent').trim() || '#e8a020'
        const subtle = style.getPropertyValue('--text-muted').trim() || '#6b6257'
        const bg = style.getPropertyValue('--bg-elevated').trim() || '#2e2a22'
        const textPrimary = style.getPropertyValue('--text-primary').trim() || '#1a1814'

        const NODE_W = 90
        const NODE_H = 38

        // --- THE MAGIC SPACING SCALER ---
        // We stretch the layout from the center so lines get 50% longer 
        // without making the boxes or text any bigger.
        const SCALE = 1.5
        const OLD_CX = 200, OLD_CY = 170   // Center of original 400x340
        const NEW_CX = 300, NEW_CY = 255   // Center of new 600x510
        
        const expandedNodes = data.nodes.map(n => ({
          ...n,
          x: NEW_CX + (n.x - OLD_CX) * SCALE,
          y: NEW_CY + (n.y - OLD_CY) * SCALE
        }))
        const nodeMap = new Map(expandedNodes.map(n => [n.id, n]))

        // 1. DRAW LINES & LABELS
        for (const edge of data.edges) {
          const from = nodeMap.get(edge.from)
          const to = nodeMap.get(edge.to)
          if (!from || !to) continue

          const dx = to.x - from.x
          const dy = to.y - from.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          const nx = dx / dist
          const ny = dy / dist
          
          const x1 = from.x + nx * (NODE_W / 2)
          const y1 = from.y + ny * (NODE_H / 2)
          const x2 = to.x - nx * (NODE_W / 2)
          const y2 = to.y - ny * (NODE_H / 2)

          svg.appendChild(rc.line(x1, y1, x2, y2, {
            stroke: subtle, strokeWidth: 1.2, roughness: 1.8, bowing: 1.5, seed,
          }))

          // Arrowheads
          const arrowLen = 8
          const arrowAngle = 0.4
          const ax1 = x2 - arrowLen * Math.cos(Math.atan2(dy, dx) - arrowAngle)
          const ay1 = y2 - arrowLen * Math.sin(Math.atan2(dy, dx) - arrowAngle)
          const ax2 = x2 - arrowLen * Math.cos(Math.atan2(dy, dx) + arrowAngle)
          const ay2 = y2 - arrowLen * Math.sin(Math.atan2(dy, dx) + arrowAngle)
          svg.appendChild(rc.line(x2, y2, ax1, ay1, { stroke: subtle, strokeWidth: 1, roughness: 0.8, seed }))
          svg.appendChild(rc.line(x2, y2, ax2, ay2, { stroke: subtle, strokeWidth: 1, roughness: 0.8, seed }))

          // Labels
          if (edge.label) {
            // Find Perpendicular Vector (Creates "Lanes")
            const pnx = -ny
            const pny = nx

            const mx = (x1 + x2) / 2
            const my = (y1 + y2) / 2

            // Push text 14 pixels perpendicularly away from the line
            const offset = 14
            let tx = mx + pnx * offset
            let ty = my + pny * offset
            let anchor = 'middle'

            // Fine-tune text anchoring based on line angle
            if (Math.abs(dy) > Math.abs(dx)) {
              // Mostly Vertical Line
              anchor = pnx < 0 ? 'end' : 'start'
              tx += pnx < 0 ? -4 : 4  // Extra padding from the line
              ty += 3                 // Vertically center SVG text
            } else {
              // Mostly Horizontal Line
              ty += pny < 0 ? -2 : 8  // Shift above or below baseline
            }

            const el = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            el.setAttribute('x', String(tx))
            el.setAttribute('y', String(ty))
            el.setAttribute('fill', subtle)
            el.setAttribute('font-size', '10')
            el.setAttribute('font-family', 'monospace')
            el.setAttribute('text-anchor', anchor)
            el.setAttribute('opacity', '0.8')
            el.textContent = edge.label
            svg.appendChild(el)
          }
        }

        // 2. DRAW NODES (Original Style)
        for (const node of expandedNodes) {
          const nodeStroke = node.accent ? accent : stroke
          const fillColor = node.accent ? `${accent}18` : bg

          svg.appendChild(rc.rectangle(
            node.x - NODE_W / 2, node.y - NODE_H / 2, NODE_W, NODE_H,
            {
              stroke: nodeStroke, strokeWidth: node.accent ? 1.4 : 1.0,
              roughness: 1.6, fill: fillColor, fillStyle: node.accent ? 'hachure' : 'solid',
              hachureAngle: 55, hachureGap: 5, fillWeight: 0.6, seed: seed + node.label.charCodeAt(0),
            }
          ))

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('x', String(node.x))
          text.setAttribute('y', String(node.y + 4))
          text.setAttribute('fill', node.accent ? accent : textPrimary)
          text.setAttribute('font-size', '11')
          text.setAttribute('font-family', 'monospace')
          text.setAttribute('text-anchor', 'middle')
          text.setAttribute('font-weight', node.accent ? 'bold' : 'normal')
          text.textContent = node.label.toUpperCase()
          svg.appendChild(text)
        }

        // 3. DRAW CORNER BRACKETS (Scaled to new bounds)
        const bL = 16, bP = 10
        const W = 600, H = 510 // New Expanded ViewBox dimensions
        svg.appendChild(rc.line(bP, bP + bL, bP, bP, { stroke: subtle, strokeWidth: 0.7, roughness: 0.5, seed }))
        svg.appendChild(rc.line(bP, bP, bP + bL, bP, { stroke: subtle, strokeWidth: 0.7, roughness: 0.5, seed }))
        svg.appendChild(rc.line(W - bP, H - bP - bL, W - bP, H - bP, { stroke: subtle, strokeWidth: 0.7, roughness: 0.5, seed }))
        svg.appendChild(rc.line(W - bP, H - bP, W - bP - bL, H - bP, { stroke: subtle, strokeWidth: 0.7, roughness: 0.5, seed }))

        const caption = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        caption.setAttribute('x', String(W - bP))
        caption.setAttribute('y', String(H - bP + 12))
        caption.setAttribute('fill', subtle)
        caption.setAttribute('font-size', '7')
        caption.setAttribute('font-family', 'monospace')
        caption.setAttribute('text-anchor', 'end')
        caption.setAttribute('opacity', '0.5')
        caption.textContent = 'field notes — architecture'
        svg.appendChild(caption)

      } catch (e) {
        console.error(e)
      }
    }

    draw()
  }, [data, seed])

  return (
    <svg
      ref={svgRef}
      className={className}
      // Viewbox is expanded 1.5x from the original 400x340. 
      // This forces the entire thing to scale down visually in the browser, 
      // giving the effect of huge, spacious lines.
      viewBox="0 0 600 510" 
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}
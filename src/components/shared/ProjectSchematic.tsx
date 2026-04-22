'use client'

import { useRef, useEffect } from 'react'

export interface SchematicNode { id: string; label: string; x: number; y: number; accent?: boolean }
export interface SchematicEdge { from: string; to: string; label?: string }
export interface SchematicData { nodes: SchematicNode[]; edges: SchematicEdge[] }

export default function ProjectSchematic({ data, className = '', seed = 42 }: { data: SchematicData, className?: string, seed?: number }) {
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

        const NODE_W = 90, NODE_H = 38
        const SCALE = 1.5, NEW_CX = 300, NEW_CY = 255, OLD_CX = 200, OLD_CY = 170

        const expandedNodes = data.nodes.map(n => ({
          ...n, x: NEW_CX + (n.x - OLD_CX) * SCALE, y: NEW_CY + (n.y - OLD_CY) * SCALE
        }))
        const nodeMap = new Map(expandedNodes.map(n => [n.id, n]))

        // Animation Helper: Adds the drawing class and staggers the start time
        const animate = (el: SVGElement, delay: number) => {
          el.classList.add('drawing-path')
          el.style.setProperty('--delay', `${delay}ms`)
          return el
        }

        // 1. DRAW EDGES (Stagger: 0ms - 600ms)
        data.edges.forEach((edge, i) => {
          const from = nodeMap.get(edge.from), to = nodeMap.get(edge.to)
          if (!from || !to) return
          const dx = to.x - from.x, dy = to.y - from.y, dist = Math.sqrt(dx * dx + dy * dy)
          const nx = dx / dist, ny = dy / dist
          const x1 = from.x + nx * (NODE_W / 2), y1 = from.y + ny * (NODE_H / 2)
          const x2 = to.x - nx * (NODE_W / 2), y2 = to.y - ny * (NODE_H / 2)

          const delay = i * 150
          const line = rc.line(x1, y1, x2, y2, { stroke: subtle, strokeWidth: 1.2, roughness: 1.8, seed })
          svg.appendChild(animate(line, delay))

          // Arrowhead
          const angle = Math.atan2(dy, dx), arrowLen = 8, arrowAngle = 0.4
          const a1 = rc.line(x2, y2, x2 - arrowLen * Math.cos(angle - arrowAngle), y2 - arrowLen * Math.sin(angle - arrowAngle), { stroke: subtle, seed })
          const a2 = rc.line(x2, y2, x2 - arrowLen * Math.cos(angle + arrowAngle), y2 - arrowLen * Math.sin(angle + arrowAngle), { stroke: subtle, seed })
          svg.appendChild(animate(a1, delay + 100))
          svg.appendChild(animate(a2, delay + 100))

          if (edge.label) {
            const mx = (x1 + x2) / 2 + (-ny * 14), my = (y1 + y2) / 2 + (nx * 14)
            const el = document.createElementNS('http://www.w3.org/2000/svg', 'text')
            el.setAttribute('x', String(mx)); el.setAttribute('y', String(my + 3))
            el.setAttribute('fill', subtle); el.setAttribute('font-size', '10'); el.setAttribute('font-family', 'monospace')
            el.setAttribute('text-anchor', Math.abs(dy) > Math.abs(dx) ? ((-ny < 0) ? 'end' : 'start') : 'middle')
            el.classList.add('fade-in-text')
            el.style.setProperty('--delay', `${delay + 400}ms`)
            el.textContent = edge.label
            svg.appendChild(el)
          }
        })

        // 2. DRAW NODES (Stagger: 600ms - 1200ms)
        expandedNodes.forEach((node, i) => {
          const delay = 600 + (i * 150)
          const rect = rc.rectangle(node.x - NODE_W / 2, node.y - NODE_H / 2, NODE_W, NODE_H, {
            stroke: node.accent ? accent : stroke,
            fill: node.accent ? `${accent}18` : bg,
            fillStyle: node.accent ? 'hachure' : 'solid',
            roughness: 1.6, seed: seed + i
          })
          svg.appendChild(animate(rect, delay))

          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
          text.setAttribute('x', String(node.x)); text.setAttribute('y', String(node.y + 4))
          text.setAttribute('fill', node.accent ? accent : textPrimary)
          text.setAttribute('font-size', '11'); text.setAttribute('text-anchor', 'middle'); text.setAttribute('font-family', 'monospace')
          text.classList.add('fade-in-text')
          text.style.setProperty('--delay', `${delay + 300}ms`)
          text.textContent = node.label.toUpperCase()
          svg.appendChild(text)
        })

      } catch (e) { console.error(e) }
    }
    draw()
  }, [data, seed])

  return (
    <div className={`relative ${className}`}>
      <style>{`
        @keyframes drawPath {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(2px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .drawing-path path, .drawing-path line {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: drawPath 1.2s ease-out forwards;
          animation-delay: var(--delay, 0ms);
        }
        .fade-in-text {
          opacity: 0;
          animation: fadeIn 0.6s ease-out forwards;
          animation-delay: var(--delay, 0ms);
        }
      `}</style>
      <svg ref={svgRef} viewBox="0 0 600 510" style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  )
}
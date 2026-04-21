'use client'

import { useRef, useEffect, useCallback, useState } from 'react'

let _btnIdCounter = 0

function drawFallbackRect(
  svg: SVGSVGElement,
  width: number,
  height: number,
  strokeColor: string
) {
  svg.innerHTML = ''
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
  rect.setAttribute('x', '1')
  rect.setAttribute('y', '1')
  rect.setAttribute('width', String(width - 2))
  rect.setAttribute('height', String(height - 2))
  rect.setAttribute('rx', '4')
  rect.setAttribute('fill', 'none')
  rect.setAttribute('stroke', strokeColor)
  rect.setAttribute('stroke-width', '1.5')
  svg.appendChild(rect)
}

async function drawRoughRect(
  svg: SVGSVGElement,
  width: number,
  height: number,
  roughness: number,
  seed: number,
  strokeColor: string
) {
  try {
    const roughModule = await import('roughjs')
    const rough = (roughModule.default ?? roughModule) as unknown as typeof import('roughjs').default
    const rc = rough.svg(svg) as any
    svg.innerHTML = ''
    const node = rc.rectangle(2, 2, width - 4, height - 4, {
      roughness,
      bowing: 0.4,
      stroke: strokeColor,
      strokeWidth: 1.5,
      fill: 'none',
      seed,
    })
    svg.appendChild(node as unknown as Node)
  } catch {
    drawFallbackRect(svg, width, height, strokeColor)
  }
}

interface RoughButtonProps {
  variant: 'primary' | 'secondary' | 'destructive'
  children: React.ReactNode
  className?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const variantClasses: Record<RoughButtonProps['variant'], string> = {
  primary:
    'relative min-h-[44px] px-4 py-2 text-accent hover:bg-accent-muted transition-colors font-medium',
  secondary:
    'relative min-h-[44px] px-4 py-2 text-text-primary transition-colors',
  destructive:
    'opacity-0 group-hover:opacity-100 text-error min-h-[44px] px-2 py-1 transition-opacity text-sm',
}

export default function RoughButton({
  variant,
  children,
  className = '',
  onClick,
  disabled = false,
  type = 'button',
}: RoughButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [stableSeed] = useState<number>(() => ++_btnIdCounter)

  const render = useCallback(() => {
    if (variant === 'destructive') return
    if (disabled) return
    const el = btnRef.current
    const svg = svgRef.current
    if (!el || !svg) return
    const { width, height } = el.getBoundingClientRect()
    if (!width || !height) return
    const strokeColor =
      getComputedStyle(el).getPropertyValue('--border-default').trim() || '#3a342a'
    svg.setAttribute('width', String(width))
    svg.setAttribute('height', String(height))
    drawRoughRect(svg, width, height, 1.0, stableSeed, strokeColor)
  }, [variant, disabled, stableSeed])

  const debouncedRender = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(render, 100)
  }, [render])

  useEffect(() => {
    if (variant === 'destructive') return
    render()
    const el = btnRef.current
    if (!el) return
    const observer = new ResizeObserver(debouncedRender)
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [render, debouncedRender, variant])

  const base = variantClasses[variant]
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

  return (
    <button
      ref={btnRef}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${disabledClasses} ${className}`}
    >
      {variant !== 'destructive' && (
        <svg
          ref={svgRef}
          aria-hidden="true"
          className="absolute inset-0 overflow-visible"
          style={{ pointerEvents: 'none' }}
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  )
}

// Type stub for roughjs — package declared in package.json but not yet installed.
// Replace with: npm install roughjs (requires network access)
declare module 'roughjs' {
  interface RoughOptions {
    roughness?: number
    bowing?: number
    stroke?: string
    strokeWidth?: number
    fill?: string
    seed?: number
    [key: string]: unknown
  }

  interface RoughGenerator {
    rectangle(
      x: number,
      y: number,
      width: number,
      height: number,
      options?: RoughOptions
    ): SVGGElement
    line(
      x1: number,
      y1: number,
      x2: number,
      y2: number,
      options?: RoughOptions
    ): SVGGElement
  }

  interface RoughModule {
    svg(svg: SVGSVGElement): RoughGenerator
  }

  const rough: RoughModule
  export default rough
}

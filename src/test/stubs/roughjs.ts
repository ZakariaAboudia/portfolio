// Stub for roughjs — not installed in test environment
const roughStub = {
  svg: () => ({
    rectangle: () => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'g')
      return el
    },
  }),
}
export default roughStub

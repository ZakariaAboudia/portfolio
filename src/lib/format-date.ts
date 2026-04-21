function formatMonth(date: Date): string {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(date)
}

export function formatDateRange(start: Date, end: Date | null, presentLabel: string): string {
  return `${formatMonth(start)} – ${end ? formatMonth(end) : presentLabel}`
}

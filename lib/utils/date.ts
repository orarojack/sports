import { format, parseISO, isToday, isTomorrow, isYesterday, isSameWeek } from 'date-fns'

export function formatMatchDate(dateString: string): string {
  const date = parseISO(dateString)
  
  if (isToday(date)) return 'Today'
  if (isTomorrow(date)) return 'Tomorrow'
  if (isYesterday(date)) return 'Yesterday'
  
  return format(date, 'EEEE, do MMMM yyyy')
}

export function formatShortDate(dateString: string): string {
  return format(parseISO(dateString), 'MMM d, yyyy')
}

export function formatMatchTime(time: string): string {
  const [hours, minutes] = time.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function formatFullDateTime(dateString: string, time: string): string {
  const date = parseISO(dateString)
  return `${format(date, 'EEEE, MMMM d, yyyy')} at ${formatMatchTime(time)}`
}

export function isWeekendFixture(dateString: string): boolean {
  const date = parseISO(dateString)
  const day = date.getDay()
  return day === 0 || day === 6
}

export function getWeekendLabel(dateString: string): string {
  const date = parseISO(dateString)
  const day = date.getDay()
  
  if (day === 0) return 'Sunday'
  if (day === 6) return 'Saturday'
  return format(date, 'EEEE')
}

export function groupFixturesByDate<T extends { date: string }>(fixtures: T[]): Map<string, T[]> {
  const grouped = new Map<string, T[]>()
  
  fixtures.forEach(fixture => {
    const existing = grouped.get(fixture.date) || []
    grouped.set(fixture.date, [...existing, fixture])
  })
  
  return grouped
}

export function isCurrentWeek(dateString: string): boolean {
  return isSameWeek(parseISO(dateString), new Date(), { weekStartsOn: 1 })
}

export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

import { HistoryEntry } from '../types'

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

// Jour local au format YYYY-MM-DD
export const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`

// Lundi de la semaine (clé de semaine)
const weekKey = (date: Date) => {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return dayKey(monday)
}

export const groupByDay = (entries: HistoryEntry[]) => {
  const days = new Map<string, HistoryEntry[]>()
  for (const entry of entries) {
    const key = dayKey(new Date(entry.date))
    days.set(key, [...(days.get(key) ?? []), entry])
  }
  return days
}

// Nombre de semaines consécutives avec au moins une séance (la semaine en cours ne casse pas la série)
export const weekStreak = (entries: HistoryEntry[], now = new Date()) => {
  const weeks = new Set(entries.map(e => weekKey(new Date(e.date))))
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (!weeks.has(weekKey(cursor))) cursor.setDate(cursor.getDate() - 7)
  let streak = 0
  while (weeks.has(weekKey(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 7)
  }
  return streak
}

// Grille du mois : semaines commençant le lundi, null pour les cases hors du mois
export const monthGrid = (year: number, month: number) => {
  const first = new Date(year, month, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ]
  while (cells.length % 7) cells.push(null)
  return cells
}

export const monthNames = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

export const formatDayTitle = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  const weekday = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][date.getDay()]
  return `${weekday} ${d} ${monthNames[m - 1].toLowerCase()}`
}

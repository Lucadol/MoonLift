import { PersonalRecord, RecordUnit } from '../types'
import { formatClock } from './timer'

export const recordUnits: { value: RecordUnit; label: string }[] = [
  { value: 'kg', label: 'kg' },
  { value: 'lb', label: 'lb' },
  { value: 'reps', label: 'reps' },
  { value: 'time', label: 'temps' },
  { value: 'm', label: 'm' },
  { value: 'cal', label: 'cal' },
]

export const formatRecordValue = (record: Pick<PersonalRecord, 'value' | 'unit'>) =>
  record.unit === 'time' ? formatClock(record.value) : `${record.value} ${record.unit}`

// Pour un temps, le meilleur record est le plus court ; sinon le plus grand
export const isBetter = (a: PersonalRecord, b: PersonalRecord) =>
  a.unit === 'time' ? a.value < b.value : a.value > b.value

export const movementKey = (movement: string) => movement.trim().toLowerCase()

export interface MovementSummary {
  key: string
  movement: string
  best: PersonalRecord
  history: PersonalRecord[] // du plus récent au plus ancien
}

export const groupRecords = (records: PersonalRecord[]): MovementSummary[] => {
  const groups = new Map<string, PersonalRecord[]>()
  for (const record of records) {
    const key = movementKey(record.movement)
    groups.set(key, [...(groups.get(key) ?? []), record])
  }
  return [...groups.entries()]
    .map(([key, history]) => {
      const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
      // Le meilleur est comparé uniquement avec l'unité la plus récente
      const sameUnit = sorted.filter(r => r.unit === sorted[0].unit)
      const best = sameUnit.reduce((acc, r) => (isBetter(r, acc) ? r : acc))
      return { key, movement: sorted[0].movement, best, history: sorted }
    })
    .sort((a, b) => a.movement.localeCompare(b.movement))
}

export const today = () => {
  const d = new Date()
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const isValidDate = (text: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(text) && !isNaN(new Date(text).getTime())

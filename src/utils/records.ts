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

// ---- Lien programme ↔ PR ----

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

// Mouvement de PR mentionné dans un texte (le nom le plus long l'emporte : « Front Squat » avant « Squat »)
export const findMovement = (text: string, movements: MovementSummary[]) => {
  const haystack = normalize(text)
  return [...movements]
    .sort((a, b) => b.movement.length - a.movement.length)
    .find(m => m.movement.trim().length > 1 && haystack.includes(normalize(m.movement.trim())))
}

export interface LoadHint {
  movement: string
  percent: number
  load: number
  unit: RecordUnit
  oneRm: number
}

// « Back Squat 5x5 @ 75% » → 75 % du meilleur Back Squat, arrondi au 0,5 kg (ou à la livre)
export const computeLoads = (name: string, details: string, movements: MovementSummary[]): LoadHint[] => {
  const weighted = movements.filter(m => m.best.unit === 'kg' || m.best.unit === 'lb')
  if (weighted.length === 0) return []
  const hints: LoadHint[] = []
  for (const line of [name, ...details.split('\n')]) {
    const percents = [...line.matchAll(/(\d{2,3}(?:[.,]\d+)?)\s*%/g)].map(m => parseFloat(m[1].replace(',', '.')))
    if (percents.length === 0) continue
    const summary = findMovement(line, weighted) ?? findMovement(name, weighted)
    if (!summary) continue
    for (const percent of percents) {
      if (percent <= 0 || percent > 150) continue
      if (hints.some(h => h.movement === summary.movement && h.percent === percent)) continue
      const step = summary.best.unit === 'kg' ? 0.5 : 1
      hints.push({
        movement: summary.movement,
        percent,
        load: Math.round((summary.best.value * percent) / 100 / step) * step,
        unit: summary.best.unit,
        oneRm: summary.best.value,
      })
    }
  }
  return hints
}

export interface NewRecord {
  movement: string
  value: number
  unit: RecordUnit
  previous: number
}

// Le résultat saisi bat-il le record du mouvement de l'exercice ?
export const detectNewRecord = (
  exerciseName: string,
  result: string,
  movements: MovementSummary[],
): NewRecord | null => {
  const summary = findMovement(exerciseName, movements)
  if (!summary || !result.trim()) return null
  const { best } = summary
  let value: number | null = null

  if (best.unit === 'kg' || best.unit === 'lb') {
    const values = [...result.matchAll(new RegExp(String.raw`(\d+(?:[.,]\d+)?)\s*${best.unit}\b`, 'gi'))].map(m =>
      parseFloat(m[1].replace(',', '.')),
    )
    if (values.length) value = Math.max(...values)
  } else if (best.unit === 'time') {
    const clock = result.match(/(\d+):(\d{2})/)
    if (clock) value = parseInt(clock[1], 10) * 60 + parseInt(clock[2], 10)
  } else {
    const unitPattern = best.unit === 'reps' ? 'reps?' : best.unit
    const values = [...result.matchAll(new RegExp(String.raw`(\d+(?:[.,]\d+)?)\s*${unitPattern}\b`, 'gi'))].map(m =>
      parseFloat(m[1].replace(',', '.')),
    )
    if (values.length) value = Math.max(...values)
  }

  if (value === null || !(value > 0)) return null
  const better = best.unit === 'time' ? value < best.value : value > best.value
  return better ? { movement: summary.movement, value, unit: best.unit, previous: best.value } : null
}

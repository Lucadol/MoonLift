import { Exercise, PersonalRecord, RecordKind, RecordUnit, SetLog } from '../types'
import { describeTimer, formatClock } from './timer'

// ---- Catégories ----

export const recordKinds: { value: RecordKind; label: string; description: string }[] = [
  { value: 'load', label: 'Charge max', description: '1RM, 3RM, 5RM…' },
  { value: 'emom', label: 'EMOM / séries', description: 'Charge tenue sur un EMOM ou des séries' },
  { value: 'reps', label: 'Max reps', description: 'Le plus de répétitions' },
  { value: 'time', label: 'Benchmark', description: 'For time : Fran, Murph…' },
  { value: 'amrap', label: 'AMRAP', description: 'Tours + répétitions' },
  { value: 'run', label: 'Course / cardio', description: 'Temps sur une distance' },
  { value: 'other', label: 'Distance / cal', description: 'Max de mètres ou de calories' },
]

export const kindLabel = (kind: RecordKind) => recordKinds.find(k => k.value === kind)?.label ?? ''

// Les anciens records n'ont pas de catégorie : on la déduit de l'unité
export const kindOf = (record: Pick<PersonalRecord, 'kind' | 'unit'>): RecordKind => {
  if (record.kind) return record.kind
  switch (record.unit) {
    case 'time':
      return 'time'
    case 'reps':
      return 'reps'
    case 'rounds':
      return 'amrap'
    case 'm':
    case 'cal':
      return 'other'
    default:
      return 'load'
  }
}

export const unitsByKind: Record<RecordKind, RecordUnit[]> = {
  load: ['kg', 'lb'],
  emom: ['kg', 'lb', 'reps'],
  reps: ['reps'],
  time: ['time'],
  amrap: ['rounds'],
  run: ['time'],
  other: ['m', 'cal'],
}

// ---- Course / cardio ----

export const activities = ['Course', 'Rameur', 'SkiErg', 'Vélo', 'Natation'] as const
export type Activity = (typeof activities)[number]

export const distancePresets: Record<Activity, { label: string; meters: number }[]> = {
  Course: [
    { label: '400 m', meters: 400 },
    { label: '1 km', meters: 1000 },
    { label: '5 km', meters: 5000 },
    { label: '10 km', meters: 10000 },
    { label: 'Semi', meters: 21097 },
    { label: 'Marathon', meters: 42195 },
  ],
  Rameur: [
    { label: '500 m', meters: 500 },
    { label: '1000 m', meters: 1000 },
    { label: '2000 m', meters: 2000 },
    { label: '5000 m', meters: 5000 },
  ],
  SkiErg: [
    { label: '500 m', meters: 500 },
    { label: '1000 m', meters: 1000 },
    { label: '2000 m', meters: 2000 },
  ],
  Vélo: [
    { label: '10 km', meters: 10000 },
    { label: '20 km', meters: 20000 },
    { label: '40 km', meters: 40000 },
  ],
  Natation: [
    { label: '100 m', meters: 100 },
    { label: '400 m', meters: 400 },
    { label: '1500 m', meters: 1500 },
  ],
}

export const formatDistance = (meters: number) => {
  if (meters === 21097) return 'Semi-marathon'
  if (meters === 42195) return 'Marathon'
  return meters >= 1000 ? `${(meters / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} km` : `${meters} m`
}

// Allure : min/km en course, /500 m au rameur et au SkiErg, /100 m en natation, km/h à vélo
export const formatPace = (record: Pick<PersonalRecord, 'movement' | 'value' | 'distance'>) => {
  if (!record.distance || record.value <= 0) return null
  const activity = record.movement as Activity
  if (activity === 'Rameur' || activity === 'SkiErg') return `${formatClock((record.value / record.distance) * 500)} /500 m`
  if (activity === 'Natation') return `${formatClock((record.value / record.distance) * 100)} /100 m`
  if (activity === 'Vélo') return `${(record.distance / 1000 / (record.value / 3600)).toFixed(1)} km/h`
  return `${formatClock((record.value / record.distance) * 1000)} /km`
}

// ---- Valeurs ----

export const encodeRounds = (rounds: number, reps: number) => rounds * 1000 + reps
export const decodeRounds = (value: number) => ({ rounds: Math.floor(value / 1000), reps: value % 1000 })

export const formatRecordValue = (record: Pick<PersonalRecord, 'value' | 'unit'>) => {
  switch (record.unit) {
    case 'time':
      return formatClock(record.value)
    case 'rounds': {
      const { rounds, reps } = decodeRounds(record.value)
      return `${rounds} tour${rounds > 1 ? 's' : ''}${reps ? ` + ${reps}` : ''}`
    }
    default:
      return `${record.value.toLocaleString('fr-FR')} ${record.unit}`
  }
}

export const lowerIsBetter = (record: Pick<PersonalRecord, 'unit'>) => record.unit === 'time'

export const isBetter = (a: PersonalRecord, b: PersonalRecord) => (lowerIsBetter(a) ? a.value < b.value : a.value > b.value)

// ---- Regroupement ----

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

export const movementKey = (movement: string) => normalize(movement)

// Une charge max sans précision est un 1RM (anciens records)
export const contextOf = (record: Pick<PersonalRecord, 'kind' | 'unit' | 'context'>) =>
  record.context ?? (kindOf(record) === 'load' ? '1RM' : undefined)

// Un groupe = un mouvement + une catégorie + un contexte (« Back Squat · 3RM », « Course · 5 km »)
export const recordKey = (record: Pick<PersonalRecord, 'movement' | 'kind' | 'unit' | 'context'>) =>
  `${normalize(record.movement)}|${kindOf(record)}|${normalize(contextOf(record) ?? '')}`

export interface MovementSummary {
  key: string
  movement: string
  kind: RecordKind
  context?: string
  best: PersonalRecord
  history: PersonalRecord[] // du plus récent au plus ancien
}

export const groupRecords = (records: PersonalRecord[]): MovementSummary[] => {
  const groups = new Map<string, PersonalRecord[]>()
  for (const record of records) {
    const key = recordKey(record)
    groups.set(key, [...(groups.get(key) ?? []), record])
  }
  return [...groups.entries()]
    .map(([key, history]) => {
      const sorted = [...history].sort((a, b) => b.date.localeCompare(a.date))
      // Le meilleur est comparé uniquement avec l'unité la plus récente
      const sameUnit = sorted.filter(r => r.unit === sorted[0].unit)
      const best = sameUnit.reduce((acc, r) => (isBetter(r, acc) ? r : acc))
      return { key, movement: sorted[0].movement, kind: kindOf(sorted[0]), context: contextOf(sorted[0]), best, history: sorted }
    })
    .sort((a, b) => a.movement.localeCompare(b.movement) || (a.context ?? '').localeCompare(b.context ?? ''))
}

// Sous-titre d'un groupe : « Charge max · 3RM », « Course / cardio · 5 km »
export const summaryLabel = (summary: Pick<MovementSummary, 'kind' | 'context'>) =>
  [kindLabel(summary.kind), summary.context].filter(Boolean).join(' · ')

export const today = () => {
  const d = new Date()
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export const isValidDate = (text: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(text) && !isNaN(new Date(text).getTime())

// ---- Lien programme ↔ PR ----

// Mouvement de PR mentionné dans un texte (le nom le plus long l'emporte : « Front Squat » avant « Squat »)
export const findMovement = (text: string, movements: MovementSummary[]) => {
  const haystack = normalize(text)
  return [...movements]
    .sort((a, b) => b.movement.length - a.movement.length)
    .find(m => m.movement.trim().length > 1 && haystack.includes(normalize(m.movement)))
}

const repMax = (context?: string) => {
  const match = context?.match(/(\d+)\s*rm/i)
  return match ? parseInt(match[1], 10) : 1
}

// 1RM estimé d'un mouvement (formule d'Epley pour les 3RM, 5RM…)
export const estimatedOneRepMax = (summaries: MovementSummary[]) =>
  summaries.reduce((max, s) => {
    const reps = repMax(s.context)
    const estimate = reps > 1 ? s.best.value * (1 + reps / 30) : s.best.value
    return Math.max(max, estimate)
  }, 0)

export interface LoadHint {
  movement: string
  percent: number
  load: number
  unit: RecordUnit
  oneRm: number
}

// « Back Squat 5x5 @ 75% » → 75 % du 1RM de Back Squat, arrondi au 0,5 kg (ou à la livre)
export const computeLoads = (name: string, details: string, movements: MovementSummary[]): LoadHint[] => {
  const loads = movements.filter(m => m.kind === 'load' && (m.best.unit === 'kg' || m.best.unit === 'lb'))
  if (loads.length === 0) return []
  const hints: LoadHint[] = []
  for (const line of [name, ...details.split('\n')]) {
    const percents = [...line.matchAll(/(\d{2,3}(?:[.,]\d+)?)\s*%/g)].map(m => parseFloat(m[1].replace(',', '.')))
    if (percents.length === 0) continue
    const summary = findMovement(line, loads) ?? findMovement(name, loads)
    if (!summary) continue
    const sameMovement = loads.filter(
      l => movementKey(l.movement) === movementKey(summary.movement) && l.best.unit === summary.best.unit,
    )
    const oneRm = estimatedOneRepMax(sameMovement)
    for (const percent of percents) {
      if (percent <= 0 || percent > 150) continue
      if (hints.some(h => h.movement === summary.movement && h.percent === percent)) continue
      const step = summary.best.unit === 'kg' ? 0.5 : 1
      hints.push({
        movement: summary.movement,
        percent,
        load: Math.round((oneRm * percent) / 100 / step) * step,
        unit: summary.best.unit,
        oneRm,
      })
    }
  }
  return hints
}

// ---- Lecture d'un résultat ----

const maxNumberBefore = (text: string, unit: string) => {
  const values = [...text.matchAll(new RegExp(String.raw`(\d+(?:[.,]\d+)?)\s*${unit}\b`, 'gi'))].map(m =>
    parseFloat(m[1].replace(',', '.')),
  )
  return values.length ? Math.max(...values) : null
}

// Valeur d'un résultat dans l'unité d'un record
export const parseResultValue = (result: string, unit: RecordUnit): number | null => {
  switch (unit) {
    case 'kg':
    case 'lb':
      return maxNumberBefore(result, unit)
    case 'time': {
      const clock = result.match(/(?:(\d+):)?(\d+):(\d{2})/)
      if (!clock) return null
      return (clock[1] ? parseInt(clock[1], 10) * 3600 : 0) + parseInt(clock[2], 10) * 60 + parseInt(clock[3], 10)
    }
    case 'rounds': {
      const match = result.match(/(\d+)\s*(?:tours?|rounds?|rds?)(?:\s*\+\s*(\d+))?/i)
      return match ? encodeRounds(parseInt(match[1], 10), match[2] ? parseInt(match[2], 10) : 0) : null
    }
    case 'reps':
      return maxNumberBefore(result, 'reps?')
    default:
      return maxNumberBefore(result, unit)
  }
}

// Catégorie de PR naturelle pour un exercice, selon son timer
export const kindForExercise = (exercise: Pick<Exercise, 'timer'>): RecordKind => {
  switch (exercise.timer?.type) {
    case 'EMOM':
      return 'emom'
    case 'AMRAP':
      return 'amrap'
    case 'FOR_TIME':
      return 'time'
    case 'TABATA':
      return 'reps'
    default:
      return 'load'
  }
}

export interface NewRecord {
  movement: string
  value: number
  unit: RecordUnit
  previous: number
  kind: RecordKind
  context?: string
}

// Le résultat saisi bat-il un record existant du mouvement de l'exercice ?
export const detectNewRecord = (
  exercise: Pick<Exercise, 'name' | 'details' | 'timer'>,
  result: string,
  movements: MovementSummary[],
): NewRecord | null => {
  if (!result.trim()) return null
  const kind = kindForExercise(exercise)
  const candidates = movements.filter(m => m.kind === kind)
  const firstDetail = exercise.details.split('\n')[0] ?? ''
  const summary = findMovement(exercise.name, candidates) ?? findMovement(firstDetail, candidates)
  if (!summary) return null
  // Pour une charge, on compare avec le 1RM ; pour un EMOM, avec le même format si possible
  const sameMovement = candidates.filter(c => movementKey(c.movement) === movementKey(summary.movement))
  let target = summary
  if (kind === 'load') target = sameMovement.find(c => repMax(c.context) === 1) ?? summary
  if (kind === 'emom' && exercise.timer) {
    const format = normalize(describeTimer(exercise.timer))
    target = sameMovement.find(c => normalize(c.context ?? '').includes(format)) ?? summary
  }
  const { best } = target
  const value = parseResultValue(result, best.unit)
  if (value === null || !(value > 0)) return null
  const better = lowerIsBetter(best) ? value < best.value : value > best.value
  return better
    ? { movement: target.movement, value, unit: best.unit, previous: best.value, kind, context: target.context }
    : null
}

const cleanMovementName = (text: string) =>
  text
    .replace(/^(?:[A-Za-z]\d?|\d+)[.)]\s+/, '') // « A) »
    .replace(/^\d+\s+/, '') // « 5 Power cleans »
    .replace(/\d+\s*[x×]\s*\d+.*$/i, '') // « 5x5 @ 75% »
    .replace(/@.*$/, '')
    .trim()

// Pré-remplissage du formulaire « Enregistrer comme PR » depuis un exercice validé
export const suggestRecord = (
  exercise: Pick<Exercise, 'name' | 'details' | 'timer'>,
  result: string,
  movements: MovementSummary[],
) => {
  const kind = kindForExercise(exercise)
  const firstDetail = exercise.details.split('\n').find(l => l.trim()) ?? ''
  const known = findMovement(exercise.name, movements) ?? findMovement(firstDetail, movements)
  const movement =
    known?.movement ||
    (exercise.timer && firstDetail ? cleanMovementName(firstDetail) : cleanMovementName(exercise.name)) ||
    exercise.name
  const unit = unitsByKind[kind].find(u => parseResultValue(result, u) !== null) ?? unitsByKind[kind][0]
  const value = parseResultValue(result, unit)
  let context: string | undefined
  if (kind === 'emom' && exercise.timer) {
    const reps = firstDetail.match(/^\s*(\d+)\s+\D/)
    context = `${describeTimer(exercise.timer)}${reps ? ` · ${reps[1]} reps` : ''}`
  }
  if (kind === 'load') context = '1RM'
  return { movement, kind, unit, value: value ?? undefined, context }
}

// « 4/5 séries réussies »
export const summarizeSets = (sets?: SetLog[]) => {
  if (!sets?.length) return undefined
  const ok = sets.filter(s => s.status === 'success').length
  return `${ok}/${sets.length} série${sets.length > 1 ? 's' : ''} réussie${ok > 1 ? 's' : ''}`
}

// ---- Timers ----

export type SimpleTimerConfig =
  | { type: 'AMRAP'; durationSec: number }
  | { type: 'FOR_TIME'; capSec: number }
  | { type: 'EMOM'; intervalSec: number; rounds: number }
  | { type: 'TABATA'; workSec: number; restSec: number; rounds: number }

// Un timer MIX enchaîne plusieurs blocs (timers simples ou repos)
export type MixSegment = SimpleTimerConfig | { type: 'REST'; durationSec: number }

export type TimerConfig = SimpleTimerConfig | { type: 'MIX'; segments: MixSegment[] }

export type TimerType = TimerConfig['type']
export type SegmentType = MixSegment['type']

// ---- Programme ----

export interface Exercise {
  id: string
  name: string
  details: string
  timer?: TimerConfig
  completed: boolean
  result?: string
  completedAt?: string
  historyId?: string // entrée d'historique créée à la validation
}

export interface Session {
  id: string
  name: string
  exercises: Exercise[]
}

export interface Program {
  id: string
  name: string
  sessions: Session[]
}

// Identifie un exercice à valider quand un timer est lancé depuis le programme
export interface ExerciseRef {
  programId: string
  sessionId: string
  exerciseId: string
}

// ---- Records personnels ----

export type RecordUnit = 'kg' | 'lb' | 'reps' | 'time' | 'm' | 'cal'

export interface PersonalRecord {
  id: string
  movement: string
  value: number // secondes si unit === 'time'
  unit: RecordUnit
  date: string // YYYY-MM-DD
  notes: string
}

// ---- Historique ----

export interface HistoryEntry {
  id: string
  date: string // ISO
  kind: 'exercise' | 'timer'
  title: string // nom de l'exercice ou du timer
  subtitle?: string // programme · séance
  result?: string
}

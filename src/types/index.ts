// ---- Timers ----

export type TimerType = 'AMRAP' | 'EMOM' | 'TABATA' | 'FOR_TIME'

export type TimerConfig =
  | { type: 'AMRAP'; durationSec: number }
  | { type: 'FOR_TIME'; capSec: number }
  | { type: 'EMOM'; intervalSec: number; rounds: number }
  | { type: 'TABATA'; workSec: number; restSec: number; rounds: number }

// ---- Programme ----

export interface Exercise {
  id: string
  name: string
  details: string
  timer?: TimerConfig
  completed: boolean
  result?: string
  completedAt?: string
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

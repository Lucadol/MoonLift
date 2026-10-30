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

export type SetStatus = 'success' | 'fail'
export type Outcome = 'success' | 'fail'

// Une série (ou un tour d'EMOM) : réussie ou ratée, avec une correction éventuelle (« 3 reps », « 95 kg »)
export interface SetLog {
  status: SetStatus
  note?: string
}

// Ce que l'on saisit en validant un exercice
export interface ExerciseLog {
  outcome: Outcome
  result?: string
  comment?: string
  sets?: SetLog[]
}

export interface Exercise {
  id: string
  name: string
  details: string
  timer?: TimerConfig
  completed: boolean
  result?: string
  completedAt?: string
  historyId?: string // entrée d'historique créée à la validation
  outcome?: Outcome
  comment?: string
  sets?: SetLog[]
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

// Catégories de PR : charge max, EMOM / séries réussies, max reps, benchmark chronométré, AMRAP,
// course / cardio (temps sur une distance), distance ou calories max
export type RecordKind = 'load' | 'emom' | 'reps' | 'time' | 'amrap' | 'run' | 'other'

export type RecordUnit = 'kg' | 'lb' | 'reps' | 'time' | 'rounds' | 'm' | 'cal'

export interface PersonalRecord {
  id: string
  movement: string // mouvement, benchmark ou activité (« Course »)
  value: number // secondes si unit === 'time' ; tours × 1000 + reps si unit === 'rounds'
  unit: RecordUnit
  date: string // YYYY-MM-DD
  notes: string
  kind?: RecordKind // absent sur les anciens records : déduit de l'unité
  context?: string // « 3RM », « EMOM 10 × 01:00 · 3 reps », « 5 km »
  distance?: number // en mètres (course / cardio)
}

// ---- Historique ----

export interface HistoryEntry {
  id: string
  date: string // ISO
  kind: 'exercise' | 'timer'
  title: string // nom de l'exercice ou du timer
  subtitle?: string // programme · séance
  result?: string
  outcome?: Outcome
  comment?: string
  sets?: string // résumé : « 4/5 séries réussies »
}

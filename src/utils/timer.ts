import { MixSegment, SegmentType, TimerConfig, TimerType } from '../types'

export type PhaseKind = 'work' | 'rest'

export interface Phase {
  kind: PhaseKind
  segmentIndex: number // bloc du timer MIX (0 pour un timer simple)
  segmentType: SegmentType
  durationSec: number
  round: number
  totalRounds: number
  countUp: boolean
}

export interface TimerSnapshot {
  phaseIndex: number
  phase: Phase
  phaseElapsedMs: number
  phaseRemainingMs: number
  totalElapsedMs: number
  finished: boolean
}

export const timerTypes: TimerType[] = ['AMRAP', 'EMOM', 'TABATA', 'FOR_TIME', 'MIX']
export const segmentTypes: SegmentType[] = ['AMRAP', 'EMOM', 'TABATA', 'FOR_TIME', 'REST']

export const timerLabels: Record<TimerType | SegmentType, string> = {
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  TABATA: 'TABATA',
  FOR_TIME: 'FOR TIME',
  MIX: 'MIX',
  REST: 'REPOS',
}

export const timerDescriptions: Record<TimerType, string> = {
  AMRAP: 'Un maximum de tours en un temps donné',
  EMOM: 'Un travail à chaque début de minute',
  TABATA: 'Intervalles travail / repos',
  FOR_TIME: 'Le plus vite possible, avec un time cap',
  MIX: 'Enchaîne plusieurs timers et des repos',
}

export const defaultSegment = (type: SegmentType): MixSegment => {
  switch (type) {
    case 'REST':
      return { type, durationSec: 2 * 60 }
    case 'AMRAP':
      return { type, durationSec: 6 * 60 }
    case 'FOR_TIME':
      return { type, capSec: 8 * 60 }
    case 'EMOM':
      return { type, intervalSec: 60, rounds: 6 }
    case 'TABATA':
      return { type, workSec: 20, restSec: 10, rounds: 8 }
  }
}

export const defaultTimerConfig = (type: TimerType): TimerConfig => {
  switch (type) {
    case 'MIX':
      return { type, segments: [defaultSegment('AMRAP'), defaultSegment('REST'), defaultSegment('EMOM')] }
    case 'AMRAP':
      return { type, durationSec: 10 * 60 }
    case 'FOR_TIME':
      return { type, capSec: 15 * 60 }
    case 'EMOM':
      return { type, intervalSec: 60, rounds: 10 }
    case 'TABATA':
      return { type, workSec: 20, restSec: 10, rounds: 8 }
  }
}

const buildSegmentPhases = (segment: MixSegment, segmentIndex: number): Phase[] => {
  const base = { segmentIndex, segmentType: segment.type, countUp: false }
  switch (segment.type) {
    case 'REST':
      return [{ ...base, kind: 'rest', durationSec: segment.durationSec, round: 1, totalRounds: 1 }]
    case 'AMRAP':
      return [{ ...base, kind: 'work', durationSec: segment.durationSec, round: 1, totalRounds: 1 }]
    case 'FOR_TIME':
      return [{ ...base, kind: 'work', durationSec: segment.capSec, round: 1, totalRounds: 1, countUp: true }]
    case 'EMOM':
      return Array.from({ length: segment.rounds }, (_, i) => ({
        ...base,
        kind: 'work' as const,
        durationSec: segment.intervalSec,
        round: i + 1,
        totalRounds: segment.rounds,
      }))
    case 'TABATA': {
      const phases: Phase[] = []
      for (let i = 0; i < segment.rounds; i++) {
        const round = i + 1
        phases.push({ ...base, kind: 'work', durationSec: segment.workSec, round, totalRounds: segment.rounds })
        // Pas de repos après le dernier tour
        if (round < segment.rounds && segment.restSec > 0) {
          phases.push({ ...base, kind: 'rest', durationSec: segment.restSec, round, totalRounds: segment.rounds })
        }
      }
      return phases
    }
  }
}

export const segmentsOf = (config: TimerConfig): MixSegment[] =>
  config.type === 'MIX' ? config.segments : [config]

// Découpe un timer en une suite de phases (travail / repos) jouées l'une après l'autre
export const buildPhases = (config: TimerConfig): Phase[] =>
  segmentsOf(config).flatMap((segment, index) => buildSegmentPhases(segment, index))

// Instant (en ms depuis le début) où commence une phase
export const phaseStartMs = (phases: Phase[], index: number) =>
  phases.slice(0, index).reduce((sum, phase) => sum + phase.durationSec * 1000, 0)

export const totalDurationSec = (phases: Phase[]) =>
  phases.reduce((sum, phase) => sum + phase.durationSec, 0)

// Calcule l'état du timer à partir du temps écoulé (pas de dérive liée à setInterval)
export const getSnapshot = (phases: Phase[], elapsedMs: number): TimerSnapshot => {
  let phaseStartMs = 0
  for (let i = 0; i < phases.length; i++) {
    const durationMs = phases[i].durationSec * 1000
    if (elapsedMs < phaseStartMs + durationMs) {
      const phaseElapsedMs = elapsedMs - phaseStartMs
      return {
        phaseIndex: i,
        phase: phases[i],
        phaseElapsedMs,
        phaseRemainingMs: durationMs - phaseElapsedMs,
        totalElapsedMs: elapsedMs,
        finished: false,
      }
    }
    phaseStartMs += durationMs
  }
  const last = phases[phases.length - 1]
  return {
    phaseIndex: phases.length - 1,
    phase: last,
    phaseElapsedMs: last.durationSec * 1000,
    phaseRemainingMs: 0,
    totalElapsedMs: phaseStartMs,
    finished: true,
  }
}

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`)

export const formatClock = (totalSec: number) => {
  const sec = Math.max(0, Math.round(totalSec))
  const hours = Math.floor(sec / 3600)
  const minutes = Math.floor((sec % 3600) / 60)
  const seconds = sec % 60
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${pad(minutes)}:${pad(seconds)}`
}

// Convertit "mm:ss", "h:mm:ss" ou un nombre de secondes en secondes
export const parseClock = (text: string): number | null => {
  const parts = text.trim().split(':')
  if (parts.length === 0 || parts.length > 3 || parts.some(p => !/^\d+$/.test(p))) return null
  return parts.reduce((acc, part) => acc * 60 + parseInt(part, 10), 0)
}

export const describeTimer = (config: TimerConfig | MixSegment): string => {
  switch (config.type) {
    case 'AMRAP':
      return `AMRAP ${formatClock(config.durationSec)}`
    case 'FOR_TIME':
      return `For Time · cap ${formatClock(config.capSec)}`
    case 'EMOM':
      return `EMOM ${config.rounds} × ${formatClock(config.intervalSec)}`
    case 'TABATA':
      return `Tabata ${config.rounds} × ${config.workSec}s / ${config.restSec}s`
    case 'REST':
      return `Repos ${formatClock(config.durationSec)}`
    case 'MIX':
      return `Mix · ${config.segments.length} bloc${config.segments.length > 1 ? 's' : ''} · ${formatClock(
        totalDurationSec(buildPhases(config)),
      )}`
  }
}

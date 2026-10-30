import { TimerConfig, TimerType } from '../types'

export type PhaseKind = 'work' | 'rest'

export interface Phase {
  kind: PhaseKind
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

export const timerLabels: Record<TimerType, string> = {
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  TABATA: 'TABATA',
  FOR_TIME: 'FOR TIME',
}

export const timerDescriptions: Record<TimerType, string> = {
  AMRAP: 'Un maximum de tours en un temps donné',
  EMOM: 'Un travail à chaque début de minute',
  TABATA: 'Intervalles travail / repos',
  FOR_TIME: 'Le plus vite possible, avec un time cap',
}

export const defaultTimerConfig = (type: TimerType): TimerConfig => {
  switch (type) {
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

// Découpe un timer en une suite de phases (travail / repos) jouées l'une après l'autre
export const buildPhases = (config: TimerConfig): Phase[] => {
  switch (config.type) {
    case 'AMRAP':
      return [{ kind: 'work', durationSec: config.durationSec, round: 1, totalRounds: 1, countUp: false }]
    case 'FOR_TIME':
      return [{ kind: 'work', durationSec: config.capSec, round: 1, totalRounds: 1, countUp: true }]
    case 'EMOM':
      return Array.from({ length: config.rounds }, (_, i) => ({
        kind: 'work' as const,
        durationSec: config.intervalSec,
        round: i + 1,
        totalRounds: config.rounds,
        countUp: false,
      }))
    case 'TABATA': {
      const phases: Phase[] = []
      for (let i = 0; i < config.rounds; i++) {
        const round = i + 1
        phases.push({ kind: 'work', durationSec: config.workSec, round, totalRounds: config.rounds, countUp: false })
        // Pas de repos après le dernier tour
        if (round < config.rounds && config.restSec > 0) {
          phases.push({ kind: 'rest', durationSec: config.restSec, round, totalRounds: config.rounds, countUp: false })
        }
      }
      return phases
    }
  }
}

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

export const describeTimer = (config: TimerConfig) => {
  switch (config.type) {
    case 'AMRAP':
      return `AMRAP ${formatClock(config.durationSec)}`
    case 'FOR_TIME':
      return `For Time · cap ${formatClock(config.capSec)}`
    case 'EMOM':
      return `EMOM ${config.rounds} × ${formatClock(config.intervalSec)}`
    case 'TABATA':
      return `Tabata ${config.rounds} × ${config.workSec}s / ${config.restSec}s`
  }
}

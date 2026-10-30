import { SimpleTimerConfig } from '../types'

export interface ParsedExercise {
  name: string
  details: string
  timer?: SimpleTimerConfig
}

export interface ParsedSession {
  name: string
  exercises: ParsedExercise[]
}

export const importExample = `Semaine 1 – Jour 1
A) Back Squat 5x5 @ 75%
B) AMRAP 12 min
- 10 Pull-ups
- 15 Push-ups
- 20 Air squats

Semaine 1 – Jour 2
Échauffement : 3 tours mobilité
EMOM 10 min
5 Power cleans @ 60 kg
Tabata 8 x 20/10 : Hollow rocks

Semaine 1 – Jour 3
For Time (cap 15')
21-15-9 Thrusters / Burpees`

const MINUTES = String.raw`(?:minutes?|mins?|mn|m|'|’)`
const SECONDS = String.raw`(?:secondes?|secs?|s|"|”)`

// Première durée trouvée dans le texte, en secondes ("12 min", "12'", "1:30", "90 s")
const findDuration = (text: string): number | undefined => {
  const clock = text.match(/(\d+)[:'’](\d{2})/)
  if (clock) return parseInt(clock[1], 10) * 60 + parseInt(clock[2], 10)
  const minutes = text.match(new RegExp(String.raw`(\d+(?:[.,]\d+)?)\s*${MINUTES}(?![a-z])`, 'i'))
  if (minutes) return Math.round(parseFloat(minutes[1].replace(',', '.')) * 60)
  const seconds = text.match(new RegExp(String.raw`(\d+)\s*${SECONDS}(?![a-z])`, 'i'))
  if (seconds) return parseInt(seconds[1], 10)
  return undefined
}

const DURATION = String.raw`(\d+:\d{2}|\d+(?:[.,]\d+)?\s*(?:minutes?|mins?|mn|'|’|secondes?|secs?|s\b))`

// Reconnaît un timer dans une ligne : AMRAP, EMOM / E2MOM, Tabata, For Time
export const parseTimerLine = (line: string): SimpleTimerConfig | undefined => {
  const text = line.toLowerCase()

  if (/\bamrap\b/.test(text)) {
    const bare = text.match(/amrap\D{0,4}(\d+)(?!\s*[x×:])/)
    const durationSec = findDuration(text) ?? (bare ? parseInt(bare[1], 10) * 60 : 10 * 60)
    return { type: 'AMRAP', durationSec }
  }

  const emom = text.match(/\be(\d+)?mom\b/) ?? text.match(/\b(?:toutes les|every)\s+(\d+)?\s*(?:min|mn|'|’)/)
  if (emom) {
    let intervalSec = (emom[1] ? parseInt(emom[1], 10) : 1) * 60
    let rounds: number | undefined
    const roundsByDuration = text.match(new RegExp(String.raw`(\d+)\s*[x×]\s*${DURATION}`))
    if (roundsByDuration) {
      rounds = parseInt(roundsByDuration[1], 10)
      intervalSec = findDuration(roundsByDuration[2]) ?? intervalSec
    } else {
      const roundsMatch = text.match(/(\d+)\s*(?:tours|rounds|rds|séries|series)\b/)
      if (roundsMatch) rounds = parseInt(roundsMatch[1], 10)
    }
    if (rounds === undefined) {
      const bare = text.match(/e\d*mom\D{0,4}(\d+)(?!\s*[x×:])/)
      const total = findDuration(text.replace(/\b(?:toutes les|every)\s+\d*\s*(?:min|mn|'|’)/, '')) ??
        (bare ? parseInt(bare[1], 10) * 60 : 10 * 60)
      rounds = Math.max(1, Math.round(total / intervalSec))
    }
    return { type: 'EMOM', intervalSec, rounds }
  }

  if (/\btabata\b/.test(text)) {
    const roundsMatch = text.match(/(\d+)\s*(?:tours|rounds|rds|[x×])/)
    const workRest = text.match(/(\d+)\s*s?\s*\/\s*(\d+)\s*s?\b/)
    return {
      type: 'TABATA',
      rounds: roundsMatch ? parseInt(roundsMatch[1], 10) : 8,
      workSec: workRest ? parseInt(workRest[1], 10) : 20,
      restSec: workRest ? parseInt(workRest[2], 10) : 10,
    }
  }

  if (/\bfor\s*time\b|\bchrono\b/.test(text)) {
    const cap = text.match(/cap\D{0,6}(\d+(?::\d{2})?)\s*(minutes?|mins?|mn|'|’)?/)
    let capSec: number | undefined
    if (cap) capSec = cap[1].includes(':') ? findDuration(cap[1]) : parseInt(cap[1], 10) * 60
    return { type: 'FOR_TIME', capSec: capSec ?? findDuration(text) ?? 20 * 60 }
  }

  return undefined
}

const HEADER =
  /^(semaine|sem\.?|week|wk|jour|day|j\d+|séance|seance|session|bloc|block|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/i

const cleanHeader = (line: string) =>
  line
    .replace(/^#+\s*/, '')
    .replace(/^[=\-–—*_\s]+|[=\-–—*_:\s]+$/g, '')
    .trim()

const isHeader = (line: string) => {
  if (line.startsWith('#')) return true
  const cleaned = cleanHeader(line)
  return HEADER.test(cleaned) && cleaned.length <= 40 && !parseTimerLine(cleaned)
}

// « WOD », « Metcon », « Finisher »… : un titre court qui annonce le timer de la ligne suivante
const isShortTitle = (name: string) => !/\d/.test(name) && name.length <= 25

const BULLET = /^[-•*–·▪◦]\s*/
const MARKER = /^(?:[A-Za-z]\d?|\d+)[.)]\s+/

/**
 * Transforme un programme collé en séances / exercices.
 * - Une ligne « Semaine 1 – Jour 1 », « Lundi », « # Séance A »… démarre une séance
 * - Chaque ligne est un exercice ; « A) », « B) »… sont retirés du nom
 * - Les lignes avec puce (-, •) ou indentées complètent l'exercice précédent
 * - Sous un timer (AMRAP, EMOM, Tabata, For Time), les lignes suivantes forment le détail
 *   jusqu'à la prochaine ligne vide
 */
export const parseProgramText = (text: string): ParsedSession[] => {
  const sessions: ParsedSession[] = []
  let session: ParsedSession | null = null
  let exercise: ParsedExercise | null = null

  const addDetail = (target: ParsedExercise, line: string) => {
    target.details = target.details ? `${target.details}\n${line}` : line
  }

  for (const raw of text.replace(/\r/g, '').split('\n')) {
    const line = raw.trim()
    if (!line) {
      exercise = null
      continue
    }

    if (isHeader(line)) {
      session = { name: cleanHeader(line) || `Séance ${sessions.length + 1}`, exercises: [] }
      sessions.push(session)
      exercise = null
      continue
    }

    const indented = /^(\s{2,}|\t)/.test(raw)
    const bullet = BULLET.test(line)
    const marker = MARKER.test(line)
    const content = line.replace(MARKER, '').replace(BULLET, '').trim()
    if (!content) continue
    const timer = parseTimerLine(content)

    if (exercise && !marker) {
      // Un titre sans timer suivi d'une ligne de timer : on fusionne (« WOD » puis « AMRAP 12' »)
      if (timer && !exercise.timer && !exercise.details && !bullet && !indented && isShortTitle(exercise.name)) {
        exercise.timer = timer
        addDetail(exercise, content)
        continue
      }
      if (indented || bullet || (exercise.timer && !timer)) {
        addDetail(exercise, content)
        continue
      }
    }

    if (!session) {
      session = { name: 'Séance 1', exercises: [] }
      sessions.push(session)
    }
    exercise = { name: content, details: '', timer }
    session.exercises.push(exercise)
  }

  return sessions
}

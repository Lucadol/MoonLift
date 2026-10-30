import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Exercise, ExerciseRef, HistoryEntry, PersonalRecord, Program, Session, TimerConfig } from '../types'
import { uid } from '../utils/helpers'
import { ParsedSession } from '../utils/importProgram'
import { describeTimer } from '../utils/timer'

const PROGRAMS_KEY = 'moonlift:programs'
const RECORDS_KEY = 'moonlift:records'
const HISTORY_KEY = 'moonlift:history'

export type ExerciseInput = Omit<Exercise, 'id' | 'completed' | 'result' | 'completedAt' | 'historyId'>

// Format du fichier de sauvegarde
export interface BackupData {
  app: 'moony'
  version: 1
  exportedAt: string
  programs: Program[]
  records: PersonalRecord[]
  history: HistoryEntry[]
}

interface Store {
  loaded: boolean
  programs: Program[]
  records: PersonalRecord[]
  history: HistoryEntry[]
  // Programmes
  addProgram: (name: string) => string
  renameProgram: (programId: string, name: string) => void
  deleteProgram: (programId: string) => void
  importSessions: (target: { programId: string } | { programName: string }, sessions: ParsedSession[]) => string
  // Séances
  addSession: (programId: string, name: string) => string
  renameSession: (programId: string, sessionId: string, name: string) => void
  duplicateSession: (programId: string, sessionId: string) => void
  deleteSession: (programId: string, sessionId: string) => void
  resetSession: (programId: string, sessionId: string) => void
  // Exercices
  addExercise: (programId: string, sessionId: string, input: ExerciseInput) => void
  updateExercise: (ref: ExerciseRef, input: ExerciseInput) => void
  deleteExercise: (ref: ExerciseRef) => void
  moveExercise: (ref: ExerciseRef, direction: -1 | 1) => void
  completeExercise: (ref: ExerciseRef, result?: string) => void
  uncompleteExercise: (ref: ExerciseRef) => void
  // Records
  saveRecord: (record: Omit<PersonalRecord, 'id'> & { id?: string }) => void
  deleteRecord: (recordId: string) => void
  // Historique et sauvegarde
  logTimer: (config: TimerConfig, result?: string) => void
  deleteHistoryEntry: (entryId: string) => void
  exportData: () => BackupData
  importData: (data: unknown) => void // lève une erreur si le fichier n'est pas valide
}

const StoreContext = createContext<Store | null>(null)

const toSession = (parsed: ParsedSession): Session => ({
  id: uid(),
  name: parsed.name,
  exercises: parsed.exercises.map(e => ({ ...e, id: uid(), completed: false })),
})

const mapSession = (
  programs: Program[],
  programId: string,
  sessionId: string,
  fn: (session: Session) => Session,
) =>
  programs.map(p =>
    p.id !== programId ? p : { ...p, sessions: p.sessions.map(s => (s.id === sessionId ? fn(s) : s)) },
  )

const mapExercise = (programs: Program[], ref: ExerciseRef, fn: (exercise: Exercise) => Exercise) =>
  mapSession(programs, ref.programId, ref.sessionId, s => ({
    ...s,
    exercises: s.exercises.map(e => (e.id === ref.exerciseId ? fn(e) : e)),
  }))

export const StoreProvider = ({ children }: { children: React.ReactNode }) => {
  const [loaded, setLoaded] = useState(false)
  const [programs, setPrograms] = useState<Program[]>([])
  const [records, setRecords] = useState<PersonalRecord[]>([])
  const [history, setHistory] = useState<HistoryEntry[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const [rawPrograms, rawRecords, rawHistory] = await Promise.all([
          AsyncStorage.getItem(PROGRAMS_KEY),
          AsyncStorage.getItem(RECORDS_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ])
        if (rawPrograms) setPrograms(JSON.parse(rawPrograms))
        if (rawRecords) setRecords(JSON.parse(rawRecords))
        if (rawHistory) setHistory(JSON.parse(rawHistory))
      } catch (e) {
        console.warn('Impossible de charger les données', e)
      } finally {
        setLoaded(true)
      }
    }
    load()
  }, [])

  // Sauvegarde automatique (uniquement après le chargement initial pour ne rien écraser)
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(PROGRAMS_KEY, JSON.stringify(programs)).catch(console.warn)
  }, [loaded, programs])

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(RECORDS_KEY, JSON.stringify(records)).catch(console.warn)
  }, [loaded, records])

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history)).catch(console.warn)
  }, [loaded, history])

  const addProgram = useCallback((name: string) => {
    const id = uid()
    setPrograms(prev => [...prev, { id, name, sessions: [] }])
    return id
  }, [])

  const renameProgram = useCallback((programId: string, name: string) => {
    setPrograms(prev => prev.map(p => (p.id === programId ? { ...p, name } : p)))
  }, [])

  const deleteProgram = useCallback((programId: string) => {
    setPrograms(prev => prev.filter(p => p.id !== programId))
  }, [])

  // Importe des séances dans un programme existant, ou crée un nouveau programme
  const importSessions = useCallback(
    (target: { programId: string } | { programName: string }, parsed: ParsedSession[]) => {
      const sessions = parsed.map(toSession)
      if ('programId' in target) {
        setPrograms(prev =>
          prev.map(p => (p.id === target.programId ? { ...p, sessions: [...p.sessions, ...sessions] } : p)),
        )
        return target.programId
      }
      const id = uid()
      setPrograms(prev => [...prev, { id, name: target.programName, sessions }])
      return id
    },
    [],
  )

  const addSession = useCallback((programId: string, name: string) => {
    const id = uid()
    setPrograms(prev =>
      prev.map(p => (p.id === programId ? { ...p, sessions: [...p.sessions, { id, name, exercises: [] }] } : p)),
    )
    return id
  }, [])

  const renameSession = useCallback((programId: string, sessionId: string, name: string) => {
    setPrograms(prev => mapSession(prev, programId, sessionId, s => ({ ...s, name })))
  }, [])

  const duplicateSession = useCallback((programId: string, sessionId: string) => {
    setPrograms(prev =>
      prev.map(p => {
        if (p.id !== programId) return p
        const index = p.sessions.findIndex(s => s.id === sessionId)
        if (index === -1) return p
        const source = p.sessions[index]
        const copy: Session = {
          id: uid(),
          name: `${source.name} (copie)`,
          exercises: source.exercises.map(e => ({
            ...e,
            id: uid(),
            completed: false,
            result: undefined,
            completedAt: undefined,
            historyId: undefined,
          })),
        }
        const sessions = [...p.sessions]
        sessions.splice(index + 1, 0, copy)
        return { ...p, sessions }
      }),
    )
  }, [])

  const deleteSession = useCallback((programId: string, sessionId: string) => {
    setPrograms(prev =>
      prev.map(p => (p.id === programId ? { ...p, sessions: p.sessions.filter(s => s.id !== sessionId) } : p)),
    )
  }, [])

  const resetSession = useCallback((programId: string, sessionId: string) => {
    setPrograms(prev =>
      mapSession(prev, programId, sessionId, s => ({
        ...s,
        exercises: s.exercises.map(e => ({
          ...e,
          completed: false,
          result: undefined,
          completedAt: undefined,
          historyId: undefined,
        })),
      })),
    )
  }, [])

  const addExercise = useCallback((programId: string, sessionId: string, input: ExerciseInput) => {
    setPrograms(prev =>
      mapSession(prev, programId, sessionId, s => ({
        ...s,
        exercises: [...s.exercises, { ...input, id: uid(), completed: false }],
      })),
    )
  }, [])

  const updateExercise = useCallback((ref: ExerciseRef, input: ExerciseInput) => {
    // `timer` absent de input = timer supprimé
    setPrograms(prev => mapExercise(prev, ref, e => ({ ...e, ...input, timer: input.timer })))
  }, [])

  const deleteExercise = useCallback((ref: ExerciseRef) => {
    setPrograms(prev =>
      mapSession(prev, ref.programId, ref.sessionId, s => ({
        ...s,
        exercises: s.exercises.filter(e => e.id !== ref.exerciseId),
      })),
    )
  }, [])

  const moveExercise = useCallback((ref: ExerciseRef, direction: -1 | 1) => {
    setPrograms(prev =>
      mapSession(prev, ref.programId, ref.sessionId, s => {
        const index = s.exercises.findIndex(e => e.id === ref.exerciseId)
        const target = index + direction
        if (index === -1 || target < 0 || target >= s.exercises.length) return s
        const exercises = [...s.exercises]
        ;[exercises[index], exercises[target]] = [exercises[target], exercises[index]]
        return { ...s, exercises }
      }),
    )
  }, [])

  const completeExercise = useCallback(
    (ref: ExerciseRef, result?: string) => {
      const program = programs.find(p => p.id === ref.programId)
      const session = program?.sessions.find(s => s.id === ref.sessionId)
      const exercise = session?.exercises.find(e => e.id === ref.exerciseId)
      if (!program || !session || !exercise) return
      const now = new Date().toISOString()
      const cleanResult = result?.trim() || undefined
      const entry: HistoryEntry = {
        id: uid(),
        date: now,
        kind: 'exercise',
        title: exercise.name,
        subtitle: `${program.name} · ${session.name}`,
        result: cleanResult,
      }
      setHistory(prev => [...prev.filter(h => h.id !== exercise.historyId), entry])
      setPrograms(prev =>
        mapExercise(prev, ref, e => ({ ...e, completed: true, result: cleanResult, completedAt: now, historyId: entry.id })),
      )
    },
    [programs],
  )

  // Décocher un exercice retire aussi l'entrée d'historique (c'était sans doute une erreur)
  const uncompleteExercise = useCallback(
    (ref: ExerciseRef) => {
      const historyId = programs
        .find(p => p.id === ref.programId)
        ?.sessions.find(s => s.id === ref.sessionId)
        ?.exercises.find(e => e.id === ref.exerciseId)?.historyId
      if (historyId) setHistory(prev => prev.filter(h => h.id !== historyId))
      setPrograms(prev =>
        mapExercise(prev, ref, e => ({
          ...e,
          completed: false,
          result: undefined,
          completedAt: undefined,
          historyId: undefined,
        })),
      )
    },
    [programs],
  )

  const logTimer = useCallback((config: TimerConfig, result?: string) => {
    setHistory(prev => [
      ...prev,
      { id: uid(), date: new Date().toISOString(), kind: 'timer', title: describeTimer(config), result: result?.trim() || undefined },
    ])
  }, [])

  const deleteHistoryEntry = useCallback((entryId: string) => {
    setHistory(prev => prev.filter(h => h.id !== entryId))
  }, [])

  const exportData = useCallback(
    (): BackupData => ({ app: 'moony', version: 1, exportedAt: new Date().toISOString(), programs, records, history }),
    [programs, records, history],
  )

  const importData = useCallback((data: unknown) => {
    const backup = data as Partial<BackupData> | null
    if (
      !backup ||
      backup.app !== 'moony' ||
      !Array.isArray(backup.programs) ||
      !Array.isArray(backup.records) ||
      !Array.isArray(backup.history)
    ) {
      throw new Error('Ce fichier n’est pas une sauvegarde Moony valide.')
    }
    setPrograms(backup.programs)
    setRecords(backup.records)
    setHistory(backup.history)
  }, [])

  const saveRecord = useCallback((record: Omit<PersonalRecord, 'id'> & { id?: string }) => {
    setRecords(prev => {
      if (record.id && prev.some(r => r.id === record.id)) {
        return prev.map(r => (r.id === record.id ? { ...record, id: r.id } : r))
      }
      return [...prev, { ...record, id: uid() }]
    })
  }, [])

  const deleteRecord = useCallback((recordId: string) => {
    setRecords(prev => prev.filter(r => r.id !== recordId))
  }, [])

  const value = useMemo<Store>(
    () => ({
      loaded,
      programs,
      records,
      history,
      logTimer,
      deleteHistoryEntry,
      exportData,
      importData,
      addProgram,
      renameProgram,
      deleteProgram,
      importSessions,
      addSession,
      renameSession,
      duplicateSession,
      deleteSession,
      resetSession,
      addExercise,
      updateExercise,
      deleteExercise,
      moveExercise,
      completeExercise,
      uncompleteExercise,
      saveRecord,
      deleteRecord,
    }),
    [
      loaded,
      programs,
      records,
      history,
      logTimer,
      deleteHistoryEntry,
      exportData,
      importData,
      addProgram,
      renameProgram,
      deleteProgram,
      importSessions,
      addSession,
      renameSession,
      duplicateSession,
      deleteSession,
      resetSession,
      addExercise,
      updateExercise,
      deleteExercise,
      moveExercise,
      completeExercise,
      uncompleteExercise,
      saveRecord,
      deleteRecord,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export const useStore = () => {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore doit être utilisé dans un StoreProvider')
  return store
}

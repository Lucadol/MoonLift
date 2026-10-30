import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { Exercise, ExerciseRef, PersonalRecord, Program, Session } from '../types'
import { uid } from '../utils/helpers'

const PROGRAMS_KEY = 'moonlift:programs'
const RECORDS_KEY = 'moonlift:records'

export type ExerciseInput = Omit<Exercise, 'id' | 'completed' | 'result' | 'completedAt'>

interface Store {
  loaded: boolean
  programs: Program[]
  records: PersonalRecord[]
  // Programmes
  addProgram: (name: string) => string
  renameProgram: (programId: string, name: string) => void
  deleteProgram: (programId: string) => void
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
}

const StoreContext = createContext<Store | null>(null)

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

  useEffect(() => {
    const load = async () => {
      try {
        const [rawPrograms, rawRecords] = await Promise.all([
          AsyncStorage.getItem(PROGRAMS_KEY),
          AsyncStorage.getItem(RECORDS_KEY),
        ])
        if (rawPrograms) setPrograms(JSON.parse(rawPrograms))
        if (rawRecords) setRecords(JSON.parse(rawRecords))
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
        exercises: s.exercises.map(e => ({ ...e, completed: false, result: undefined, completedAt: undefined })),
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

  const completeExercise = useCallback((ref: ExerciseRef, result?: string) => {
    setPrograms(prev =>
      mapExercise(prev, ref, e => ({
        ...e,
        completed: true,
        result: result?.trim() || undefined,
        completedAt: new Date().toISOString(),
      })),
    )
  }, [])

  const uncompleteExercise = useCallback((ref: ExerciseRef) => {
    setPrograms(prev =>
      mapExercise(prev, ref, e => ({ ...e, completed: false, result: undefined, completedAt: undefined })),
    )
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
      addProgram,
      renameProgram,
      deleteProgram,
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
      addProgram,
      renameProgram,
      deleteProgram,
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

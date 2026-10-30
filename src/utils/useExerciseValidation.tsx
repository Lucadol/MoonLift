import { useRef, useState } from 'react'

import NewRecordModal from '../components/NewRecordModal'
import { useStore } from '../store/StoreContext'
import { ExerciseRef } from '../types'
import { NewRecord, detectNewRecord, groupRecords, today } from './records'

// Valide un exercice, puis propose d'enregistrer un nouveau PR si le résultat bat le record
export const useExerciseValidation = () => {
  const { records, completeExercise, saveRecord } = useStore()
  const [newRecord, setNewRecord] = useState<NewRecord | null>(null)
  const context = useRef<{ note: string; onDone?: () => void }>({ note: '' })

  const validate = (ref: ExerciseRef, exerciseName: string, result: string, onDone?: () => void) => {
    completeExercise(ref, result)
    const detected = detectNewRecord(exerciseName, result, groupRecords(records))
    if (!detected) {
      onDone?.()
      return
    }
    context.current = { note: exerciseName, onDone }
    setNewRecord(detected)
  }

  const close = () => {
    setNewRecord(null)
    context.current.onDone?.()
  }

  const save = () => {
    if (newRecord) {
      saveRecord({
        movement: newRecord.movement,
        value: newRecord.value,
        unit: newRecord.unit,
        date: today(),
        notes: context.current.note,
      })
    }
    close()
  }

  const modal = <NewRecordModal record={newRecord} onSave={save} onClose={close} />
  return { validate, modal }
}

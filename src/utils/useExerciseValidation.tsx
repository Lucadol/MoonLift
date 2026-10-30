import { useRef, useState } from 'react'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

import { RootStackParamList } from '../../App'
import NewRecordModal from '../components/NewRecordModal'
import { useStore } from '../store/StoreContext'
import { Exercise, ExerciseLog, ExerciseRef } from '../types'
import { NewRecord, detectNewRecord, groupRecords, suggestRecord, today } from './records'

interface ValidateOptions {
  saveAsRecord?: boolean // ouvrir le formulaire de PR pré-rempli
  replaceScreen?: boolean // remplacer l'écran courant (écran du timer) par le formulaire de PR
  onDone?: () => void
}

// Valide un exercice, puis propose d'enregistrer un PR : à la demande, ou automatiquement si le résultat bat un record
export const useExerciseValidation = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>()
  const { records, completeExercise, saveRecord } = useStore()
  const [newRecord, setNewRecord] = useState<NewRecord | null>(null)
  const context = useRef<{ note: string; onDone?: () => void }>({ note: '' })

  const validate = (ref: ExerciseRef, exercise: Exercise, log: ExerciseLog, options: ValidateOptions = {}) => {
    completeExercise(ref, log)
    const result = log.result ?? ''
    const summaries = groupRecords(records)

    if (options.saveAsRecord) {
      const suggestion = suggestRecord(exercise, result, summaries)
      const params = { ...suggestion, notes: [exercise.name, log.comment?.trim()].filter(Boolean).join(' · ') }
      if (options.replaceScreen) navigation.replace('RecordEdit', params)
      else navigation.navigate('RecordEdit', params)
      return
    }

    const detected = log.outcome === 'success' ? detectNewRecord(exercise, result, summaries) : null
    if (!detected) {
      options.onDone?.()
      return
    }
    context.current = { note: exercise.name, onDone: options.onDone }
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
        kind: newRecord.kind,
        context: newRecord.context,
        date: today(),
        notes: context.current.note,
      })
    }
    close()
  }

  const modal = <NewRecordModal record={newRecord} onSave={save} onClose={close} />
  return { validate, modal }
}

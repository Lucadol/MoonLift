import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import TimerConfigForm from '../../components/TimerConfigForm'
import { common } from '../../components/styles'
import { colors, timerColors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'
import { TimerConfig, TimerType } from '../../types'
import { confirmAction } from '../../utils/helpers'
import { defaultTimerConfig, timerLabels } from '../../utils/timer'

type ExerciseEditProps = StackScreenProps<RootStackParamList, 'ExerciseEdit'>

const timerTypes: TimerType[] = ['AMRAP', 'EMOM', 'TABATA', 'FOR_TIME']

const ExerciseEditScreen = ({ navigation, route }: ExerciseEditProps) => {
  const { programId, sessionId, exerciseId } = route.params
  const { programs, addExercise, updateExercise, deleteExercise } = useStore()

  const existing = exerciseId
    ? programs
        .find(p => p.id === programId)
        ?.sessions.find(s => s.id === sessionId)
        ?.exercises.find(e => e.id === exerciseId)
    : undefined

  const [name, setName] = useState(existing?.name ?? '')
  const [details, setDetails] = useState(existing?.details ?? '')
  const [timer, setTimer] = useState<TimerConfig | undefined>(existing?.timer)

  const save = () => {
    const input = { name: name.trim(), details: details.trim(), timer }
    if (exerciseId) updateExercise({ programId, sessionId, exerciseId }, input)
    else addExercise(programId, sessionId, input)
    navigation.goBack()
  }

  const remove = () => {
    if (!exerciseId) return
    confirmAction('Supprimer l’exercice ?', `« ${existing?.name} » sera supprimé de la séance.`, () => {
      deleteExercise({ programId, sessionId, exerciseId })
      navigation.goBack()
    })
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <Text style={common.title}>{exerciseId ? 'Modifier l’exercice' : 'Nouvel exercice'}</Text>

      <Text style={common.label}>Nom</Text>
      <TextInput
        style={common.input}
        value={name}
        onChangeText={setName}
        placeholder="ex : WOD, Back Squat, Échauffement…"
        placeholderTextColor={colors.textMuted}
      />

      <Text style={common.label}>Détails</Text>
      <TextInput
        style={[common.input, styles.multiline]}
        value={details}
        onChangeText={setDetails}
        placeholder={'ex :\n10 Pull-ups\n15 Push-ups\n20 Air squats'}
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
      />

      <Text style={common.label}>Timer</Text>
      <View style={styles.types}>
        <Pressable
          onPress={() => setTimer(undefined)}
          style={[styles.chip, { borderColor: colors.textMuted }, !timer && { backgroundColor: colors.surfaceAlt }]}
        >
          <Text style={styles.chipText}>Sans timer</Text>
        </Pressable>
        {timerTypes.map(type => {
          const selected = timer?.type === type
          return (
            <Pressable
              key={type}
              onPress={() => !selected && setTimer(defaultTimerConfig(type))}
              style={[styles.chip, { borderColor: timerColors[type] }, selected && { backgroundColor: timerColors[type] }]}
            >
              <Text style={styles.chipText}>{timerLabels[type]}</Text>
            </Pressable>
          )
        })}
      </View>

      {timer ? (
        <View style={common.card}>
          <TimerConfigForm config={timer} onChange={setTimer} />
        </View>
      ) : (
        <Text style={styles.hint}>Sans timer, l’exercice se valide manuellement depuis la séance.</Text>
      )}

      <Button title="Enregistrer" color={colors.green} onPress={save} disabled={!name.trim()} style={{ marginTop: 20 }} />
      {exerciseId && (
        <Button title="Supprimer l’exercice" variant="outline" color={colors.red} onPress={remove} style={{ marginTop: 12 }} />
      )}
    </ScrollView>
  )
}

export default ExerciseEditScreen

const styles = StyleSheet.create({
  multiline: {
    minHeight: 120,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    borderWidth: 2,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 14,
  },
  chipText: {
    color: colors.text,
    fontWeight: '600',
  },
  hint: {
    color: colors.textMuted,
    fontSize: 15,
  },
})

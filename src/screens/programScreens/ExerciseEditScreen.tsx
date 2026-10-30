import { useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import Chip from '../../components/Chip'
import ScreenHeader from '../../components/ScreenHeader'
import TimerConfigForm from '../../components/TimerConfigForm'
import { useCommonStyles } from '../../components/styles'
import { useStore } from '../../store/StoreContext'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import { TimerConfig } from '../../types'
import { confirmAction } from '../../utils/helpers'
import { defaultTimerConfig, timerLabels, timerTypes } from '../../utils/timer'

type ExerciseEditProps = StackScreenProps<RootStackParamList, 'ExerciseEdit'>

const ExerciseEditScreen = ({ navigation, route }: ExerciseEditProps) => {
  const { programId, sessionId, exerciseId } = route.params
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
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
      <ScreenHeader eyebrow="Séance" title={exerciseId ? 'Modifier l’exercice' : 'Nouvel exercice'} pose="jack" />

      <Text style={[common.label, { marginTop: 0 }]}>Nom</Text>
      <TextInput
        style={common.input}
        value={name}
        onChangeText={setName}
        placeholder="ex : WOD, Back Squat, Échauffement…"
        placeholderTextColor={theme.colors.textMuted}
      />

      <Text style={common.label}>Détails</Text>
      <TextInput
        style={[common.input, styles.multiline]}
        value={details}
        onChangeText={setDetails}
        placeholder={'ex :\n10 Pull-ups\n15 Push-ups\n20 Air squats'}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        textAlignVertical="top"
      />

      <Text style={common.label}>Timer</Text>
      <View style={styles.types}>
        <Chip label="Sans timer" selected={!timer} onPress={() => setTimer(undefined)} />
        {timerTypes.map(type => (
          <Chip
            key={type}
            label={timerLabels[type]}
            color={theme.timer[type]}
            selected={timer?.type === type}
            onPress={() => timer?.type !== type && setTimer(defaultTimerConfig(type))}
          />
        ))}
      </View>

      {timer ? (
        <Card>
          <TimerConfigForm config={timer} onChange={setTimer} />
        </Card>
      ) : (
        <Text style={common.cardText}>Sans timer, l’exercice se valide manuellement depuis la séance.</Text>
      )}

      <Button
        title="Enregistrer"
        size="lg"
        onPress={save}
        disabled={!name.trim() || (timer?.type === 'MIX' && timer.segments.length === 0)}
        style={{ marginTop: 20 }}
      />
      {exerciseId && (
        <Button
          title="Supprimer l’exercice"
          variant="ghost"
          color={theme.colors.danger}
          onPress={remove}
          style={{ marginTop: 6 }}
        />
      )}
    </ScrollView>
  )
}

export default ExerciseEditScreen

const useStyles = makeStyles(() => ({
  multiline: {
    minHeight: 120,
  },
  types: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
}))

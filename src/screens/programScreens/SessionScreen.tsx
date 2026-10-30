import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import InputModal from '../../components/InputModal'
import ProgressBar from '../../components/ProgressBar'
import ScreenHeader from '../../components/ScreenHeader'
import { useCommonStyles } from '../../components/styles'
import { useStore } from '../../store/StoreContext'
import { onColor } from '../../theme/palettes'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import { Exercise, ExerciseRef } from '../../types'
import { confirmAction } from '../../utils/helpers'
import { describeTimer } from '../../utils/timer'

type SessionProps = StackScreenProps<RootStackParamList, 'Session'>

const SessionScreen = ({ navigation, route }: SessionProps) => {
  const { programId, sessionId } = route.params
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
  const {
    programs,
    renameSession,
    duplicateSession,
    deleteSession,
    resetSession,
    moveExercise,
    completeExercise,
    uncompleteExercise,
  } = useStore()
  const [isRenameVisible, setIsRenameVisible] = useState(false)
  const [toValidate, setToValidate] = useState<Exercise | null>(null)

  const program = programs.find(p => p.id === programId)
  const session = program?.sessions.find(s => s.id === sessionId)
  if (!program || !session) return null

  const refOf = (exercise: Exercise): ExerciseRef => ({ programId, sessionId, exerciseId: exercise.id })
  const done = session.exercises.filter(e => e.completed).length
  const total = session.exercises.length

  const toggle = (exercise: Exercise) => {
    if (exercise.completed) uncompleteExercise(refOf(exercise))
    else setToValidate(exercise)
  }

  const remove = () =>
    confirmAction('Supprimer la séance ?', `« ${session.name} » et ses exercices seront supprimés.`, () => {
      navigation.goBack()
      deleteSession(programId, sessionId)
    })

  const reset = () =>
    confirmAction(
      'Réinitialiser la séance ?',
      'Tous les exercices seront marqués comme non validés et les résultats effacés.',
      () => resetSession(programId, sessionId),
      'Réinitialiser',
    )

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow={program.name} title={session.name} pose={done === total && total > 0 ? 'flex' : 'swingUp'}>
        <View style={common.links}>
          <Pressable onPress={() => setIsRenameVisible(true)}>
            <Text style={common.link}>Renommer</Text>
          </Pressable>
          <Pressable onPress={() => duplicateSession(programId, sessionId)}>
            <Text style={common.link}>Dupliquer</Text>
          </Pressable>
          {done > 0 && (
            <Pressable onPress={reset}>
              <Text style={common.link}>Réinitialiser</Text>
            </Pressable>
          )}
          <Pressable onPress={remove}>
            <Text style={common.danger}>Supprimer</Text>
          </Pressable>
        </View>
      </ScreenHeader>

      {total > 0 && (
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {done === total ? 'Séance terminée, bravo 💪' : `${done}/${total} exercices validés`}
          </Text>
          <ProgressBar progress={done / total} />
        </View>
      )}

      {total === 0 && (
        <Card>
          <Text style={common.cardText}>
            Ajoute les exercices de ta séance et associe-leur un timer (AMRAP, EMOM, Tabata, For Time ou Mix) pour le
            lancer directement d'ici.
          </Text>
        </Card>
      )}

      {session.exercises.map((exercise, index) => {
        const timerColor = exercise.timer ? theme.timer[exercise.timer.type] : undefined
        return (
          <Card key={exercise.id} style={exercise.completed && styles.cardDone}>
            <View style={styles.cardHeader}>
              <Pressable
                onPress={() => toggle(exercise)}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: exercise.completed }}
                accessibilityLabel={`Valider ${exercise.name}`}
                style={[styles.check, exercise.completed && styles.checkDone]}
                hitSlop={8}
              >
                {exercise.completed && <Text style={styles.checkMark}>✓</Text>}
              </Pressable>
              <View style={styles.cardBody}>
                <Text style={[common.cardTitle, exercise.completed && styles.titleDone]}>{exercise.name}</Text>
                {exercise.timer && timerColor && (
                  <View style={styles.timerTag}>
                    <View style={[styles.dot, { backgroundColor: timerColor }]} />
                    <Text style={styles.timerText}>{describeTimer(exercise.timer)}</Text>
                  </View>
                )}
                {!!exercise.details && <Text style={styles.details}>{exercise.details}</Text>}
                {!!exercise.result && (
                  <View style={styles.result}>
                    <Text style={styles.resultText}>{exercise.result}</Text>
                  </View>
                )}
              </View>
            </View>

            <View style={styles.actions}>
              {exercise.timer && timerColor && (
                <Pressable
                  style={({ pressed }) => [styles.startButton, { backgroundColor: timerColor }, pressed && { opacity: 0.75 }]}
                  onPress={() =>
                    exercise.timer &&
                    navigation.navigate('TimerRun', { config: exercise.timer, exerciseRef: refOf(exercise) })
                  }
                >
                  <Text style={[styles.startButtonText, { color: onColor(timerColor) }]}>▶ Lancer</Text>
                </Pressable>
              )}
              <View style={styles.spacer} />
              <Pressable
                onPress={() => moveExercise(refOf(exercise), -1)}
                disabled={index === 0}
                hitSlop={6}
                accessibilityLabel="Monter"
              >
                <Text style={[styles.icon, index === 0 && styles.iconDisabled]}>↑</Text>
              </Pressable>
              <Pressable
                onPress={() => moveExercise(refOf(exercise), 1)}
                disabled={index === total - 1}
                hitSlop={6}
                accessibilityLabel="Descendre"
              >
                <Text style={[styles.icon, index === total - 1 && styles.iconDisabled]}>↓</Text>
              </Pressable>
              <Pressable
                onPress={() => navigation.navigate('ExerciseEdit', { programId, sessionId, exerciseId: exercise.id })}
              >
                <Text style={common.link}>Modifier</Text>
              </Pressable>
            </View>
          </Card>
        )
      })}

      <Button
        title="+ Ajouter un exercice"
        onPress={() => navigation.navigate('ExerciseEdit', { programId, sessionId })}
        style={{ marginTop: 8 }}
      />

      <InputModal
        visible={isRenameVisible}
        title="Renommer la séance"
        initialValue={session.name}
        onSubmit={name => renameSession(programId, sessionId, name)}
        onClose={() => setIsRenameVisible(false)}
      />
      <InputModal
        visible={toValidate !== null}
        title={`Valider « ${toValidate?.name ?? ''} »`}
        label="Résultat / score (optionnel)"
        placeholder="ex : 5x5 @ 100 kg"
        submitLabel="✓ Valider"
        submitColor={theme.colors.success}
        required={false}
        onSubmit={result => toValidate && completeExercise(refOf(toValidate), result)}
        onClose={() => setToValidate(null)}
      />
    </ScrollView>
  )
}

export default SessionScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  progress: {
    marginBottom: 18,
    gap: 8,
  },
  progressText: {
    fontFamily: fonts.semibold,
    color: colors.text,
    fontSize: 14,
  },
  cardDone: {
    opacity: 0.7,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 14,
  },
  cardBody: {
    flex: 1,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  checkMark: {
    fontFamily: fonts.semibold,
    color: colors.surface,
    fontSize: 15,
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  timerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
  details: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    lineHeight: 20,
  },
  result: {
    alignSelf: 'flex-start',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginTop: 10,
  },
  resultText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.success,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
  },
  startButton: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  startButtonText: {
    fontFamily: fonts.semibold,
    fontSize: 14,
  },
  spacer: {
    flex: 1,
  },
  icon: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 18,
  },
  iconDisabled: {
    opacity: 0.2,
  },
}))

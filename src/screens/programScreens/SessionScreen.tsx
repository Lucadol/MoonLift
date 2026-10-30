import { useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import NameModal from '../../components/NameModal'
import ProgressBar from '../../components/ProgressBar'
import ValidateModal from '../../components/ValidateModal'
import { common } from '../../components/styles'
import { colors, timerColors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'
import { Exercise, ExerciseRef } from '../../types'
import { confirmAction } from '../../utils/helpers'
import { describeTimer } from '../../utils/timer'

type SessionProps = StackScreenProps<RootStackParamList, 'Session'>

const SessionScreen = ({ navigation, route }: SessionProps) => {
  const { programId, sessionId } = route.params
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

  const session = programs.find(p => p.id === programId)?.sessions.find(s => s.id === sessionId)
  if (!session) return null

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
      <Text style={common.title}>{session.name}</Text>
      <View style={styles.links}>
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

      {total > 0 && (
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {done === total ? 'Séance terminée 💪' : `${done}/${total} exercices validés`}
          </Text>
          <ProgressBar progress={done / total} />
        </View>
      )}

      {total === 0 && (
        <Text style={common.empty}>
          Ajoute les exercices de ta séance.{'\n'}Associe-leur un timer (AMRAP, EMOM, Tabata, For Time) pour le lancer
          directement d'ici.
        </Text>
      )}

      {session.exercises.map((exercise, index) => (
        <View key={exercise.id} style={[common.card, exercise.completed && styles.cardDone]}>
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
              {exercise.timer && (
                <Text style={[styles.timerTag, { color: timerColors[exercise.timer.type] }]}>
                  ⏱ {describeTimer(exercise.timer)}
                </Text>
              )}
              {!!exercise.details && <Text style={styles.details}>{exercise.details}</Text>}
              {!!exercise.result && <Text style={styles.result}>Résultat : {exercise.result}</Text>}
            </View>
          </View>

          <View style={styles.actions}>
            {exercise.timer && (
              <Pressable
                style={[styles.startButton, { backgroundColor: timerColors[exercise.timer.type] }]}
                onPress={() =>
                  exercise.timer && navigation.navigate('TimerRun', { config: exercise.timer, exerciseRef: refOf(exercise) })
                }
              >
                <Text style={styles.startButtonText}>▶ Lancer</Text>
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
        </View>
      ))}

      <Button
        title="+ Ajouter un exercice"
        color={colors.blue}
        onPress={() => navigation.navigate('ExerciseEdit', { programId, sessionId })}
        style={{ marginTop: 10 }}
      />

      <NameModal
        visible={isRenameVisible}
        title="Renommer la séance"
        initialValue={session.name}
        onSubmit={name => renameSession(programId, sessionId, name)}
        onClose={() => setIsRenameVisible(false)}
      />
      <ValidateModal
        visible={toValidate !== null}
        exerciseName={toValidate?.name ?? ''}
        onValidate={result => toValidate && completeExercise(refOf(toValidate), result)}
        onClose={() => setToValidate(null)}
      />
    </ScrollView>
  )
}

export default SessionScreen

const styles = StyleSheet.create({
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    marginTop: -10,
    marginBottom: 20,
  },
  progress: {
    marginBottom: 20,
    gap: 8,
  },
  progressText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  cardDone: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    gap: 14,
  },
  cardBody: {
    flex: 1,
  },
  check: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  checkMark: {
    color: colors.text,
    fontSize: 17,
    fontWeight: 'bold',
  },
  titleDone: {
    textDecorationLine: 'line-through',
  },
  timerTag: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 4,
  },
  details: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 6,
    lineHeight: 21,
  },
  result: {
    color: colors.green,
    fontSize: 15,
    fontWeight: '600',
    marginTop: 6,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 14,
  },
  startButton: {
    borderRadius: 18,
    paddingVertical: 7,
    paddingHorizontal: 16,
  },
  startButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  spacer: {
    flex: 1,
  },
  icon: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
  },
  iconDisabled: {
    opacity: 0.25,
  },
})

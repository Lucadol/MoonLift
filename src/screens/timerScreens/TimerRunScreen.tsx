import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import ProgressBar from '../../components/ProgressBar'
import { colors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'
import { confirmAction } from '../../utils/helpers'
import { buildPhases, describeTimer, formatClock, getSnapshot, totalDurationSec } from '../../utils/timer'
import { useBeeps } from '../../utils/useBeeps'

type TimerRunProps = StackScreenProps<RootStackParamList, 'TimerRun'>

type Status = 'ready' | 'running' | 'paused' | 'finished'

const PREP_MS = 10 * 1000
const TICK_MS = 100

const phaseColors = {
  prep: colors.yellow,
  work: colors.green,
  rest: colors.red,
}

const TimerRunScreen = ({ navigation, route }: TimerRunProps) => {
  const { config, exerciseRef } = route.params
  const { programs, completeExercise } = useStore()
  const beep = useBeeps()

  const exercise = useMemo(() => {
    if (!exerciseRef) return undefined
    return programs
      .find(p => p.id === exerciseRef.programId)
      ?.sessions.find(s => s.id === exerciseRef.sessionId)
      ?.exercises.find(e => e.id === exerciseRef.exerciseId)
  }, [programs, exerciseRef])

  const phases = useMemo(() => buildPhases(config), [config])
  const totalMs = totalDurationSec(phases) * 1000

  const [status, setStatus] = useState<Status>('ready')
  const [elapsedMs, setElapsedMs] = useState(0) // inclut les 10 s de préparation
  const [rounds, setRounds] = useState(0) // compteur de tours (AMRAP / For Time)
  const [result, setResult] = useState('')
  const accumulatedMs = useRef(0)
  const startedAt = useRef<number | null>(null)
  const lastBeepKey = useRef('')

  const inPrep = elapsedMs < PREP_MS
  const snapshot = getSnapshot(phases, Math.max(0, elapsedMs - PREP_MS))
  const workoutElapsedMs = snapshot.totalElapsedMs

  const readElapsed = () =>
    accumulatedMs.current + (startedAt.current !== null ? Date.now() - startedAt.current : 0)

  const finish = useCallback(
    (timeCapReached: boolean) => {
      const elapsed = Math.max(0, readElapsed() - PREP_MS)
      accumulatedMs.current = readElapsed()
      startedAt.current = null
      setElapsedMs(accumulatedMs.current)
      setStatus('finished')
      beep('long')
      // Pré-remplit le résultat selon le type de timer
      if (config.type === 'AMRAP') {
        setResult(`${rounds} tour${rounds > 1 ? 's' : ''}`)
      } else if (config.type === 'FOR_TIME') {
        setResult(timeCapReached ? `Time cap (${rounds} tour${rounds > 1 ? 's' : ''})` : formatClock(Math.floor(elapsed / 1000)))
      }
    },
    [beep, config.type, rounds],
  )

  // Boucle principale : le temps est recalculé à partir de Date.now() pour éviter toute dérive
  useEffect(() => {
    if (status !== 'running') return
    const interval = setInterval(() => setElapsedMs(readElapsed()), TICK_MS)
    return () => clearInterval(interval)
  }, [status])

  // Fin automatique + bips des 3 dernières secondes et des changements de phase
  useEffect(() => {
    if (status !== 'running') return
    if (!inPrep && snapshot.finished) {
      finish(true)
      return
    }
    const remainingMs = inPrep ? PREP_MS - elapsedMs : snapshot.phaseRemainingMs
    const remainingSec = Math.ceil(remainingMs / 1000)
    const phaseKey = inPrep ? 'prep' : `${snapshot.phaseIndex}`
    const key = `${phaseKey}-${remainingSec}`
    if (key === lastBeepKey.current) return
    const previousPhase = lastBeepKey.current.split('-')[0]
    lastBeepKey.current = key
    if (previousPhase !== '' && previousPhase !== phaseKey) {
      beep('long')
    } else if (remainingSec <= 3) {
      beep('short')
    }
  }, [status, elapsedMs, inPrep, snapshot, finish, beep])

  // Garde l'écran allumé pendant le timer
  useEffect(() => {
    if (status !== 'running') return
    activateKeepAwakeAsync('timer').catch(() => {})
    return () => {
      deactivateKeepAwake('timer').catch(() => {})
    }
  }, [status])

  // Demande confirmation avant de quitter un timer en cours
  useEffect(
    () =>
      navigation.addListener('beforeRemove', e => {
        if (status !== 'running' && status !== 'paused') return
        e.preventDefault()
        confirmAction(
          'Quitter le timer ?',
          'Le timer en cours sera perdu.',
          () => navigation.dispatch(e.data.action),
          'Quitter',
        )
      }),
    [navigation, status],
  )

  const start = () => {
    accumulatedMs.current = 0
    lastBeepKey.current = ''
    startedAt.current = Date.now()
    setElapsedMs(0)
    setRounds(0)
    setResult('')
    setStatus('running')
  }

  const pause = () => {
    accumulatedMs.current = readElapsed()
    startedAt.current = null
    setElapsedMs(accumulatedMs.current)
    setStatus('paused')
  }

  const resume = () => {
    startedAt.current = Date.now()
    setStatus('running')
  }

  const validate = () => {
    if (!exerciseRef) return
    completeExercise(exerciseRef, result)
    navigation.goBack()
  }

  // ---- Affichage ----

  let phaseLabel: string
  let clockSec: number
  let color: string
  if (status === 'ready') {
    phaseLabel = 'PRÊT ?'
    clockSec = snapshot.phase.countUp ? 0 : phases[0].durationSec
    color = colors.text
  } else if (inPrep && status !== 'finished') {
    phaseLabel = 'PRÉPARATION'
    clockSec = Math.ceil((PREP_MS - elapsedMs) / 1000)
    color = phaseColors.prep
  } else if (status === 'finished') {
    phaseLabel = 'TERMINÉ'
    clockSec = Math.floor(workoutElapsedMs / 1000)
    color = colors.text
  } else {
    phaseLabel = snapshot.phase.kind === 'work' ? 'TRAVAIL' : 'REPOS'
    clockSec = snapshot.phase.countUp
      ? Math.floor(snapshot.phaseElapsedMs / 1000)
      : Math.ceil(snapshot.phaseRemainingMs / 1000)
    color = phaseColors[snapshot.phase.kind]
  }

  const showRoundCounter = config.type === 'AMRAP' || config.type === 'FOR_TIME'
  const showPhaseRounds = config.type === 'EMOM' || config.type === 'TABATA'
  const progress = totalMs > 0 ? Math.min(1, workoutElapsedMs / totalMs) : 0
  const isActive = status === 'running' || status === 'paused'

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>{exercise?.name ?? describeTimer(config)}</Text>
          {exercise && <Text style={styles.subtitle}>{describeTimer(config)}</Text>}
          {!!exercise?.details && <Text style={styles.details}>{exercise.details}</Text>}
        </View>

        <View style={styles.clockContainer}>
          <Text style={[styles.phase, { color }]}>{phaseLabel}</Text>
          <Text style={[styles.clock, { color }]} accessibilityRole="timer">
            {formatClock(clockSec)}
          </Text>
          {showPhaseRounds && status !== 'ready' && !inPrep && (
            <Text style={styles.rounds}>
              Tour {snapshot.phase.round} / {snapshot.phase.totalRounds}
            </Text>
          )}
          {showRoundCounter && status !== 'ready' && <Text style={styles.rounds}>Tours : {rounds}</Text>}
          {config.type === 'FOR_TIME' && status !== 'ready' && status !== 'finished' && (
            <Text style={styles.cap}>Time cap {formatClock(config.capSec)}</Text>
          )}
          <ProgressBar progress={progress} color={color} style={styles.progress} />
        </View>

        {status === 'ready' && <Button title="DÉMARRER" color={colors.green} onPress={start} />}

        {isActive && (
          <View style={styles.controls}>
            {showRoundCounter && status === 'running' && !inPrep && (
              <Pressable style={styles.roundButton} onPress={() => setRounds(r => r + 1)}>
                <Text style={styles.roundButtonText}>+1 TOUR</Text>
              </Pressable>
            )}
            {config.type === 'FOR_TIME' && status === 'running' && !inPrep && (
              <Button title="TERMINÉ !" color={colors.green} onPress={() => finish(false)} />
            )}
            <View style={styles.row}>
              {status === 'running' ? (
                <Button title="PAUSE" color={colors.yellow} onPress={pause} style={styles.flex} />
              ) : (
                <Button title="REPRENDRE" color={colors.green} onPress={resume} style={styles.flex} />
              )}
              {status === 'paused' && (
                <Button title="ARRÊTER" color={colors.red} onPress={() => finish(false)} style={styles.flex} />
              )}
            </View>
          </View>
        )}

        {status === 'finished' && (
          <View style={styles.finishPanel}>
            {exerciseRef ? (
              <>
                <Text style={styles.finishTitle}>Exercice terminé !</Text>
                <Text style={styles.label}>Résultat / score (optionnel)</Text>
                <TextInput
                  style={styles.input}
                  value={result}
                  onChangeText={setResult}
                  placeholder="ex : 5 tours + 12 reps, 60 kg…"
                  placeholderTextColor={colors.textMuted}
                />
                <Button title="✓ VALIDER L'EXERCICE" color={colors.green} onPress={validate} />
                <Button
                  title="Ne pas valider"
                  variant="outline"
                  color={colors.textMuted}
                  onPress={() => navigation.goBack()}
                />
              </>
            ) : (
              <>
                {!!result && <Text style={styles.finishTitle}>Résultat : {result}</Text>}
                <Button title="RECOMMENCER" color={colors.green} onPress={start} />
                <Button title="Retour" variant="outline" color={colors.textMuted} onPress={() => navigation.goBack()} />
              </>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

export default TimerRunScreen

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 4,
  },
  details: {
    color: colors.text,
    fontSize: 16,
    marginTop: 12,
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    alignSelf: 'stretch',
    lineHeight: 22,
  },
  clockContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingVertical: 30,
  },
  phase: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 2,
  },
  clock: {
    fontSize: 96,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  rounds: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
    marginTop: 4,
  },
  cap: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 4,
  },
  progress: {
    alignSelf: 'stretch',
    marginTop: 24,
  },
  controls: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  roundButton: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingVertical: 28,
    alignItems: 'center',
  },
  roundButtonText: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '700',
  },
  finishPanel: {
    gap: 12,
  },
  finishTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  label: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: colors.surface,
    color: colors.text,
    borderRadius: 10,
    padding: 12,
    fontSize: 17,
  },
})

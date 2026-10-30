import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'
import { SegmentType } from '../../types'

import Button from '../../components/Button'
import LoadHints from '../../components/LoadHints'
import Mascot from '../../components/mascot/Mascot'
import { PoseName } from '../../components/mascot/figure'
import ProgressBar from '../../components/ProgressBar'
import ValidationSheet from '../../components/ValidationSheet'
import { useStore } from '../../store/StoreContext'
import { mix, onColor } from '../../theme/palettes'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import { confirmAction } from '../../utils/helpers'
import {
  buildPhases,
  describeTimer,
  formatClock,
  getSnapshot,
  phaseStartMs,
  segmentsOf,
  timerLabels,
  totalDurationSec,
} from '../../utils/timer'
import { useBeeps } from '../../utils/useBeeps'
import { useExerciseValidation } from '../../utils/useExerciseValidation'
import { useVoice } from '../../utils/useVoice'

type TimerRunProps = StackScreenProps<RootStackParamList, 'TimerRun'>

type Status = 'ready' | 'running' | 'paused' | 'finished'

const PREP_MS = 10 * 1000
const TICK_MS = 100

const plural = (n: number, word: string) => `${n} ${word}${n > 1 ? 's' : ''}`

const spokenLabels: Record<SegmentType, string> = {
  AMRAP: 'AMRAP',
  EMOM: 'EMOM',
  TABATA: 'Tabata',
  FOR_TIME: 'For time',
  REST: 'Repos',
}

const TimerRunScreen = ({ navigation, route }: TimerRunProps) => {
  const { config, exerciseRef } = route.params
  const theme = useTheme()
  const styles = useStyles()
  const { programs, logTimer } = useStore()
  const beep = useBeeps()
  const speak = useVoice()
  const { validate: validateExercise, modal: newRecordModal } = useExerciseValidation()

  const exercise = useMemo(() => {
    if (!exerciseRef) return undefined
    return programs
      .find(p => p.id === exerciseRef.programId)
      ?.sessions.find(s => s.id === exerciseRef.sessionId)
      ?.exercises.find(e => e.id === exerciseRef.exerciseId)
  }, [programs, exerciseRef])

  const segments = useMemo(() => segmentsOf(config), [config])
  const phases = useMemo(() => buildPhases(config), [config])
  const totalMs = totalDurationSec(phases) * 1000

  const [status, setStatus] = useState<Status>('ready')
  const [elapsedMs, setElapsedMs] = useState(0) // inclut les 10 s de préparation
  const [rounds, setRounds] = useState<Record<number, number>>({}) // tours comptés par bloc (AMRAP / For Time)
  const [result, setResult] = useState('')
  const [failedRounds, setFailedRounds] = useState<number[]>([]) // tours ratés d'un EMOM / Tabata (index 0)
  const [isSheetVisible, setIsSheetVisible] = useState(false)
  const accumulatedMs = useRef(0)
  const startedAt = useRef<number | null>(null)
  const lastBeepKey = useRef('')
  const roundsRef = useRef(rounds)
  roundsRef.current = rounds
  const forTimeSec = useRef<Record<number, number>>({}) // temps réalisé par bloc For Time

  const inPrep = elapsedMs < PREP_MS
  const snapshot = getSnapshot(phases, Math.max(0, elapsedMs - PREP_MS))
  const { phase } = snapshot
  const segmentIndex = phase.segmentIndex
  const isMix = config.type === 'MIX'

  const readElapsed = () =>
    accumulatedMs.current + (startedAt.current !== null ? Date.now() - startedAt.current : 0)

  // Résultat pré-rempli : tours pour un AMRAP, temps pour un For Time (bloc par bloc pour un MIX)
  const buildResult = useCallback(
    (reachedSegment: number) =>
      segments
        .map((segment, i) => {
          if (i > reachedSegment) return null
          const r = roundsRef.current[i] ?? 0
          let text: string | null = null
          if (segment.type === 'AMRAP') text = plural(r, 'tour')
          if (segment.type === 'FOR_TIME') {
            const time = forTimeSec.current[i]
            text = time !== undefined ? formatClock(time) : `Time cap${r ? ` (${plural(r, 'tour')})` : ''}`
          }
          return text && (segments.length > 1 ? `Bloc ${i + 1} : ${text}` : text)
        })
        .filter(Boolean)
        .join(' · '),
    [segments],
  )

  const finish = useCallback(
    (reachedSegment: number) => {
      accumulatedMs.current = readElapsed()
      startedAt.current = null
      setElapsedMs(accumulatedMs.current)
      setStatus('finished')
      beep('long')
      speak('Terminé, bravo !')
      const text = buildResult(reachedSegment)
      setResult(text)
      // Un timer libre (hors programme) est ajouté à l'historique s'il a vraiment servi
      if (!exerciseRef && accumulatedMs.current - PREP_MS >= 30 * 1000) logTimer(config, text)
    },
    [beep, speak, buildResult, exerciseRef, logTimer, config],
  )

  // Saute directement au début d'une phase (fin d'un For Time, repos écourté)
  const skipTo = (phaseIndex: number) => {
    if (phaseIndex >= phases.length) {
      finish(segments.length - 1)
      return
    }
    accumulatedMs.current = PREP_MS + phaseStartMs(phases, phaseIndex)
    if (startedAt.current !== null) startedAt.current = Date.now()
    setElapsedMs(accumulatedMs.current)
  }

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
      finish(segments.length - 1)
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
      speak(announcePhase(previousPhase === 'prep' ? -1 : parseInt(previousPhase, 10)))
    } else if (remainingSec <= 3) {
      beep('short')
    } else if (!inPrep) {
      const durationSec = snapshot.phase.durationSec
      if (durationSec >= 180 && remainingSec === 60) speak('Plus qu’une minute !')
      else if (durationSec >= 240 && remainingSec === Math.ceil(durationSec / 2)) speak('Mi-parcours, tiens bon !')
    }
  }, [status, elapsedMs, inPrep, snapshot, finish, beep, speak, segments.length])

  // Annonce vocale au début d'une phase
  function announcePhase(previousIndex: number) {
    const current = snapshot.phase
    const previous = previousIndex >= 0 ? phases[previousIndex] : undefined
    const newSegment = !previous || previous.segmentIndex !== current.segmentIndex
    if (current.kind === 'rest') return 'Repos'
    let text = ''
    if (isMix && newSegment) text = `Bloc ${current.segmentIndex + 1}, ${spokenLabels[current.segmentType]}. `
    if (newSegment) return `${text}C'est parti !`
    if (current.totalRounds > 1 && current.round === current.totalRounds) return 'Dernier tour !'
    return current.segmentType === 'EMOM' ? `Tour ${current.round}` : 'Go !'
  }

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
    forTimeSec.current = {}
    startedAt.current = Date.now()
    setElapsedMs(0)
    setRounds({})
    setResult('')
    setFailedRounds([])
    setStatus('running')
    speak('Prépare-toi, dix secondes.')
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

  const addRound = () => setRounds(prev => ({ ...prev, [segmentIndex]: (prev[segmentIndex] ?? 0) + 1 }))

  const completeForTime = () => {
    forTimeSec.current[segmentIndex] = Math.floor(snapshot.phaseElapsedMs / 1000)
    if (snapshot.phaseIndex === phases.length - 1) finish(segmentIndex)
    else skipTo(snapshot.phaseIndex + 1)
  }

  const toggleFailedRound = (roundIndex: number) =>
    setFailedRounds(prev => (prev.includes(roundIndex) ? prev.filter(r => r !== roundIndex) : [...prev, roundIndex]))


  // ---- Affichage ----

  const started = status !== 'ready'
  const working = started && status !== 'finished' && !inPrep
  let background = theme.colors.background
  if (started && status !== 'finished') {
    background = inPrep || phase.kind === 'rest' ? theme.colors.surfaceAlt : theme.timer[phase.segmentType]
  }
  const foreground = background === theme.colors.background ? theme.colors.text : onColor(background)
  const soft = mix(background, foreground, 0.14)

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: background, elevation: 0, shadowOpacity: 0, borderBottomWidth: 0 },
      headerTintColor: foreground,
    })
  }, [navigation, background, foreground])

  let phaseLabel: string
  let clockSec: number
  if (status === 'ready') {
    phaseLabel = 'Prêt ?'
    clockSec = phases[0].countUp ? 0 : phases[0].durationSec
  } else if (status === 'finished') {
    phaseLabel = 'Terminé'
    clockSec = Math.floor(snapshot.totalElapsedMs / 1000)
  } else if (inPrep) {
    phaseLabel = 'Préparation'
    clockSec = Math.ceil((PREP_MS - elapsedMs) / 1000)
  } else {
    phaseLabel = phase.kind === 'work' ? 'Travail' : 'Repos'
    clockSec = phase.countUp ? Math.floor(snapshot.phaseElapsedMs / 1000) : Math.ceil(snapshot.phaseRemainingMs / 1000)
  }

  // La mascotte s'anime : swing pendant le travail, respiration pendant la préparation et le repos
  let pose: PoseName = 'jack'
  if (status === 'finished') pose = 'flex'
  else if (started && (inPrep || phase.kind === 'rest')) pose = Math.floor(elapsedMs / 900) % 2 ? 'restBreath' : 'rest'
  else if (started) pose = Math.floor(elapsedMs / 700) % 2 ? 'swingDown' : 'swingUp'

  const segment = segments[segmentIndex]
  const nextSegment = segments[segmentIndex + 1]
  const showRoundCounter = working && (segment.type === 'AMRAP' || segment.type === 'FOR_TIME')
  const progress = totalMs > 0 ? Math.min(1, snapshot.totalElapsedMs / totalMs) : 0
  const isActive = status === 'running' || status === 'paused'
  const segmentRounds = rounds[segmentIndex] ?? 0

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: foreground }]}>{exercise?.name ?? timerLabels[config.type]}</Text>
          <Text style={[styles.subtitle, { color: foreground }]}>{describeTimer(config)}</Text>
          {isMix && working && (
            <View style={[styles.segmentPill, { backgroundColor: soft }]}>
              <Text style={[styles.segmentText, { color: foreground }]}>
                Bloc {segmentIndex + 1}/{segments.length} · {describeTimer(segment)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.center}>
          <Mascot
            pose={pose}
            size={150}
            onBackground={background === theme.colors.background ? undefined : background}
          />
          <Text style={[styles.phase, { color: foreground }]}>{phaseLabel}</Text>
          <Text style={[styles.clock, { color: foreground }]} accessibilityRole="timer">
            {formatClock(clockSec)}
          </Text>
          <View style={styles.infoRow}>
            {working && phase.totalRounds > 1 && (
              <Text style={[styles.info, { color: foreground }]}>
                Tour {phase.round}/{phase.totalRounds}
              </Text>
            )}
            {(showRoundCounter || (status === 'paused' && segmentRounds > 0)) && (
              <Text style={[styles.info, { color: foreground }]}>{plural(segmentRounds, 'tour')}</Text>
            )}
            {working && segment.type === 'FOR_TIME' && (
              <Text style={[styles.infoMuted, { color: foreground }]}>cap {formatClock(segment.capSec)}</Text>
            )}
          </View>
          {isMix && working && nextSegment && (
            <Text style={[styles.next, { color: foreground }]}>Ensuite : {describeTimer(nextSegment)}</Text>
          )}
          {started && (
            <ProgressBar progress={progress} color={foreground} trackColor={soft} style={styles.progress} />
          )}
        </View>

        {!!exercise?.details && status !== 'finished' && (
          <View style={[styles.details, { backgroundColor: started ? soft : theme.colors.surface }]}>
            <Text style={[styles.detailsText, { color: foreground }]}>{exercise.details}</Text>
          </View>
        )}
        {exercise && status !== 'finished' && (
          <LoadHints
            name={exercise.name}
            details={exercise.details}
            color={foreground}
            background={started ? soft : theme.colors.surface}
            style={styles.loads}
          />
        )}

        {status === 'ready' && <Button title="Démarrer" size="lg" color={theme.timer[config.type]} onPress={start} />}

        {isActive && (
          <View style={styles.controls}>
            {showRoundCounter && status === 'running' && (
              <Pressable
                style={({ pressed }) => [styles.roundButton, { backgroundColor: soft }, pressed && { opacity: 0.7 }]}
                onPress={addRound}
              >
                <Text style={[styles.roundButtonText, { color: foreground }]}>+1 tour</Text>
              </Pressable>
            )}
            {working && segment.type === 'FOR_TIME' && status === 'running' && (
              <Button title="Terminé !" size="lg" variant="outline" color={foreground} onPress={completeForTime} />
            )}
            {working && phase.kind === 'work' && (config.type === 'EMOM' || config.type === 'TABATA') && (
              <Button
                title={failedRounds.includes(phase.round - 1) ? `↺ Tour ${phase.round} réussi finalement` : `✗ Tour ${phase.round} raté`}
                variant="outline"
                color={foreground}
                onPress={() => toggleFailedRound(phase.round - 1)}
              />
            )}
            {working && phase.kind === 'rest' && (
              <Button
                title="Passer le repos"
                variant="outline"
                color={foreground}
                onPress={() => skipTo(snapshot.phaseIndex + 1)}
              />
            )}
            <View style={styles.row}>
              {status === 'running' ? (
                <Button title="Pause" size="lg" color={foreground} onPress={pause} style={styles.flex} />
              ) : (
                <Button title="Reprendre" size="lg" color={foreground} onPress={resume} style={styles.flex} />
              )}
              {status === 'paused' && (
                <Button
                  title="Arrêter"
                  size="lg"
                  variant="outline"
                  color={foreground}
                  onPress={() => finish(inPrep ? -1 : segmentIndex)}
                  style={styles.flex}
                />
              )}
            </View>
          </View>
        )}

        {status === 'finished' && (
          <View style={styles.finishPanel}>
            {exerciseRef ? (
              <>
                <Text style={styles.finishTitle}>Bien joué ! 💪</Text>
                {!!result && <Text style={styles.finishText}>{result}</Text>}
                {failedRounds.length > 0 && (
                  <Text style={[styles.finishText, { color: theme.colors.danger }]}>
                    {plural(failedRounds.length, 'tour')} raté{failedRounds.length > 1 ? 's' : ''}
                  </Text>
                )}
                <Button
                  title="✓ Valider l'exercice"
                  size="lg"
                  color={theme.colors.success}
                  onPress={() => setIsSheetVisible(true)}
                />
                <Button
                  title="Ne pas valider"
                  variant="ghost"
                  color={theme.colors.textMuted}
                  onPress={() => navigation.goBack()}
                />
              </>
            ) : (
              <>
                {!!result && <Text style={styles.finishTitle}>{result}</Text>}
                <Button title="Recommencer" size="lg" onPress={start} />
                <Button title="Retour" variant="ghost" color={theme.colors.textMuted} onPress={() => navigation.goBack()} />
              </>
            )}
          </View>
        )}
      </ScrollView>
      {exerciseRef && exercise && (
        <ValidationSheet
          visible={isSheetVisible}
          exercise={exercise}
          initial={{ result, failedSets: failedRounds }}
          onSubmit={(log, saveAsRecord) =>
            validateExercise(exerciseRef, exercise, log, {
              saveAsRecord,
              replaceScreen: true,
              onDone: () => navigation.goBack(),
            })
          }
          onClose={() => setIsSheetVisible(false)}
        />
      )}
      {newRecordModal}
    </KeyboardAvoidingView>
  )
}

export default TimerRunScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fonts.medium,
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  segmentPill: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 5,
    marginTop: 10,
  },
  segmentText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    paddingVertical: 16,
  },
  phase: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  clock: {
    fontFamily: fonts.display,
    fontSize: 96,
    letterSpacing: -3,
    fontVariant: ['tabular-nums'],
    lineHeight: 108,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'baseline',
    minHeight: 26,
  },
  info: {
    fontFamily: fonts.displayMedium,
    fontSize: 20,
  },
  infoMuted: {
    fontFamily: fonts.medium,
    fontSize: 14,
    opacity: 0.7,
  },
  next: {
    fontFamily: fonts.medium,
    fontSize: 14,
    opacity: 0.75,
    marginTop: 6,
  },
  progress: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  details: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
  },
  detailsText: {
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  controls: {
    gap: 12,
  },
  loads: {
    marginTop: -8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  roundButton: {
    borderRadius: 24,
    paddingVertical: 26,
    alignItems: 'center',
  },
  roundButtonText: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.5,
  },
  finishPanel: {
    gap: 12,
  },
  finishText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  finishTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.text,
    textAlign: 'center',
  },
}))

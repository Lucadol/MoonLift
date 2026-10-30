import { useEffect, useState } from 'react'
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native'

import { onColor } from '../theme/palettes'
import { makeStyles, useTheme } from '../theme/ThemeContext'
import { Exercise, ExerciseLog, Outcome, SetLog } from '../types'
import { summarizeSets } from '../utils/records'
import { parseSetCount } from '../utils/timer'
import Button from './Button'

interface ValidationSheetProps {
  visible: boolean
  exercise: Exercise | null
  initial?: { result?: string; failedSets?: number[] } // pré-rempli depuis le timer
  onSubmit: (log: ExerciseLog, saveAsRecord: boolean) => void
  onUnvalidate?: () => void // exercice déjà validé : annuler la validation
  onClose: () => void
}

// Validation d'un exercice : réussi / échec, séries réussies ou ratées (avec correction), résultat, commentaire
const ValidationSheet = ({ visible, exercise, initial, onSubmit, onUnvalidate, onClose }: ValidationSheetProps) => {
  const theme = useTheme()
  const styles = useStyles()
  const [outcome, setOutcome] = useState<Outcome>('success')
  const [sets, setSets] = useState<SetLog[]>([])
  const [result, setResult] = useState('')
  const [comment, setComment] = useState('')
  const [saveAsRecord, setSaveAsRecord] = useState(false)

  const editing = !!exercise?.completed

  useEffect(() => {
    if (!visible || !exercise) return
    if (exercise.completed) {
      setOutcome(exercise.outcome ?? 'success')
      setSets(exercise.sets ?? [])
      setResult(exercise.result ?? '')
      setComment(exercise.comment ?? '')
    } else {
      const count = parseSetCount(`${exercise.name}\n${exercise.details}`, exercise.timer)
      const failed = new Set(initial?.failedSets ?? [])
      setSets(Array.from({ length: count }, (_, i) => ({ status: failed.has(i) ? 'fail' : 'success' })))
      setOutcome(count > 0 && failed.size === count ? 'fail' : 'success')
      setResult(initial?.result ?? '')
      setComment('')
    }
    setSaveAsRecord(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, exercise?.id])

  const updateSet = (index: number, patch: Partial<SetLog>) => {
    const next = sets.map((s, i) => (i === index ? { ...s, ...patch } : s))
    setSets(next)
    if (next.length > 0 && next.every(s => s.status === 'fail')) setOutcome('fail')
  }

  const toggleSet = (index: number) =>
    updateSet(index, sets[index].status === 'success' ? { status: 'fail' } : { status: 'success', note: undefined })

  const submit = () => {
    onSubmit({ outcome, result, comment, sets }, outcome === 'success' && saveAsRecord)
    onClose()
  }

  const failedSets = sets.map((s, i) => ({ ...s, index: i })).filter(s => s.status === 'fail')
  const outcomes: { value: Outcome; label: string; color: string }[] = [
    { value: 'success', label: '✓ Réussi', color: theme.colors.success },
    { value: 'fail', label: '✗ Échec', color: theme.colors.danger },
  ]

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.backdrop} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.sheet}>
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <View style={styles.flex}>
                <Text style={styles.eyebrow}>{editing ? 'Corriger la validation' : 'Valider l’exercice'}</Text>
                <Text style={styles.title}>{exercise?.name}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Fermer">
                <Text style={styles.close}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.outcomes}>
              {outcomes.map(o => {
                const selected = outcome === o.value
                return (
                  <Pressable
                    key={o.value}
                    onPress={() => setOutcome(o.value)}
                    accessibilityRole="button"
                    accessibilityState={{ selected }}
                    style={[styles.outcome, { borderColor: o.color }, selected && { backgroundColor: o.color }]}
                  >
                    <Text style={[styles.outcomeText, { color: selected ? onColor(o.color) : o.color }]}>{o.label}</Text>
                  </Pressable>
                )
              })}
            </View>

            <View style={styles.labelRow}>
              <Text style={[styles.label, styles.flex]}>
                Séries{sets.length ? ` · ${summarizeSets(sets)}` : ''}
              </Text>
              <Pressable
                onPress={() => setSets(sets.slice(0, -1))}
                disabled={sets.length === 0}
                hitSlop={8}
                accessibilityLabel="Retirer une série"
              >
                <Text style={[styles.stepper, sets.length === 0 && styles.disabled]}>−</Text>
              </Pressable>
              <Pressable
                onPress={() => sets.length < 30 && setSets([...sets, { status: 'success' }])}
                hitSlop={8}
                accessibilityLabel="Ajouter une série"
              >
                <Text style={styles.stepper}>+</Text>
              </Pressable>
            </View>
            {sets.length === 0 ? (
              <Text style={styles.hint}>Ajoute des séries pour noter celles réussies ou ratées.</Text>
            ) : (
              <>
                <View style={styles.sets}>
                  {sets.map((set, i) => {
                    const color = set.status === 'success' ? theme.colors.success : theme.colors.danger
                    return (
                      <Pressable
                        key={i}
                        onPress={() => toggleSet(i)}
                        accessibilityLabel={`Série ${i + 1} ${set.status === 'success' ? 'réussie' : 'ratée'}`}
                        style={[styles.set, { backgroundColor: color }]}
                      >
                        <Text style={[styles.setNumber, { color: onColor(color) }]}>{i + 1}</Text>
                        <Text style={[styles.setIcon, { color: onColor(color) }]}>{set.status === 'success' ? '✓' : '✗'}</Text>
                      </Pressable>
                    )
                  })}
                </View>
                <Text style={styles.hint}>Touche une série pour la marquer ratée ou réussie.</Text>
              </>
            )}
            {failedSets.map(set => (
              <View key={set.index} style={styles.correction}>
                <Text style={styles.correctionLabel}>Série {set.index + 1}</Text>
                <TextInput
                  style={[styles.input, styles.flex]}
                  value={set.note ?? ''}
                  onChangeText={note => updateSet(set.index, { note })}
                  placeholder="Correction : 3 reps, 95 kg…"
                  placeholderTextColor={theme.colors.textMuted}
                />
              </View>
            ))}

            <Text style={styles.label}>Résultat / score</Text>
            <TextInput
              style={styles.input}
              value={result}
              onChangeText={setResult}
              placeholder="ex : 5x5 @ 100 kg, 6 tours + 12, 4:32…"
              placeholderTextColor={theme.colors.textMuted}
            />

            <Text style={styles.label}>Commentaire</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={comment}
              onChangeText={setComment}
              placeholder="Sensations, technique, ce qu’il faudra ajuster…"
              placeholderTextColor={theme.colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            {outcome === 'success' && (
              <Pressable
                onPress={() => setSaveAsRecord(v => !v)}
                style={styles.checkRow}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: saveAsRecord }}
              >
                <View style={[styles.checkbox, saveAsRecord && { backgroundColor: theme.colors.tertiary, borderColor: theme.colors.tertiary }]}>
                  {saveAsRecord && <Text style={styles.checkMark}>✓</Text>}
                </View>
                <View style={styles.flex}>
                  <Text style={styles.checkTitle}>🏆 Enregistrer comme PR</Text>
                  <Text style={styles.hint}>Charge, EMOM réussi, temps, AMRAP… le formulaire sera pré-rempli.</Text>
                </View>
              </Pressable>
            )}

            <Button
              title={editing ? 'Enregistrer les corrections' : outcome === 'success' ? '✓ Valider' : 'Valider (échec)'}
              size="lg"
              color={outcome === 'success' ? theme.colors.success : theme.colors.danger}
              onPress={submit}
              style={styles.submit}
            />
            {editing && onUnvalidate && (
              <Button
                title="Annuler la validation"
                variant="ghost"
                color={theme.colors.danger}
                onPress={() => {
                  onUnvalidate()
                  onClose()
                }}
              />
            )}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default ValidationSheet

const useStyles = makeStyles(({ colors, fonts, mode }) => ({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: mode === 'light' ? 'rgba(43, 38, 34, 0.35)' : 'rgba(0, 0, 0, 0.6)',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '92%',
  },
  content: {
    padding: 22,
    paddingBottom: 36,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  flex: {
    flex: 1,
  },
  eyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.text,
  },
  close: {
    fontFamily: fonts.medium,
    fontSize: 20,
    color: colors.textMuted,
  },
  outcomes: {
    flexDirection: 'row',
    gap: 10,
  },
  outcome: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  outcomeText: {
    fontFamily: fonts.semibold,
    fontSize: 16,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
    marginTop: 20,
    marginBottom: 8,
  },
  label: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 20,
    marginBottom: 8,
  },
  stepper: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.text,
    paddingHorizontal: 4,
  },
  disabled: {
    opacity: 0.25,
  },
  sets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  set: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  setNumber: {
    fontFamily: fonts.display,
    fontSize: 15,
    lineHeight: 17,
  },
  setIcon: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 14,
  },
  hint: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.textMuted,
    marginTop: 6,
  },
  correction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 10,
  },
  correctionLabel: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.danger,
    width: 62,
  },
  input: {
    fontFamily: fonts.body,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  multiline: {
    minHeight: 80,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 20,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  checkMark: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: '#FFFDF8',
  },
  checkTitle: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  submit: {
    marginTop: 24,
  },
}))

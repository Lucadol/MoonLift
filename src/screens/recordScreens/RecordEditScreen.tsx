import { useMemo, useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Chip from '../../components/Chip'
import ScreenHeader from '../../components/ScreenHeader'
import { useCommonStyles } from '../../components/styles'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import { useStore } from '../../store/StoreContext'
import { RecordKind, RecordUnit } from '../../types'
import { confirmAction } from '../../utils/helpers'
import {
  Activity,
  activities,
  decodeRounds,
  distancePresets,
  encodeRounds,
  formatDistance,
  formatPace,
  groupRecords,
  isValidDate,
  kindOf,
  recordKinds,
  today,
  unitsByKind,
} from '../../utils/records'
import { formatClock, parseClock } from '../../utils/timer'

type RecordEditProps = StackScreenProps<RootStackParamList, 'RecordEdit'>

const repMaxOptions = ['1RM', '2RM', '3RM', '5RM', '10RM']

const unitLabels: Record<RecordUnit, string> = {
  kg: 'kg',
  lb: 'lb',
  reps: 'reps',
  time: 'temps',
  rounds: 'tours',
  m: 'mètres',
  cal: 'calories',
}

const movementLabels: Record<RecordKind, { label: string; placeholder: string }> = {
  load: { label: 'Mouvement', placeholder: 'ex : Back Squat, Clean & Jerk…' },
  emom: { label: 'Mouvement', placeholder: 'ex : Power Clean' },
  reps: { label: 'Mouvement', placeholder: 'ex : Strict Pull-ups, Double unders…' },
  time: { label: 'Benchmark', placeholder: 'ex : Fran, Murph, Grace…' },
  amrap: { label: 'WOD', placeholder: 'ex : Cindy' },
  run: { label: '', placeholder: '' },
  other: { label: 'Mouvement', placeholder: 'ex : Rameur 10 min, Assault bike…' },
}

const contextFields: Partial<Record<RecordKind, { label: string; placeholder: string }>> = {
  emom: { label: 'Format', placeholder: 'ex : EMOM 10 × 01:00 · 3 reps' },
  reps: { label: 'Précision (optionnel)', placeholder: 'ex : unbroken, en 1 min…' },
  amrap: { label: 'Format (optionnel)', placeholder: 'ex : AMRAP 20 min' },
  other: { label: 'Précision (optionnel)', placeholder: 'ex : en 10 min' },
}

const RecordEditScreen = ({ navigation, route }: RecordEditProps) => {
  const params = route.params
  const { records, saveRecord, deleteRecord } = useStore()
  const theme = useTheme()
  const { colors } = theme
  const common = useCommonStyles()
  const styles = useStyles()
  const existing = params.recordId ? records.find(r => r.id === params.recordId) : undefined
  const initial = existing ?? params

  const initialKind: RecordKind = existing ? kindOf(existing) : params.kind ?? (params.unit ? kindOf({ unit: params.unit }) : 'load')
  const initialUnit = initial.unit && unitsByKind[initialKind].includes(initial.unit) ? initial.unit : unitsByKind[initialKind][0]

  const [kind, setKind] = useState<RecordKind>(initialKind)
  const [movement, setMovement] = useState(initial.movement ?? '')
  const [activity, setActivity] = useState<Activity>(
    activities.includes(initial.movement as Activity) ? (initial.movement as Activity) : 'Course',
  )
  const [context, setContext] = useState(initial.context ?? (initialKind === 'load' ? '1RM' : ''))
  const [unit, setUnit] = useState<RecordUnit>(initialUnit)
  const [value, setValue] = useState(() => {
    if (initial.value === undefined) return ''
    if (initialUnit === 'time') return formatClock(initial.value)
    if (initialUnit === 'rounds') return `${decodeRounds(initial.value).rounds}`
    return `${initial.value}`
  })
  const [extraReps, setExtraReps] = useState(
    initial.value !== undefined && initialUnit === 'rounds' ? `${decodeRounds(initial.value).reps}` : '',
  )
  const [distanceKm, setDistanceKm] = useState(initial.distance ? `${initial.distance / 1000}` : '')
  const [date, setDate] = useState(existing?.date ?? today())
  const [notes, setNotes] = useState(initial.notes ?? '')

  const changeKind = (next: RecordKind) => {
    setKind(next)
    setUnit(unitsByKind[next][0])
    setValue('')
    setExtraReps('')
    setContext(next === 'load' ? '1RM' : '')
  }

  // Suggestions de mouvements déjà enregistrés
  const suggestions = useMemo(() => {
    const query = movement.trim().toLowerCase()
    if (!query || existing) return []
    return [...new Set(groupRecords(records).map(m => m.movement))]
      .filter(m => m.toLowerCase().includes(query) && m.toLowerCase() !== query)
      .slice(0, 4)
  }, [records, movement, existing])

  // Valeur saisie convertie dans l'unité du record
  const distance = kind === 'run' ? Math.round(parseFloat(distanceKm.replace(',', '.')) * 1000) : undefined
  let parsedValue: number | null = null
  if (unit === 'time') parsedValue = parseClock(value)
  else if (unit === 'rounds') {
    const rounds = parseInt(value, 10)
    parsedValue = isNaN(rounds) ? null : encodeRounds(rounds, parseInt(extraReps, 10) || 0)
  } else {
    const n = parseFloat(value.replace(',', '.'))
    parsedValue = isNaN(n) ? null : n
  }
  const finalMovement = kind === 'run' ? activity : movement.trim()
  const canSave =
    finalMovement !== '' &&
    parsedValue !== null &&
    parsedValue > 0 &&
    isValidDate(date) &&
    (kind !== 'run' || (!!distance && distance > 0))
  const pace = kind === 'run' && canSave && parsedValue ? formatPace({ movement: activity, value: parsedValue, distance }) : null

  const save = () => {
    if (!canSave || parsedValue === null) return
    saveRecord({
      id: params.recordId,
      movement: finalMovement,
      value: parsedValue,
      unit,
      kind,
      context: kind === 'run' && distance ? formatDistance(distance) : context.trim() || undefined,
      distance: kind === 'run' ? distance : undefined,
      date,
      notes: notes.trim(),
    })
    navigation.goBack()
  }

  const remove = () => {
    if (!params.recordId) return
    const recordId = params.recordId
    confirmAction('Supprimer ce PR ?', 'Cette entrée sera supprimée de ton historique.', () => {
      deleteRecord(recordId)
      navigation.goBack()
    })
  }

  const contextField = contextFields[kind]

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader
        eyebrow="Mes PR"
        title={existing ? 'Modifier le PR' : 'Nouveau PR'}
        pose={kind === 'run' ? 'run' : 'overhead'}
      />

      <Text style={[common.label, { marginTop: 0 }]}>Catégorie</Text>
      <View style={styles.chips}>
        {recordKinds.map(k => (
          <Chip key={k.value} label={k.label} color={colors.tertiary} selected={kind === k.value} onPress={() => changeKind(k.value)} />
        ))}
      </View>
      <Text style={styles.hint}>{recordKinds.find(k => k.value === kind)?.description}</Text>

      {kind === 'run' ? (
        <>
          <Text style={common.label}>Activité</Text>
          <View style={styles.chips}>
            {activities.map(a => (
              <Chip key={a} label={a} selected={activity === a} onPress={() => setActivity(a)} />
            ))}
          </View>
          <Text style={common.label}>Distance (km)</Text>
          <View style={styles.chips}>
            {distancePresets[activity].map(p => (
              <Chip
                key={p.label}
                label={p.label}
                selected={distance === p.meters}
                onPress={() => setDistanceKm(`${p.meters / 1000}`)}
              />
            ))}
          </View>
          <TextInput
            style={[common.input, { marginTop: 10 }]}
            value={distanceKm}
            onChangeText={setDistanceKm}
            placeholder="ex : 7,5"
            placeholderTextColor={colors.textMuted}
            keyboardType="decimal-pad"
          />
        </>
      ) : (
        <>
          <Text style={common.label}>{movementLabels[kind].label}</Text>
          <TextInput
            style={common.input}
            value={movement}
            onChangeText={setMovement}
            placeholder={movementLabels[kind].placeholder}
            placeholderTextColor={colors.textMuted}
          />
          {suggestions.length > 0 && (
            <View style={[styles.chips, { marginTop: 8 }]}>
              {suggestions.map(s => (
                <Chip key={s} label={s} onPress={() => setMovement(s)} />
              ))}
            </View>
          )}
        </>
      )}

      {kind === 'load' && (
        <>
          <Text style={common.label}>Répétitions</Text>
          <View style={styles.chips}>
            {repMaxOptions.map(rm => (
              <Chip key={rm} label={rm} color={colors.tertiary} selected={context === rm} onPress={() => setContext(rm)} />
            ))}
          </View>
        </>
      )}

      {contextField && (
        <>
          <Text style={common.label}>{contextField.label}</Text>
          <TextInput
            style={common.input}
            value={context}
            onChangeText={setContext}
            placeholder={contextField.placeholder}
            placeholderTextColor={colors.textMuted}
          />
        </>
      )}

      {unitsByKind[kind].length > 1 && (
        <>
          <Text style={common.label}>Unité</Text>
          <View style={styles.chips}>
            {unitsByKind[kind].map(u => (
              <Chip
                key={u}
                label={unitLabels[u]}
                color={colors.tertiary}
                selected={unit === u}
                onPress={() => {
                  setUnit(u)
                  setValue('')
                }}
              />
            ))}
          </View>
        </>
      )}

      {unit === 'rounds' ? (
        <View style={styles.row}>
          <View style={styles.flex}>
            <Text style={common.label}>Tours</Text>
            <TextInput
              style={common.input}
              value={value}
              onChangeText={setValue}
              placeholder="ex : 6"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.flex}>
            <Text style={common.label}>+ Reps</Text>
            <TextInput
              style={common.input}
              value={extraReps}
              onChangeText={setExtraReps}
              placeholder="ex : 12"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
            />
          </View>
        </View>
      ) : (
        <>
          <Text style={common.label}>
            {unit === 'time' ? (kind === 'run' ? 'Temps (h:mm:ss ou mm:ss)' : 'Temps (mm:ss)') : `Valeur (${unitLabels[unit]})`}
          </Text>
          <TextInput
            style={common.input}
            value={value}
            onChangeText={setValue}
            placeholder={unit === 'time' ? (kind === 'run' ? 'ex : 24:35' : 'ex : 3:45') : 'ex : 100'}
            placeholderTextColor={colors.textMuted}
            keyboardType={unit === 'time' ? 'numbers-and-punctuation' : 'decimal-pad'}
          />
        </>
      )}
      {unit === 'time' && (
        <Text style={styles.hint}>
          {pace ? `Allure : ${pace}` : 'Pour un temps, le meilleur PR est le plus court.'}
        </Text>
      )}

      <Text style={common.label}>Date (AAAA-MM-JJ)</Text>
      <TextInput
        style={[common.input, !isValidDate(date) && styles.invalid]}
        value={date}
        onChangeText={setDate}
        placeholder="AAAA-MM-JJ"
        placeholderTextColor={colors.textMuted}
        keyboardType="numbers-and-punctuation"
      />

      <Text style={common.label}>Notes</Text>
      <TextInput
        style={[common.input, styles.multiline]}
        value={notes}
        onChangeText={setNotes}
        placeholder="ex : avec ceinture, Rx, sensations…"
        placeholderTextColor={colors.textMuted}
        multiline
        textAlignVertical="top"
      />

      <Button
        title="Enregistrer"
        size="lg"
        color={colors.tertiary}
        onPress={save}
        disabled={!canSave}
        style={{ marginTop: 24 }}
      />
      {existing && (
        <Button title="Supprimer" variant="ghost" color={colors.danger} onPress={remove} style={{ marginTop: 6 }} />
      )}
    </ScrollView>
  )
}

export default RecordEditScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex: {
    flex: 1,
  },
  hint: {
    fontFamily: fonts.body,
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 6,
  },
  invalid: {
    borderColor: colors.danger,
  },
  multiline: {
    minHeight: 80,
  },
}))

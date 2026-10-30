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
import { RecordUnit } from '../../types'
import { confirmAction } from '../../utils/helpers'
import { groupRecords, isValidDate, movementKey, recordUnits, today } from '../../utils/records'
import { formatClock, parseClock } from '../../utils/timer'

type RecordEditProps = StackScreenProps<RootStackParamList, 'RecordEdit'>

const RecordEditScreen = ({ navigation, route }: RecordEditProps) => {
  const { recordId, movement: initialMovement } = route.params
  const { records, saveRecord, deleteRecord } = useStore()
  const theme = useTheme()
  const { colors } = theme
  const common = useCommonStyles()
  const styles = useStyles()
  const existing = recordId ? records.find(r => r.id === recordId) : undefined

  // Reprend l'unité déjà utilisée pour ce mouvement
  const previousUnit = initialMovement
    ? groupRecords(records).find(m => m.key === movementKey(initialMovement))?.history[0].unit
    : undefined

  const [movement, setMovement] = useState(existing?.movement ?? initialMovement ?? '')
  const [unit, setUnit] = useState<RecordUnit>(existing?.unit ?? previousUnit ?? 'kg')
  const [value, setValue] = useState(
    existing ? (existing.unit === 'time' ? formatClock(existing.value) : `${existing.value}`) : '',
  )
  const [date, setDate] = useState(existing?.date ?? today())
  const [notes, setNotes] = useState(existing?.notes ?? '')

  // Suggestions de mouvements déjà enregistrés
  const suggestions = useMemo(() => {
    const query = movement.trim().toLowerCase()
    if (!query || existing) return []
    return groupRecords(records)
      .map(m => m.movement)
      .filter(m => m.toLowerCase().includes(query) && m.toLowerCase() !== query)
      .slice(0, 4)
  }, [records, movement, existing])

  const parsedValue = unit === 'time' ? parseClock(value) : parseFloat(value.replace(',', '.'))
  const isValueValid = parsedValue !== null && !isNaN(parsedValue) && parsedValue > 0
  const canSave = movement.trim() !== '' && isValueValid && isValidDate(date)

  const save = () => {
    if (!canSave || parsedValue === null) return
    saveRecord({ id: recordId, movement: movement.trim(), value: parsedValue, unit, date, notes: notes.trim() })
    navigation.goBack()
  }

  const remove = () => {
    if (!recordId) return
    confirmAction('Supprimer ce PR ?', 'Cette entrée sera supprimée de ton historique.', () => {
      deleteRecord(recordId)
      navigation.goBack()
    })
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="Mes PR" title={existing ? 'Modifier le PR' : 'Nouveau PR'} pose="overhead" />

      <Text style={[common.label, { marginTop: 0 }]}>Mouvement</Text>
      <TextInput
        style={common.input}
        value={movement}
        onChangeText={setMovement}
        placeholder="ex : Back Squat, Fran, Strict Pull-ups…"
        placeholderTextColor={colors.textMuted}
      />
      {suggestions.length > 0 && (
        <View style={styles.suggestions}>
          {suggestions.map(s => (
            <Chip key={s} label={s} onPress={() => setMovement(s)} />
          ))}
        </View>
      )}

      <Text style={common.label}>Unité</Text>
      <View style={styles.units}>
        {recordUnits.map(u => (
          <Chip
            key={u.value}
            label={u.label}
            color={colors.tertiary}
            selected={unit === u.value}
            onPress={() => {
              setUnit(u.value)
              setValue('')
            }}
          />
        ))}
      </View>

      <Text style={common.label}>{unit === 'time' ? 'Temps (mm:ss)' : 'Valeur'}</Text>
      <TextInput
        style={common.input}
        value={value}
        onChangeText={setValue}
        placeholder={unit === 'time' ? 'ex : 3:45' : 'ex : 100'}
        placeholderTextColor={colors.textMuted}
        keyboardType={unit === 'time' ? 'numbers-and-punctuation' : 'decimal-pad'}
      />
      {unit === 'time' && <Text style={styles.hint}>Pour un temps, le meilleur PR est le plus court.</Text>}

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
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  units: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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

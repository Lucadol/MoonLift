import { useMemo, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import { common } from '../../components/styles'
import { colors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'
import { formatRecordValue, groupRecords } from '../../utils/records'

type RecordsProps = StackScreenProps<RootStackParamList, 'Records'>

const RecordsScreen = ({ navigation }: RecordsProps) => {
  const { records } = useStore()
  const [search, setSearch] = useState('')

  const movements = useMemo(() => groupRecords(records), [records])
  const filtered = movements.filter(m => m.movement.toLowerCase().includes(search.trim().toLowerCase()))

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <Text style={common.title}>Mes PR</Text>

      {movements.length > 3 && (
        <TextInput
          style={[common.input, { marginBottom: 16 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un mouvement…"
          placeholderTextColor={colors.textMuted}
        />
      )}

      {movements.length === 0 && (
        <Text style={common.empty}>
          Aucun record enregistré.{'\n'}Ajoute tes PR (1RM, benchmarks, max reps…) pour suivre ta progression.
        </Text>
      )}

      {filtered.map(summary => (
        <Pressable
          key={summary.key}
          style={[common.card, styles.card]}
          onPress={() => navigation.navigate('RecordDetail', { movementKey: summary.key })}
        >
          <View style={styles.cardBody}>
            <Text style={common.cardTitle}>{summary.movement}</Text>
            <Text style={common.cardText}>
              {summary.best.date} · {summary.history.length} entrée{summary.history.length > 1 ? 's' : ''}
            </Text>
          </View>
          <Text style={styles.best}>{formatRecordValue(summary.best)}</Text>
        </Pressable>
      ))}

      <Button
        title="+ Ajouter un PR"
        color={colors.orange}
        onPress={() => navigation.navigate('RecordEdit', {})}
        style={{ marginTop: 10 }}
      />
    </ScrollView>
  )
}

export default RecordsScreen

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  best: {
    color: colors.orange,
    fontSize: 22,
    fontWeight: 'bold',
    fontVariant: ['tabular-nums'],
  },
})

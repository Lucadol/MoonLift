import { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import { common } from '../../components/styles'
import { colors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'
import { formatRecordValue, groupRecords } from '../../utils/records'

type RecordDetailProps = StackScreenProps<RootStackParamList, 'RecordDetail'>

const RecordDetailScreen = ({ navigation, route }: RecordDetailProps) => {
  const { movementKey } = route.params
  const { records } = useStore()

  const summary = useMemo(() => groupRecords(records).find(m => m.key === movementKey), [records, movementKey])
  if (!summary) {
    return (
      <View style={common.screen}>
        <Text style={common.empty}>Aucun record pour ce mouvement.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <Text style={common.title}>{summary.movement}</Text>

      <View style={[common.card, styles.bestCard]}>
        <Text style={styles.bestLabel}>MEILLEUR RECORD</Text>
        <Text style={styles.bestValue}>{formatRecordValue(summary.best)}</Text>
        <Text style={common.cardText}>{summary.best.date}</Text>
      </View>

      <Text style={common.label}>Historique</Text>
      {summary.history.map(record => {
        const isBest = record.id === summary.best.id
        return (
          <Pressable
            key={record.id}
            style={[common.card, styles.row]}
            onPress={() => navigation.navigate('RecordEdit', { recordId: record.id })}
          >
            <View style={styles.rowBody}>
              <Text style={common.cardTitle}>
                {formatRecordValue(record)} {isBest && <Text style={styles.star}>★</Text>}
              </Text>
              <Text style={common.cardText}>{record.date}</Text>
              {!!record.notes && <Text style={styles.notes}>{record.notes}</Text>}
            </View>
            <Text style={common.link}>Modifier</Text>
          </Pressable>
        )
      })}

      <Button
        title="+ Nouvelle entrée"
        color={colors.orange}
        onPress={() => navigation.navigate('RecordEdit', { movement: summary.movement })}
        style={{ marginTop: 10 }}
      />
    </ScrollView>
  )
}

export default RecordDetailScreen

const styles = StyleSheet.create({
  bestCard: {
    alignItems: 'center',
    paddingVertical: 24,
    borderWidth: 2,
    borderColor: colors.orange,
  },
  bestLabel: {
    color: colors.orange,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  bestValue: {
    color: colors.text,
    fontSize: 44,
    fontWeight: 'bold',
    marginVertical: 4,
    fontVariant: ['tabular-nums'],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowBody: {
    flex: 1,
  },
  star: {
    color: colors.orange,
  },
  notes: {
    color: colors.text,
    fontSize: 15,
    marginTop: 6,
  },
})

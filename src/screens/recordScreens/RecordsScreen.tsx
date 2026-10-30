import { useMemo, useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import Mascot from '../../components/mascot/Mascot'
import ScreenHeader from '../../components/ScreenHeader'
import { useCommonStyles } from '../../components/styles'
import { useStore } from '../../store/StoreContext'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import Chip from '../../components/Chip'
import { RecordKind } from '../../types'
import { formatPace, formatRecordValue, groupRecords, recordKinds, summaryLabel } from '../../utils/records'

type RecordsProps = StackScreenProps<RootStackParamList, 'Records'>

const RecordsScreen = ({ navigation }: RecordsProps) => {
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
  const { records } = useStore()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<RecordKind | 'all'>('all')

  const movements = useMemo(() => groupRecords(records), [records])
  const usedKinds = recordKinds.filter(k => movements.some(m => m.kind === k.value))
  const filtered = movements.filter(
    m =>
      (filter === 'all' || m.kind === filter) &&
      `${m.movement} ${m.context ?? ''}`.toLowerCase().includes(search.trim().toLowerCase()),
  )

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader eyebrow="Records personnels" title="Mes PR" subtitle="Chaque kilo compte" pose="trophy" />

      {movements.length > 3 && (
        <TextInput
          style={[common.input, { marginBottom: 14 }]}
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un mouvement…"
          placeholderTextColor={theme.colors.textMuted}
        />
      )}

      {usedKinds.length > 1 && (
        <View style={styles.filters}>
          <Chip label="Tout" selected={filter === 'all'} onPress={() => setFilter('all')} />
          {usedKinds.map(k => (
            <Chip key={k.value} label={k.label} selected={filter === k.value} onPress={() => setFilter(k.value)} />
          ))}
        </View>
      )}

      {movements.length === 0 && (
        <Card style={styles.card}>
          <Mascot pose="sleep" size={84} />
          <View style={styles.cardBody}>
            <Text style={common.cardTitle}>Aucun record pour l’instant</Text>
            <Text style={common.cardText}>
              Moony fait la sieste. Réveille-le avec ton premier PR (1RM, benchmark, max reps…).
            </Text>
          </View>
        </Card>
      )}

      {filtered.map(summary => (
        <Card
          key={summary.key}
          onPress={() => navigation.navigate('RecordDetail', { groupKey: summary.key })}
          style={styles.card}
        >
          <View style={styles.cardBody}>
            <Text style={common.cardTitle}>{summary.movement}</Text>
            <Text style={common.cardText}>{summaryLabel(summary)}</Text>
            <Text style={styles.date}>
              {summary.best.date} · {summary.history.length} entrée{summary.history.length > 1 ? 's' : ''}
            </Text>
          </View>
          <View style={styles.values}>
            <Text style={styles.best}>{formatRecordValue(summary.best)}</Text>
            {summary.kind === 'run' && <Text style={styles.date}>{formatPace(summary.best)}</Text>}
          </View>
        </Card>
      ))}

      <Button
        title="+ Ajouter un PR"
        color={theme.colors.tertiary}
        onPress={() => navigation.navigate('RecordEdit', {})}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  )
}

export default RecordsScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardBody: {
    flex: 1,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  date: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  values: {
    alignItems: 'flex-end',
  },
  best: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 22,
    letterSpacing: -0.5,
    fontVariant: ['tabular-nums'],
  },
}))

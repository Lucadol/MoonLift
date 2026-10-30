import { useMemo } from 'react'
import { ScrollView, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import Mascot from '../../components/mascot/Mascot'
import ProgressChart from '../../components/ProgressChart'
import { useCommonStyles } from '../../components/styles'
import { useStore } from '../../store/StoreContext'
import { onColor } from '../../theme/palettes'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import { formatRecordValue, groupRecords } from '../../utils/records'

type RecordDetailProps = StackScreenProps<RootStackParamList, 'RecordDetail'>

const percentages = [50, 55, 60, 65, 70, 75, 80, 85, 90, 95]

const RecordDetailScreen = ({ navigation, route }: RecordDetailProps) => {
  const { movementKey } = route.params
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
  const { records } = useStore()

  const summary = useMemo(() => groupRecords(records).find(m => m.key === movementKey), [records, movementKey])
  if (!summary) {
    return (
      <View style={[common.screen, common.content]}>
        <Text style={common.subtitle}>Aucun record pour ce mouvement.</Text>
      </View>
    )
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <Text style={common.eyebrow}>Mouvement</Text>
      <Text style={[common.title, { marginBottom: 18 }]}>{summary.movement}</Text>

      <View style={styles.bestCard}>
        <View style={styles.bestText}>
          <Text style={styles.bestLabel}>Meilleur record</Text>
          <Text style={styles.bestValue}>{formatRecordValue(summary.best)}</Text>
          <Text style={styles.bestDate}>{summary.best.date}</Text>
        </View>
        <Mascot pose="flex" size={110} onBackground={theme.colors.tertiary} />
      </View>

      {summary.history.filter(r => r.unit === summary.best.unit).length > 1 && (
        <>
          <Text style={common.sectionTitle}>Progression</Text>
          <Card>
            <ProgressChart records={summary.history.filter(r => r.unit === summary.best.unit)} />
          </Card>
        </>
      )}

      {(summary.best.unit === 'kg' || summary.best.unit === 'lb') && (
        <>
          <Text style={common.sectionTitle}>Charges de travail</Text>
          <Card style={styles.percentGrid}>
            {percentages.map(pct => {
              const step = summary.best.unit === 'kg' ? 0.5 : 1
              const load = Math.round((summary.best.value * pct) / 100 / step) * step
              return (
                <View key={pct} style={styles.percentCell}>
                  <Text style={styles.percentLabel}>{pct} %</Text>
                  <Text style={styles.percentValue}>
                    {load} {summary.best.unit}
                  </Text>
                </View>
              )
            })}
          </Card>
        </>
      )}

      <Text style={common.sectionTitle}>Historique</Text>
      {summary.history.map(record => {
        const isBest = record.id === summary.best.id
        return (
          <Card
            key={record.id}
            onPress={() => navigation.navigate('RecordEdit', { recordId: record.id })}
            style={styles.row}
          >
            <View style={styles.rowBody}>
              <Text style={common.cardTitle}>
                {formatRecordValue(record)}
                {isBest ? '  ★' : ''}
              </Text>
              <Text style={common.cardText}>{record.date}</Text>
              {!!record.notes && <Text style={[common.body, { marginTop: 6 }]}>{record.notes}</Text>}
            </View>
            <Text style={common.link}>Modifier</Text>
          </Card>
        )
      })}

      <Button
        title="+ Nouvelle entrée"
        color={theme.colors.tertiary}
        onPress={() => navigation.navigate('RecordEdit', { movement: summary.movement })}
        style={{ marginTop: 8 }}
      />
    </ScrollView>
  )
}

export default RecordDetailScreen

const useStyles = makeStyles(({ colors, fonts }) => {
  const fg = onColor(colors.tertiary)
  return {
    bestCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.tertiary,
      borderRadius: 24,
      paddingVertical: 18,
      paddingLeft: 22,
      paddingRight: 10,
    },
    bestText: {
      flex: 1,
    },
    bestLabel: {
      fontFamily: fonts.semibold,
      fontSize: 12,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: fg,
      opacity: 0.8,
    },
    bestValue: {
      fontFamily: fonts.display,
      color: fg,
      fontSize: 42,
      letterSpacing: -1.5,
      marginVertical: 2,
      fontVariant: ['tabular-nums'],
    },
    bestDate: {
      fontFamily: fonts.medium,
      fontSize: 14,
      color: fg,
      opacity: 0.8,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    rowBody: {
      flex: 1,
    },
    percentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingVertical: 10,
    },
    percentCell: {
      width: '50%',
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 7,
      paddingHorizontal: 8,
    },
    percentLabel: {
      fontFamily: fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
    },
    percentValue: {
      fontFamily: fonts.display,
      fontSize: 15,
      color: colors.text,
      fontVariant: ['tabular-nums'],
    },
  }
})

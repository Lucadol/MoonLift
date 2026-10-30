import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

import Card from '../components/Card'
import ScreenHeader from '../components/ScreenHeader'
import { useCommonStyles } from '../components/styles'
import { useStore } from '../store/StoreContext'
import { onColor } from '../theme/palettes'
import { makeStyles, useTheme } from '../theme/ThemeContext'
import { confirmAction } from '../utils/helpers'
import { dayKey, formatDayTitle, groupByDay, monthGrid, monthNames, weekStreak } from '../utils/history'

const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

const HistoryScreen = () => {
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
  const { history, deleteHistoryEntry } = useStore()

  const days = useMemo(() => groupByDay(history), [history])
  const todayKey = dayKey(new Date())
  const lastActiveDay = useMemo(() => [...days.keys()].sort().pop(), [days])
  const [month, setMonth] = useState(() => {
    const now = new Date()
    return { year: now.getFullYear(), month: now.getMonth() }
  })
  const [selected, setSelected] = useState<string | undefined>(undefined)
  const selectedDay = selected ?? (days.has(todayKey) ? todayKey : lastActiveDay)

  const streak = weekStreak(history)
  const monthPrefix = `${month.year}-${month.month < 9 ? '0' : ''}${month.month + 1}`
  const activeDaysInMonth = [...days.keys()].filter(k => k.startsWith(monthPrefix)).length
  const cells = monthGrid(month.year, month.month)
  const entries = (selectedDay ? days.get(selectedDay) ?? [] : []).slice().sort((a, b) => b.date.localeCompare(a.date))

  const changeMonth = (delta: number) =>
    setMonth(({ year, month: m }) => {
      const date = new Date(year, m + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })

  const stats = [
    { label: 'semaine' + (streak > 1 ? 's' : '') + ' d’affilée', value: `${streak}`, emoji: '🔥' },
    { label: `jour${activeDaysInMonth > 1 ? 's' : ''} actif${activeDaysInMonth > 1 ? 's' : ''} ce mois`, value: `${activeDaysInMonth}` },
    { label: 'exercices et timers', value: `${history.length}` },
  ]

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow="Suivi" title="Historique" subtitle="Tout ce que tu as déjà dans les jambes" pose="run" />

      <View style={styles.stats}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.stat}>
            <Text style={styles.statValue}>
              {stat.value}
              {stat.emoji && streak > 0 ? ` ${stat.emoji}` : ''}
            </Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <Card>
        <View style={styles.monthHeader}>
          <Pressable onPress={() => changeMonth(-1)} hitSlop={10} accessibilityLabel="Mois précédent">
            <Text style={styles.arrow}>‹</Text>
          </Pressable>
          <Text style={styles.monthTitle}>
            {monthNames[month.month]} {month.year}
          </Text>
          <Pressable onPress={() => changeMonth(1)} hitSlop={10} accessibilityLabel="Mois suivant">
            <Text style={styles.arrow}>›</Text>
          </Pressable>
        </View>
        <View style={styles.grid}>
          {weekdays.map((d, i) => (
            <Text key={i} style={styles.weekday}>
              {d}
            </Text>
          ))}
          {cells.map((date, i) => {
            if (!date) return <View key={i} style={styles.cell} />
            const key = dayKey(date)
            const active = days.has(key)
            const isSelected = key === selectedDay
            return (
              <Pressable key={i} style={styles.cell} onPress={() => setSelected(key)} accessibilityLabel={formatDayTitle(key)}>
                <View
                  style={[
                    styles.day,
                    active && { backgroundColor: theme.colors.primary },
                    key === todayKey && !active && styles.today,
                    isSelected && styles.selected,
                  ]}
                >
                  <Text style={[styles.dayText, active && { color: onColor(theme.colors.primary) }]}>{date.getDate()}</Text>
                </View>
              </Pressable>
            )
          })}
        </View>
      </Card>

      {selectedDay ? (
        <>
          <Text style={common.sectionTitle}>{formatDayTitle(selectedDay)}</Text>
          {entries.length === 0 && <Text style={common.subtitle}>Jour de repos. Ça compte aussi 😌</Text>}
          {entries.map(entry => (
            <Card
              key={entry.id}
              accent={
                entry.kind === 'timer'
                  ? theme.colors.quaternary
                  : entry.outcome === 'fail'
                    ? theme.colors.danger
                    : theme.colors.success
              }
              style={styles.entry}
            >
              <View style={styles.entryHeader}>
                <Text style={[common.cardTitle, styles.flex]}>{entry.title}</Text>
                <Text style={styles.time}>
                  {new Date(entry.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {entry.subtitle && <Text style={common.cardText}>{entry.subtitle}</Text>}
              {(entry.outcome || entry.result) && (
                <Text style={[styles.result, entry.outcome === 'fail' && { color: theme.colors.danger }]}>
                  {[entry.outcome === 'fail' ? '✗ Échec' : entry.outcome === 'success' ? '✓ Réussi' : null, entry.result]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
              )}
              {entry.sets && <Text style={common.cardText}>{entry.sets}</Text>}
              {entry.comment && <Text style={styles.comment}>💬 {entry.comment}</Text>}
              <Pressable
                onPress={() =>
                  confirmAction('Supprimer de l’historique ?', `« ${entry.title} » sera retiré de l’historique.`, () =>
                    deleteHistoryEntry(entry.id),
                  )
                }
                hitSlop={8}
                style={styles.delete}
              >
                <Text style={common.linkMuted}>Supprimer</Text>
              </Pressable>
            </Card>
          ))}
        </>
      ) : (
        <Card>
          <Text style={common.cardTitle}>Rien pour l’instant</Text>
          <Text style={common.cardText}>
            Valide un exercice de ton programme ou termine un timer : il apparaîtra ici.
          </Text>
        </Card>
      )}
    </ScrollView>
  )
}

export default HistoryScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  stats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 12,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 26,
    letterSpacing: -0.8,
    color: colors.text,
  },
  statLabel: {
    fontFamily: fonts.medium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.textMuted,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  monthTitle: {
    fontFamily: fonts.displayMedium,
    fontSize: 17,
    color: colors.text,
  },
  arrow: {
    fontFamily: fonts.body,
    fontSize: 28,
    color: colors.text,
    paddingHorizontal: 8,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  weekday: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontFamily: fonts.semibold,
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: 6,
  },
  cell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 3,
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  today: {
    borderWidth: 1.5,
    borderColor: colors.textMuted,
  },
  selected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  dayText: {
    fontFamily: fonts.medium,
    fontSize: 14,
    color: colors.text,
  },
  entry: {
    paddingLeft: 22,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
  },
  flex: {
    flex: 1,
  },
  time: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
  result: {
    fontFamily: fonts.semibold,
    fontSize: 14,
    color: colors.success,
    marginTop: 6,
  },
  comment: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    color: colors.text,
    marginTop: 6,
  },
  delete: {
    alignSelf: 'flex-end',
    marginTop: 6,
  },
}))

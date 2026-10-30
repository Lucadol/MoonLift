import { Pressable, Text, View } from 'react-native'

import { makeStyles, useTheme } from '../theme/ThemeContext'
import { MixSegment, TimerConfig } from '../types'
import { buildPhases, defaultSegment, formatClock, segmentTypes, timerLabels, totalDurationSec } from '../utils/timer'
import Chip from './Chip'
import Stepper from './Stepper'

interface TimerConfigFormProps {
  config: TimerConfig
  onChange: (config: TimerConfig) => void
}

// Réglages d'un timer simple ou d'un bloc de MIX
const SegmentFields = <T extends MixSegment>({ segment, onChange }: { segment: T; onChange: (s: T) => void }) => {
  const s = segment as MixSegment
  const update = (patch: Partial<MixSegment>) => onChange({ ...segment, ...patch } as T)
  switch (s.type) {
    case 'AMRAP':
    case 'REST':
      return (
        <Stepper
          label="Durée"
          value={s.durationSec}
          onChange={durationSec => update({ durationSec })}
          min={s.type === 'REST' ? 15 : 60}
          max={90 * 60}
          step={s.type === 'REST' ? 15 : 60}
          format={formatClock}
        />
      )
    case 'FOR_TIME':
      return (
        <Stepper
          label="Time cap"
          value={s.capSec}
          onChange={capSec => update({ capSec })}
          min={60}
          max={90 * 60}
          step={60}
          format={formatClock}
        />
      )
    case 'EMOM':
      return (
        <>
          <Stepper
            label="Toutes les"
            value={s.intervalSec}
            onChange={intervalSec => update({ intervalSec })}
            min={15}
            max={10 * 60}
            step={15}
            format={formatClock}
          />
          <Stepper label="Tours" value={s.rounds} onChange={rounds => update({ rounds })} min={1} max={60} step={1} />
        </>
      )
    case 'TABATA':
      return (
        <>
          <Stepper
            label="Travail"
            value={s.workSec}
            onChange={workSec => update({ workSec })}
            min={5}
            max={10 * 60}
            step={5}
            format={formatClock}
          />
          <Stepper
            label="Repos"
            value={s.restSec}
            onChange={restSec => update({ restSec })}
            min={0}
            max={10 * 60}
            step={5}
            format={formatClock}
          />
          <Stepper label="Tours" value={s.rounds} onChange={rounds => update({ rounds })} min={1} max={50} step={1} />
        </>
      )
  }
}

const MixEditor = ({ segments, onChange }: { segments: MixSegment[]; onChange: (segments: MixSegment[]) => void }) => {
  const theme = useTheme()
  const styles = useStyles()

  const replace = (index: number, segment: MixSegment) =>
    onChange(segments.map((s, i) => (i === index ? segment : s)))
  const move = (index: number, direction: -1 | 1) => {
    const next = [...segments]
    ;[next[index], next[index + direction]] = [next[index + direction], next[index]]
    onChange(next)
  }

  return (
    <View>
      {segments.map((segment, index) => (
        <View key={index} style={styles.block}>
          <View style={styles.blockHeader}>
            <View style={[styles.dot, { backgroundColor: theme.timer[segment.type] }]} />
            <Text style={styles.blockTitle}>
              Bloc {index + 1} · {timerLabels[segment.type]}
            </Text>
            <Pressable onPress={() => move(index, -1)} disabled={index === 0} hitSlop={6} accessibilityLabel="Monter le bloc">
              <Text style={[styles.icon, index === 0 && styles.iconDisabled]}>↑</Text>
            </Pressable>
            <Pressable
              onPress={() => move(index, 1)}
              disabled={index === segments.length - 1}
              hitSlop={6}
              accessibilityLabel="Descendre le bloc"
            >
              <Text style={[styles.icon, index === segments.length - 1 && styles.iconDisabled]}>↓</Text>
            </Pressable>
            <Pressable
              onPress={() => onChange(segments.filter((_, i) => i !== index))}
              disabled={segments.length === 1}
              hitSlop={6}
              accessibilityLabel="Supprimer le bloc"
            >
              <Text style={[styles.icon, segments.length === 1 && styles.iconDisabled]}>✕</Text>
            </Pressable>
          </View>
          <SegmentFields segment={segment} onChange={s => replace(index, s)} />
        </View>
      ))}
      <Text style={styles.addLabel}>Ajouter un bloc</Text>
      <View style={styles.chips}>
        {segmentTypes.map(type => (
          <Chip
            key={type}
            label={`+ ${timerLabels[type]}`}
            onPress={() => onChange([...segments, defaultSegment(type)])}
          />
        ))}
      </View>
    </View>
  )
}

const TimerConfigForm = ({ config, onChange }: TimerConfigFormProps) => {
  const styles = useStyles()
  const total = totalDurationSec(buildPhases(config))
  const hasForTime = config.type === 'MIX' ? config.segments.some(s => s.type === 'FOR_TIME') : config.type === 'FOR_TIME'

  return (
    <View>
      {config.type === 'MIX' ? (
        <MixEditor segments={config.segments} onChange={segments => onChange({ ...config, segments })} />
      ) : (
        <SegmentFields segment={config} onChange={onChange} />
      )}
      <Text style={styles.total}>
        {hasForTime ? 'Durée maximale' : 'Durée totale'} · {formatClock(total)}
      </Text>
    </View>
  )
}

export default TimerConfigForm

const useStyles = makeStyles(({ colors, fonts }) => ({
  total: {
    fontFamily: fonts.medium,
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 10,
    textAlign: 'right',
  },
  block: {
    backgroundColor: colors.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 2,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: -6,
  },
  blockTitle: {
    flex: 1,
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.text,
  },
  icon: {
    fontFamily: fonts.medium,
    fontSize: 17,
    color: colors.text,
  },
  iconDisabled: {
    opacity: 0.2,
  },
  addLabel: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 6,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
}))

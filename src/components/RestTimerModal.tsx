import { useEffect, useRef, useState } from 'react'
import { Modal, Pressable, Text, View } from 'react-native'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'

import { makeStyles, useTheme } from '../theme/ThemeContext'
import { formatClock } from '../utils/timer'
import { useBeeps } from '../utils/useBeeps'
import { useVoice } from '../utils/useVoice'
import Button from './Button'
import Chip from './Chip'
import Mascot from './mascot/Mascot'

interface RestTimerModalProps {
  visible: boolean
  exerciseName: string
  defaultSec: number
  onClose: () => void
}

const presets = [60, 90, 120, 180]

// Minuteur de repos entre les séries, lancé depuis un exercice de la séance
const RestTimerModal = ({ visible, exerciseName, defaultSec, onClose }: RestTimerModalProps) => {
  const theme = useTheme()
  const styles = useStyles()
  const beep = useBeeps()
  const speak = useVoice()
  const [duration, setDuration] = useState(defaultSec)
  const [endsAt, setEndsAt] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [set, setSet] = useState(1) // numéro de la série à venir
  const lastSecond = useRef(-1)

  useEffect(() => {
    if (visible) {
      setDuration(defaultSec)
      setEndsAt(null)
      setSet(1)
    }
  }, [visible, defaultSec])

  const running = endsAt !== null
  const remainingSec = running ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : duration

  useEffect(() => {
    if (!running) return
    activateKeepAwakeAsync('rest').catch(() => {})
    const interval = setInterval(() => setNow(Date.now()), 200)
    return () => {
      clearInterval(interval)
      deactivateKeepAwake('rest').catch(() => {})
    }
  }, [running])

  // Bips des 3 dernières secondes, puis fin du repos
  useEffect(() => {
    if (!running || remainingSec === lastSecond.current) return
    lastSecond.current = remainingSec
    if (remainingSec === 0) {
      beep('long')
      speak(`Série ${set + 1}, c'est reparti !`)
      setEndsAt(null)
      setSet(s => s + 1)
    } else if (remainingSec <= 3) {
      beep('short')
    }
  }, [running, remainingSec, beep, speak, set])

  const start = () => {
    lastSecond.current = -1
    setNow(Date.now())
    setEndsAt(Date.now() + duration * 1000)
  }

  const adjust = (delta: number) => {
    if (running) setEndsAt(e => (e === null ? e : Math.max(Date.now() + 1000, e + delta * 1000)))
    else setDuration(d => Math.max(15, d + delta))
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.flex}>
              <Text style={styles.eyebrow}>Repos · série {set}</Text>
              <Text style={styles.title} numberOfLines={1}>
                {exerciseName}
              </Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Fermer">
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <View style={styles.center}>
            {/* Pendant le repos, la lune de Moony décroît jusqu'à la reprise */}
            <Mascot
              pose={running ? (remainingSec % 2 ? 'rest' : 'restBreath') : 'wave'}
              phase={running && endsAt !== null ? Math.max(0, endsAt - now) / (duration * 1000) : undefined}
              size={110}
              backdrop
            />
            <Text style={[styles.clock, running && { color: theme.colors.quaternary }]}>{formatClock(remainingSec)}</Text>
          </View>

          {!running && (
            <View style={styles.presets}>
              {presets.map(p => (
                <Chip key={p} label={formatClock(p)} selected={duration === p} onPress={() => setDuration(p)} />
              ))}
            </View>
          )}

          <View style={styles.row}>
            <Button title="−15 s" variant="outline" onPress={() => adjust(-15)} style={styles.flex} />
            <Button title="+15 s" variant="outline" onPress={() => adjust(15)} style={styles.flex} />
          </View>
          {running ? (
            <Button title="Passer le repos" size="lg" color={theme.colors.quaternary} onPress={() => setEndsAt(Date.now())} />
          ) : (
            <Button title={set > 1 ? 'Repos suivant' : 'Démarrer le repos'} size="lg" color={theme.colors.quaternary} onPress={start} />
          )}
        </View>
      </View>
    </Modal>
  )
}

export default RestTimerModal

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
    padding: 22,
    paddingBottom: 36,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
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
  center: {
    alignItems: 'center',
  },
  clock: {
    fontFamily: fonts.display,
    fontSize: 72,
    letterSpacing: -2,
    color: colors.text,
    fontVariant: ['tabular-nums'],
  },
  presets: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
}))

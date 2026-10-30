import { useCallback, useEffect, useRef } from 'react'
import { Vibration } from 'react-native'
import { Audio } from 'expo-av'

import { useThemeContext } from '../theme/ThemeContext'

type Beep = 'short' | 'long'

// Charge les bips une seule fois par écran et les joue avec une vibration (désactivables dans les réglages)
export const useBeeps = () => {
  const { settings } = useThemeContext()
  const enabled = settings.sounds
  const sounds = useRef<Partial<Record<Beep, Audio.Sound>>>({})

  useEffect(() => {
    let cancelled = false
    const load = async () => {
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true })
        const [short, long] = await Promise.all([
          Audio.Sound.createAsync(require('../../assets/sounds/beep-short.wav')),
          Audio.Sound.createAsync(require('../../assets/sounds/beep-long.wav')),
        ])
        if (cancelled) {
          short.sound.unloadAsync()
          long.sound.unloadAsync()
          return
        }
        sounds.current = { short: short.sound, long: long.sound }
      } catch (e) {
        console.warn('Impossible de charger les sons', e)
      }
    }
    load()
    return () => {
      cancelled = true
      Object.values(sounds.current).forEach(sound => sound?.unloadAsync())
      sounds.current = {}
    }
  }, [])

  return useCallback(
    (beep: Beep) => {
      if (!enabled) return
      Vibration.vibrate(beep === 'long' ? 500 : 100)
      sounds.current[beep]?.replayAsync().catch(() => {})
    },
    [enabled],
  )
}

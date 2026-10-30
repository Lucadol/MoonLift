import { useCallback, useEffect } from 'react'
import * as Speech from 'expo-speech'

import { useThemeContext } from '../theme/ThemeContext'

// Annonces vocales du timer (désactivables dans les réglages)
export const useVoice = () => {
  const { settings } = useThemeContext()
  const enabled = settings.voice

  useEffect(() => () => {
    Speech.stop()
  }, [])

  return useCallback(
    (text: string) => {
      if (!enabled) return
      Speech.stop()
      Speech.speak(text, { language: 'fr-FR', rate: 1.05 })
    },
    [enabled],
  )
}

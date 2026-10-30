import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { StyleSheet, useColorScheme } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { SegmentType, TimerType } from '../types'
import { ColorRole } from '../components/mascot/figure'
import { Accents, ColorMode, Palette, PaletteId, mix, neutrals, onColor, palettes } from './palettes'

const SETTINGS_KEY = 'moonlift:settings'

export type ModeSetting = ColorMode | 'system'

export interface ThemeSettings {
  paletteId: PaletteId
  mode: ModeSetting
  voice: boolean // annonces vocales pendant le timer
  sounds: boolean // bips et vibrations
}

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
}

export interface Theme {
  mode: ColorMode
  palette: Palette
  colors: typeof neutrals.light & Accents & { onPrimary: string }
  timer: Record<TimerType | SegmentType, string>
  phase: { prep: string; work: string; rest: string }
  mascot: Record<ColorRole, string>
  fonts: typeof fonts
}

// Couleurs de Moony : corps clair cerné d'encre, identique en thème clair et sombre
export const buildMascotColors = (accents: Accents, backdrop: string): Record<ColorRole, string> => {
  const ink = '#2B2622'
  const fill = '#FFFDF8'
  return {
    ink,
    fill,
    farFill: mix(fill, ink, 0.13),
    moon: accents.moon,
    band: accents.secondary !== accents.moon ? accents.secondary : accents.quaternary,
    shoe: accents.primary,
    accent: accents.secondary,
    gold: accents.tertiary,
    cheek: mix(accents.moon, '#FFFFFF', 0.35),
    sweat: mix(accents.quaternary, '#FFFFFF', 0.45),
    shadow: ink,
    backdrop,
    moonPale: mix(accents.tertiary, '#FFFFFF', 0.55),
    crater: mix(accents.tertiary, '#FFFFFF', 0.2),
  }
}

// Moony posé sur un fond coloré (ex : écran du timer)
export const mascotColorsOn = (theme: Theme, background: string): Record<ColorRole, string> => ({
  ...theme.mascot,
  backdrop: mix(background, onColor(background), 0.12),
})

export const buildTheme = (paletteId: PaletteId, mode: ColorMode): Theme => {
  const palette = palettes.find(p => p.id === paletteId) ?? palettes[0]
  const accents = palette[mode]
  const base = neutrals[mode]
  const colors = { ...base, ...accents, onPrimary: onColor(accents.primary) }
  return {
    mode,
    palette,
    colors,
    timer: {
      AMRAP: accents.primary,
      EMOM: accents.quaternary,
      TABATA: accents.secondary,
      FOR_TIME: accents.tertiary,
      MIX: base.text,
      REST: base.textMuted,
    },
    phase: { prep: accents.tertiary, work: accents.primary, rest: accents.quaternary },
    mascot: buildMascotColors(accents, base.surfaceAlt),
    fonts,
  }
}

interface ThemeContextValue {
  theme: Theme
  settings: ThemeSettings
  setPalette: (paletteId: PaletteId) => void
  setMode: (mode: ModeSetting) => void
  updateSettings: (patch: Partial<ThemeSettings>) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme()
  const [settings, setSettings] = useState<ThemeSettings>({ paletteId: 'terracotta', mode: 'light', voice: true, sounds: true })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(SETTINGS_KEY)
      .then(raw => raw && setSettings(prev => ({ ...prev, ...JSON.parse(raw) })))
      .catch(console.warn)
      .finally(() => setLoaded(true))
  }, [])

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(console.warn)
  }, [loaded, settings])

  const mode: ColorMode = settings.mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : settings.mode
  const theme = useMemo(() => buildTheme(settings.paletteId, mode), [settings.paletteId, mode])

  const setPalette = useCallback((paletteId: PaletteId) => setSettings(prev => ({ ...prev, paletteId })), [])
  const setMode = useCallback((m: ModeSetting) => setSettings(prev => ({ ...prev, mode: m })), [])

  const updateSettings = useCallback((patch: Partial<ThemeSettings>) => setSettings(prev => ({ ...prev, ...patch })), [])

  const value = useMemo(
    () => ({ theme, settings, setPalette, setMode, updateSettings }),
    [theme, settings, setPalette, setMode, updateSettings],
  )

  // Évite un flash du mauvais thème au démarrage
  if (!loaded) return null
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useThemeContext = () => {
  const value = useContext(ThemeContext)
  if (!value) throw new Error('useTheme doit être utilisé dans un ThemeProvider')
  return value
}

export const useTheme = () => useThemeContext().theme

// Crée un hook de styles recalculés à chaque changement de thème
export const makeStyles =
  <T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) =>
  () => {
    const theme = useTheme()
    return useMemo(() => StyleSheet.create(factory(theme)), [theme])
  }

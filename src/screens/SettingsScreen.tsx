import { ScrollView, Text, View } from 'react-native'

import Card from '../components/Card'
import Chip from '../components/Chip'
import Mascot from '../components/mascot/Mascot'
import ScreenHeader from '../components/ScreenHeader'
import { useCommonStyles } from '../components/styles'
import { palettes } from '../theme/palettes'
import { ModeSetting, buildTheme, makeStyles, useThemeContext } from '../theme/ThemeContext'

const modes: { value: ModeSetting; label: string }[] = [
  { value: 'light', label: 'Clair' },
  { value: 'dark', label: 'Sombre' },
  { value: 'system', label: 'Auto' },
]

const SettingsScreen = () => {
  const { theme, settings, setPalette, setMode } = useThemeContext()
  const common = useCommonStyles()
  const styles = useStyles()

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow="Réglages" title="Apparence" subtitle="Choisis l'ambiance de MoonLift" pose="meditate" />

      <Text style={[common.sectionTitle, { marginTop: 0 }]}>Thème</Text>
      <View style={styles.modes}>
        {modes.map(m => (
          <Chip key={m.value} label={m.label} selected={settings.mode === m.value} onPress={() => setMode(m.value)} />
        ))}
      </View>

      <Text style={common.sectionTitle}>Palette de couleurs</Text>
      {palettes.map(palette => {
        const preview = buildTheme(palette.id, theme.mode)
        const accents = palette[theme.mode]
        const selected = settings.paletteId === palette.id
        return (
          <Card
            key={palette.id}
            onPress={() => setPalette(palette.id)}
            style={[styles.card, selected && { borderColor: accents.primary, borderWidth: 2 }]}
          >
            <Mascot pose="overhead" size={72} backdrop colors={preview.mascot} />
            <View style={styles.cardBody}>
              <Text style={common.cardTitle}>
                {palette.name}
                {selected ? '  ✓' : ''}
              </Text>
              <Text style={common.cardText}>{palette.description}</Text>
              <View style={styles.swatches}>
                {[accents.primary, accents.secondary, accents.tertiary, accents.quaternary].map(color => (
                  <View key={color} style={[styles.swatch, { backgroundColor: color }]} />
                ))}
              </View>
            </View>
          </Card>
        )
      })}
    </ScrollView>
  )
}

export default SettingsScreen

const useStyles = makeStyles(({ colors }) => ({
  modes: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardBody: {
    flex: 1,
  },
  swatches: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 10,
  },
  swatch: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.border,
  },
}))

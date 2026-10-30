import { ScrollView, Switch, Text, View } from 'react-native'

import Button from '../components/Button'
import Card from '../components/Card'
import Chip from '../components/Chip'
import Mascot from '../components/mascot/Mascot'
import ScreenHeader from '../components/ScreenHeader'
import { useCommonStyles } from '../components/styles'
import { APP_NAME } from '../constants/app'
import { useStore } from '../store/StoreContext'
import { palettes } from '../theme/palettes'
import { ModeSetting, buildTheme, makeStyles, useThemeContext } from '../theme/ThemeContext'
import { pickBackup, shareBackup } from '../utils/backup'
import { confirmAction, showMessage } from '../utils/helpers'

const modes: { value: ModeSetting; label: string }[] = [
  { value: 'light', label: 'Clair ☀️' },
  { value: 'dark', label: 'Sombre 🌙' },
  { value: 'system', label: 'Auto' },
]

const SettingsScreen = () => {
  const { theme, settings, setPalette, setMode, updateSettings } = useThemeContext()
  const { programs, records, history, exportData, importData } = useStore()
  const common = useCommonStyles()
  const styles = useStyles()

  const exportBackup = () =>
    shareBackup(exportData()).catch(e => showMessage('Export impossible', e instanceof Error ? e.message : String(e)))

  const importBackup = async () => {
    try {
      const data = await pickBackup()
      if (data === null) return
      confirmAction(
        'Restaurer cette sauvegarde ?',
        'Tes programmes, records et historique actuels seront remplacés par ceux du fichier.',
        () => {
          try {
            importData(data)
            showMessage('Sauvegarde restaurée', 'Toutes tes données ont été importées. 💪')
          } catch (e) {
            showMessage('Import impossible', e instanceof Error ? e.message : String(e))
          }
        },
        'Restaurer',
      )
    } catch (e) {
      showMessage('Import impossible', e instanceof Error ? e.message : String(e))
    }
  }

  const switchColors = { false: theme.colors.surfaceAlt, true: theme.colors.primary }
  // activeThumbColor n'existe que sur le web (react-native-web)
  const thumb = { thumbColor: '#FFFDF8', ...({ activeThumbColor: '#FFFDF8' } as object) }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow={APP_NAME} title="Réglages" subtitle="Ambiance, timer et sauvegarde" pose="meditate" />

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
            <Mascot pose="overhead" size={72} backdrop colors={preview.mascot} animated={false} />
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

      <Text style={common.sectionTitle}>Timer</Text>
      <Card>
        <View style={styles.switchRow}>
          <View style={styles.cardBody}>
            <Text style={common.cardTitle}>Annonces vocales</Text>
            <Text style={common.cardText}>« C’est parti », « Repos », « Dernier tour »…</Text>
          </View>
          <Switch
            value={settings.voice}
            onValueChange={voice => updateSettings({ voice })}
            trackColor={switchColors}
            {...thumb}
            accessibilityLabel="Annonces vocales"
          />
        </View>
        <View style={[styles.switchRow, styles.separator]}>
          <View style={styles.cardBody}>
            <Text style={common.cardTitle}>Bips et vibrations</Text>
            <Text style={common.cardText}>Décompte des 3 dernières secondes</Text>
          </View>
          <Switch
            value={settings.sounds}
            onValueChange={sounds => updateSettings({ sounds })}
            trackColor={switchColors}
            {...thumb}
            accessibilityLabel="Bips et vibrations"
          />
        </View>
      </Card>

      <Text style={common.sectionTitle}>Sauvegarde</Text>
      <Card>
        <Text style={common.body}>
          {programs.length} programme{programs.length > 1 ? 's' : ''} · {records.length} PR · {history.length} entrée
          {history.length > 1 ? 's' : ''} d’historique
        </Text>
        <Text style={common.cardText}>
          Tes données restent sur ce téléphone. Exporte-les régulièrement pour les retrouver sur un nouvel appareil.
        </Text>
        <View style={styles.backupActions}>
          <Button title="Exporter mes données" onPress={exportBackup} />
          <Button title="Restaurer une sauvegarde" variant="outline" onPress={importBackup} />
        </View>
      </Card>
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
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  separator: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginTop: 14,
    paddingTop: 14,
  },
  backupActions: {
    gap: 10,
    marginTop: 14,
  },
}))

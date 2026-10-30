import { useMemo } from 'react'
import { View, Text, Pressable, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../App'

import Card from './components/Card'
import Mascot from './components/mascot/Mascot'
import { PoseName } from './components/mascot/figure'
import ProgressBar from './components/ProgressBar'
import { useCommonStyles } from './components/styles'
import { APP_NAME, APP_TAGLINE } from './constants/app'
import { useLaunchQuote } from './constants/quotes'
import { useStore } from './store/StoreContext'
import { weekStreak } from './utils/history'
import { makeStyles, useTheme } from './theme/ThemeContext'
import { mix } from './theme/palettes'

type HomeProps = StackScreenProps<RootStackParamList, 'Home'>

const Home = ({navigation}: HomeProps) => {
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
  const insets = useSafeAreaInsets()
  const { programs, records, history } = useStore()
  const quote = useLaunchQuote()
  const streak = weekStreak(history)
  const [brand, ...brandRest] = APP_NAME.split(' ')

  // Séance à reprendre : la première séance entamée mais pas terminée, sinon la première non terminée
  const resume = useMemo(() => {
    const candidates = programs.flatMap(program =>
      program.sessions
        .filter(s => s.exercises.length > 0 && s.exercises.some(e => !e.completed))
        .map(session => ({ program, session, started: session.exercises.some(e => e.completed) })),
    )
    return candidates.find(c => c.started) ?? candidates[0]
  }, [programs])

  const menu: { title: string; description: string; pose: PoseName; onPress: () => void }[] = [
    {
      title: 'Timers',
      description: 'AMRAP, EMOM, Tabata, For Time et Mix',
      pose: 'run',
      onPress: () => navigation.navigate('Timer'),
    },
    {
      title: 'Programme',
      description: programs.length
        ? `${programs.length} programme${programs.length > 1 ? 's' : ''}`
        : 'Crée ou importe ton programme',
      pose: 'squat',
      onPress: () => navigation.navigate('Programs'),
    },
    {
      title: 'Historique',
      description: streak > 0 ? `🔥 ${streak} semaine${streak > 1 ? 's' : ''} d’affilée` : 'Ton calendrier d’entraînement',
      pose: 'wave',
      onPress: () => navigation.navigate('History'),
    },
    {
      title: 'Mes PR',
      description: records.length ? `${records.length} record${records.length > 1 ? 's' : ''} enregistrés` : 'Suis tes records personnels',
      pose: 'trophy',
      onPress: () => navigation.navigate('Records'),
    },
  ]

  return (
    <ScrollView style={common.screen} contentContainerStyle={[common.content, { paddingTop: insets.top + 12 }]}>
      <View style={styles.topBar}>
        <Text style={styles.hello}>Bonjour {theme.mode === 'dark' ? '🌙' : '☀️'}</Text>
        <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10} accessibilityRole="button">
          <Text style={common.link}>Réglages</Text>
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Mascot pose="overhead" size={190} backdrop />
        <Text style={styles.brand}>
          {brand}
          {brandRest.length > 0 && <Text style={styles.brandAccent}> {brandRest.join(' ')}</Text>}
        </Text>
        <Text style={styles.tagline}>{APP_TAGLINE}</Text>
        {quote && (
          <View style={styles.bubble}>
            <View style={styles.bubbleTail} />
            <Text style={styles.quote}>{`«\u00A0${quote}\u00A0»`}</Text>
          </View>
        )}
      </View>

      {resume && (
        <Card
          onPress={() => navigation.navigate('Session', { programId: resume.program.id, sessionId: resume.session.id })}
          style={styles.resume}
        >
          <Text style={styles.resumeEyebrow}>{resume.started ? 'Reprendre' : 'Prochaine séance'}</Text>
          <Text style={styles.resumeTitle}>{resume.session.name}</Text>
          <Text style={styles.resumeText}>
            {resume.program.name} · {resume.session.exercises.filter(e => e.completed).length}/
            {resume.session.exercises.length} exercices
          </Text>
          <ProgressBar
            progress={resume.session.exercises.filter(e => e.completed).length / resume.session.exercises.length}
            color={theme.colors.onPrimary}
            trackColor={mix(theme.colors.primary, theme.colors.onPrimary, 0.25)}
            style={{ marginTop: 12 }}
          />
        </Card>
      )}

      {menu.map(item => (
        <Card key={item.title} onPress={item.onPress} style={styles.menuCard}>
          <Mascot pose={item.pose} size={64} backdrop />
          <View style={styles.menuText}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={common.cardText}>{item.description}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      ))}
    </ScrollView>
  )
}

export default Home

const useStyles = makeStyles(({ colors, fonts }) => ({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hero: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 28,
  },
  hello: {
    fontFamily: fonts.semibold,
    fontSize: 15,
    color: colors.text,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 44,
    letterSpacing: -1.5,
    color: colors.text,
    marginTop: 8,
  },
  brandAccent: {
    color: colors.primary,
  },
  bubble: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: 340,
  },
  bubbleTail: {
    position: 'absolute',
    top: -7,
    alignSelf: 'center',
    width: 12,
    height: 12,
    backgroundColor: colors.surface,
    borderLeftWidth: 1,
    borderTopWidth: 1,
    borderColor: colors.border,
    transform: [{ rotate: '45deg' }],
  },
  quote: {
    fontFamily: fonts.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.text,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.medium,
    fontSize: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: colors.textMuted,
    marginTop: 2,
  },
  resume: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  resumeEyebrow: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: colors.onPrimary,
    opacity: 0.75,
  },
  resumeTitle: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.4,
    color: colors.onPrimary,
    marginTop: 4,
  },
  resumeText: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.onPrimary,
    opacity: 0.8,
    marginTop: 2,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 14,
  },
  menuText: {
    flex: 1,
  },
  menuTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    letterSpacing: -0.4,
    color: colors.text,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 28,
    color: colors.textMuted,
  },
}))

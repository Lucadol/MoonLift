import { useMemo, useState } from 'react'
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import ScreenHeader from '../../components/ScreenHeader'
import { useCommonStyles } from '../../components/styles'
import { useStore } from '../../store/StoreContext'
import { makeStyles, useTheme } from '../../theme/ThemeContext'
import { importExample, parseProgramText } from '../../utils/importProgram'
import { describeTimer } from '../../utils/timer'

type ImportProps = StackScreenProps<RootStackParamList, 'Import'>

const ImportScreen = ({ navigation, route }: ImportProps) => {
  const { programId } = route.params
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()
  const { programs, importSessions } = useStore()
  const target = programId ? programs.find(p => p.id === programId) : undefined

  const [name, setName] = useState('')
  const [text, setText] = useState('')
  const [showHelp, setShowHelp] = useState(false)

  const sessions = useMemo(() => parseProgramText(text), [text])
  const exerciseCount = sessions.reduce((sum, s) => sum + s.exercises.length, 0)
  const canImport = exerciseCount > 0 && (!!target || name.trim() !== '')

  const submit = () => {
    if (!canImport) return
    const id = importSessions(target ? { programId: target.id } : { programName: name.trim() }, sessions)
    if (target) navigation.goBack()
    else navigation.replace('Program', { programId: id })
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content} keyboardShouldPersistTaps="handled">
      <ScreenHeader
        eyebrow={target ? target.name : 'Programme'}
        title={target ? 'Importer des séances' : 'Importer un programme'}
        subtitle="Colle le texte de ton programme, MoonLift s'occupe du reste"
        pose="swingUp"
      />

      {!target && (
        <>
          <Text style={[common.label, { marginTop: 0 }]}>Nom du programme</Text>
          <TextInput
            style={common.input}
            value={name}
            onChangeText={setName}
            placeholder="ex : Prépa Open 2027"
            placeholderTextColor={theme.colors.textMuted}
          />
        </>
      )}

      <View style={styles.labelRow}>
        <Text style={[common.label, styles.flex]}>Texte du programme</Text>
        <Pressable onPress={() => setText(importExample)} hitSlop={8}>
          <Text style={common.link}>Exemple</Text>
        </Pressable>
        <Pressable onPress={() => setShowHelp(v => !v)} hitSlop={8}>
          <Text style={common.link}>{showHelp ? 'Masquer l’aide' : 'Aide'}</Text>
        </Pressable>
      </View>

      {showHelp && (
        <Card>
          <Text style={common.body}>
            • Une ligne « Semaine 1 – Jour 1 », « Lundi », « Séance A » ou « # … » commence une séance.{'\n'}• Chaque
            ligne devient un exercice (« A) », « B) »… sont retirés).{'\n'}• Les lignes commençant par « - » ou « • »
            complètent l’exercice précédent.{'\n'}• Les timers sont reconnus : AMRAP 12', EMOM 10 min, E2MOM 20',
            EMOM 12 x 1:30, Tabata 8 x 20/10, For Time (cap 15').{'\n'}• Sous un timer, les lignes suivantes forment
            le détail jusqu’à la prochaine ligne vide.
          </Text>
        </Card>
      )}

      <TextInput
        style={[common.input, styles.textArea]}
        value={text}
        onChangeText={setText}
        placeholder={'Semaine 1 – Jour 1\nA) Back Squat 5x5\nB) AMRAP 12 min\n- 10 Pull-ups\n- 15 Push-ups'}
        placeholderTextColor={theme.colors.textMuted}
        multiline
        textAlignVertical="top"
        autoCorrect={false}
      />

      {exerciseCount > 0 && (
        <>
          <Text style={common.sectionTitle}>
            Aperçu · {sessions.length} séance{sessions.length > 1 ? 's' : ''} · {exerciseCount} exercice
            {exerciseCount > 1 ? 's' : ''}
          </Text>
          {sessions.map((session, i) => (
            <Card key={i}>
              <Text style={common.cardTitle}>{session.name}</Text>
              {session.exercises.map((exercise, j) => (
                <View key={j} style={styles.exercise}>
                  <Text style={common.body}>{exercise.name}</Text>
                  {exercise.timer && (
                    <View style={styles.timerTag}>
                      <View style={[styles.dot, { backgroundColor: theme.timer[exercise.timer.type] }]} />
                      <Text style={styles.timerText}>{describeTimer(exercise.timer)}</Text>
                    </View>
                  )}
                  {!!exercise.details && <Text style={common.cardText}>{exercise.details}</Text>}
                </View>
              ))}
            </Card>
          ))}
        </>
      )}

      <Button
        title={
          exerciseCount > 0
            ? `Importer ${sessions.length} séance${sessions.length > 1 ? 's' : ''}`
            : 'Importer'
        }
        size="lg"
        onPress={submit}
        disabled={!canImport}
        style={{ marginTop: 16 }}
      />
    </ScrollView>
  )
}

export default ImportScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  labelRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
  },
  flex: {
    flex: 1,
  },
  textArea: {
    minHeight: 220,
    fontSize: 15,
    lineHeight: 22,
  },
  exercise: {
    marginTop: 10,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: colors.border,
  },
  timerTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timerText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    color: colors.text,
  },
}))

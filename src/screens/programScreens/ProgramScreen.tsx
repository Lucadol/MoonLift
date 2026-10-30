import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import InputModal from '../../components/InputModal'
import ProgressBar from '../../components/ProgressBar'
import ScreenHeader from '../../components/ScreenHeader'
import { useCommonStyles } from '../../components/styles'
import { useStore } from '../../store/StoreContext'
import { makeStyles } from '../../theme/ThemeContext'
import { confirmAction } from '../../utils/helpers'

type ProgramProps = StackScreenProps<RootStackParamList, 'Program'>

const ProgramScreen = ({ navigation, route }: ProgramProps) => {
  const { programId } = route.params
  const common = useCommonStyles()
  const styles = useStyles()
  const { programs, addSession, renameProgram, deleteProgram } = useStore()
  const [modal, setModal] = useState<'addSession' | 'rename' | null>(null)

  const program = programs.find(p => p.id === programId)
  if (!program) return null

  const remove = () =>
    confirmAction('Supprimer le programme ?', `« ${program.name} » et toutes ses séances seront supprimés.`, () => {
      navigation.goBack()
      deleteProgram(programId)
    })

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow="Programme" title={program.name} pose="deadlift">
        <View style={common.links}>
          <Pressable onPress={() => setModal('rename')}>
            <Text style={common.link}>Renommer</Text>
          </Pressable>
          <Pressable onPress={remove}>
            <Text style={common.danger}>Supprimer</Text>
          </Pressable>
        </View>
      </ScreenHeader>

      {program.sessions.length === 0 && (
        <Card>
          <Text style={common.cardText}>
            Ajoute ta première séance (ex : « Semaine 1 – Jour 1 ») ou importe-les depuis un texte.
          </Text>
        </Card>
      )}

      {program.sessions.map((session, index) => {
        const done = session.exercises.filter(e => e.completed).length
        const total = session.exercises.length
        const complete = total > 0 && done === total
        return (
          <Card
            key={session.id}
            onPress={() => navigation.navigate('Session', { programId, sessionId: session.id })}
            style={styles.card}
          >
            <View style={[styles.index, complete && styles.indexDone]}>
              <Text style={[styles.indexText, complete && styles.indexTextDone]}>{complete ? '✓' : index + 1}</Text>
            </View>
            <View style={styles.cardBody}>
              <Text style={common.cardTitle}>{session.name}</Text>
              <Text style={common.cardText}>
                {done}/{total} exercice{total > 1 ? 's' : ''} validé{total > 1 ? 's' : ''}
              </Text>
              {total > 0 && <ProgressBar progress={done / total} style={styles.progress} />}
            </View>
          </Card>
        )
      })}

      <View style={styles.actions}>
        <Button title="+ Ajouter une séance" onPress={() => setModal('addSession')} />
        <Button title="Importer des séances" variant="outline" onPress={() => navigation.navigate('Import', { programId })} />
      </View>

      <InputModal
        visible={modal === 'addSession'}
        title="Nouvelle séance"
        placeholder="ex : Semaine 1 – Jour 1"
        submitLabel="Ajouter"
        onSubmit={name => addSession(programId, name)}
        onClose={() => setModal(null)}
      />
      <InputModal
        visible={modal === 'rename'}
        title="Renommer le programme"
        initialValue={program.name}
        onSubmit={name => renameProgram(programId, name)}
        onClose={() => setModal(null)}
      />
    </ScrollView>
  )
}

export default ProgramScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardBody: {
    flex: 1,
  },
  index: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexDone: {
    backgroundColor: colors.success,
  },
  indexText: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.text,
  },
  indexTextDone: {
    color: colors.surface,
  },
  progress: {
    marginTop: 10,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
}))

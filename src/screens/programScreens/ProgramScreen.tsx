import { useState } from 'react'
import { Pressable, ScrollView, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import NameModal from '../../components/NameModal'
import ProgressBar from '../../components/ProgressBar'
import { common } from '../../components/styles'
import { colors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'
import { confirmAction } from '../../utils/helpers'

type ProgramProps = StackScreenProps<RootStackParamList, 'Program'>

const ProgramScreen = ({ navigation, route }: ProgramProps) => {
  const { programId } = route.params
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
      <Text style={common.title}>{program.name}</Text>
      <View style={[common.row, { marginTop: -10, marginBottom: 20, gap: 20 }]}>
        <Pressable onPress={() => setModal('rename')}>
          <Text style={common.link}>Renommer</Text>
        </Pressable>
        <Pressable onPress={remove}>
          <Text style={common.danger}>Supprimer</Text>
        </Pressable>
      </View>

      {program.sessions.length === 0 && (
        <Text style={common.empty}>Ajoute ta première séance (ex : « Semaine 1 – Jour 1 »).</Text>
      )}

      {program.sessions.map(session => {
        const done = session.exercises.filter(e => e.completed).length
        const total = session.exercises.length
        return (
          <Pressable
            key={session.id}
            style={common.card}
            onPress={() => navigation.navigate('Session', { programId, sessionId: session.id })}
          >
            <View style={[common.row, { justifyContent: 'space-between' }]}>
              <Text style={[common.cardTitle, { flexShrink: 1 }]}>{session.name}</Text>
              {total > 0 && done === total && <Text style={{ color: colors.green, fontSize: 20 }}>✓</Text>}
            </View>
            <Text style={common.cardText}>
              {done}/{total} exercice{total > 1 ? 's' : ''} validé{done > 1 ? 's' : ''}
            </Text>
            {total > 0 && <ProgressBar progress={done / total} style={{ marginTop: 10 }} />}
          </Pressable>
        )
      })}

      <Button title="+ Ajouter une séance" color={colors.blue} onPress={() => setModal('addSession')} style={{ marginTop: 10 }} />

      <NameModal
        visible={modal === 'addSession'}
        title="Nouvelle séance"
        placeholder="ex : Semaine 1 – Jour 1"
        onSubmit={name => addSession(programId, name)}
        onClose={() => setModal(null)}
      />
      <NameModal
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

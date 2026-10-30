import { useState } from 'react'
import { Pressable, ScrollView, Text } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import NameModal from '../../components/NameModal'
import { common } from '../../components/styles'
import { colors } from '../../constants/colors'
import { useStore } from '../../store/StoreContext'

type ProgramsProps = StackScreenProps<RootStackParamList, 'Programs'>

const ProgramsScreen = ({ navigation }: ProgramsProps) => {
  const { programs, addProgram } = useStore()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const create = (name: string) => {
    const programId = addProgram(name)
    navigation.navigate('Program', { programId })
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <Text style={common.title}>Programmes</Text>

      {programs.length === 0 && (
        <Text style={common.empty}>
          Aucun programme pour le moment.{'\n'}Crée ton programme, ajoute tes séances et tes exercices, puis lance
          les timers directement depuis ta séance.
        </Text>
      )}

      {programs.map(program => {
        const exercises = program.sessions.flatMap(s => s.exercises)
        const done = exercises.filter(e => e.completed).length
        return (
          <Pressable
            key={program.id}
            style={common.card}
            onPress={() => navigation.navigate('Program', { programId: program.id })}
          >
            <Text style={common.cardTitle}>{program.name}</Text>
            <Text style={common.cardText}>
              {program.sessions.length} séance{program.sessions.length > 1 ? 's' : ''} · {done}/{exercises.length}{' '}
              exercices validés
            </Text>
          </Pressable>
        )
      })}

      <Button
        title="+ Nouveau programme"
        color={colors.blue}
        onPress={() => setIsModalVisible(true)}
        style={{ marginTop: 10 }}
      />

      <NameModal
        visible={isModalVisible}
        title="Nouveau programme"
        placeholder="ex : Prépa force – Bloc 1"
        onSubmit={create}
        onClose={() => setIsModalVisible(false)}
      />
    </ScrollView>
  )
}

export default ProgramsScreen

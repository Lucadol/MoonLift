import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

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

type ProgramsProps = StackScreenProps<RootStackParamList, 'Programs'>

const ProgramsScreen = ({ navigation }: ProgramsProps) => {
  const common = useCommonStyles()
  const styles = useStyles()
  const { programs, addProgram } = useStore()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const create = (name: string) => {
    const programId = addProgram(name)
    navigation.navigate('Program', { programId })
  }

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader
        eyebrow="Entraînement"
        title="Programmes"
        subtitle="Tes séances, tes timers, ta progression"
        pose="squat"
      />

      {programs.length === 0 && (
        <Card>
          <Text style={common.cardTitle}>Commence ton programme</Text>
          <Text style={common.cardText}>
            Crée-le à la main ou colle simplement le texte de ton coach : les séances, les exercices et les timers
            (AMRAP, EMOM, Tabata, For Time) sont détectés automatiquement.
          </Text>
        </Card>
      )}

      {programs.map(program => {
        const exercises = program.sessions.flatMap(s => s.exercises)
        const done = exercises.filter(e => e.completed).length
        return (
          <Card key={program.id} onPress={() => navigation.navigate('Program', { programId: program.id })}>
            <Text style={common.cardTitle}>{program.name}</Text>
            <Text style={common.cardText}>
              {program.sessions.length} séance{program.sessions.length > 1 ? 's' : ''} · {done}/{exercises.length}{' '}
              exercices validés
            </Text>
            {exercises.length > 0 && <ProgressBar progress={done / exercises.length} style={styles.progress} />}
          </Card>
        )
      })}

      <View style={styles.actions}>
        <Button title="+ Nouveau programme" onPress={() => setIsModalVisible(true)} />
        <Button title="Importer depuis un texte" variant="outline" onPress={() => navigation.navigate('Import', {})} />
      </View>

      <InputModal
        visible={isModalVisible}
        title="Nouveau programme"
        placeholder="ex : Prépa force – Bloc 1"
        submitLabel="Créer"
        onSubmit={create}
        onClose={() => setIsModalVisible(false)}
      />
    </ScrollView>
  )
}

export default ProgramsScreen

const useStyles = makeStyles(() => ({
  progress: {
    marginTop: 12,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
}))

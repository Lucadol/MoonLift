import { Pressable, StyleSheet, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../App'
import { colors, timerColors } from '../constants/colors'
import { TimerType } from '../types'
import { timerDescriptions, timerLabels } from '../utils/timer'

type TimerProps = StackScreenProps<RootStackParamList, 'Timer'>

const timerTypes: TimerType[] = ['AMRAP', 'EMOM', 'TABATA', 'FOR_TIME']

const TimerScreen = ({navigation}: TimerProps) => {
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Chrono</Text>
    <View style={styles.contentContainer}>
      {timerTypes.map(type => (
        <Pressable
          key={type}
          style={[styles.button, { backgroundColor: timerColors[type] }]}
          onPress={() => navigation.navigate('TimerSetup', { type })}
        >
          <Text style={styles.buttonText}>{timerLabels[type]}</Text>
          <Text style={styles.description}>{timerDescriptions[type]}</Text>
        </Pressable>
      ))}
    </View>
  </View>
  )
}

export default TimerScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff'
  },
  contentContainer: {
    padding: 20,
    alignItems: 'center'
  },
  button: {
    width: 280,
    padding: 10,
    margin: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
  description: {
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    fontSize: 13,
    marginTop: 2,
  },
})

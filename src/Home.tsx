import { View, Text, Pressable, StyleSheet } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../App'
import { colors } from './constants/colors'

type HomeProps = StackScreenProps<RootStackParamList, 'Home'>

const Home = ({navigation}: HomeProps) => {
  return (
    <View style={styles.container}>
    <Text style={styles.title}>MoonLift</Text>
    <View style={styles.contentContainer}>
      <Pressable
        style={[styles.button, styles.timer]}
        onPress={() => navigation.navigate('Timer')}
      >
        <Text style={styles.buttonText}>TIMER</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.program]}
        onPress={() => navigation.navigate('Programs')}
      >
        <Text style={styles.buttonText}>PROGRAMME</Text>
      </Pressable>
      <Pressable
        style={[styles.button, styles.records]}
        onPress={() => navigation.navigate('Records')}
      >
        <Text style={styles.buttonText}>MES PR</Text>
      </Pressable>
    </View>
  </View>
  )
}

export default Home

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
        width: 250,
        padding: 10,
        margin: 10,
        borderRadius: 25,
      },
      timer: {
        backgroundColor: colors.red,
      },
      program: {
        backgroundColor: colors.blue,
      },
      records: {
        backgroundColor: colors.orange,
      },
      buttonText: {
        color: 'white',
        textAlign: 'center',
        fontSize: 20,
        fontWeight: '500',
      },
})

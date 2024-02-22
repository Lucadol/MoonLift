import { View, Text, Pressable, StyleSheet } from 'react-native'

//React Navigation
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../App'

type HomeProps = NativeStackScreenProps<RootStackParamList, 'Home'>

const Home = ({navigation}: HomeProps) => {
  return (
    <View style={styles.container}>
    <Text style={styles.title}>MoonLift</Text>
    <View style={styles.contentContainer}>
      <Pressable
        style={styles.timerText}
        onPress={() => navigation.navigate('Timer')}
      >
        <Text style={styles.buttonText}>TIMER</Text>
      </Pressable>
      <Pressable
        style={styles.followupText}
        onPress={() => navigation.navigate('Followup')}
      >
        <Text style={styles.buttonText}>FOLLOW-UP</Text>
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
      timerText: {
        backgroundColor: '#FF3E4D',
        width: 250,
        padding: 10,
        margin: 10,
        borderRadius: 25,
      },
      followupText: {
        backgroundColor: '#3498DB',
        width: 250,
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
})

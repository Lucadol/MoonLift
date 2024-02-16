import { Pressable, StyleSheet, Text, View } from 'react-native';

//Navigation
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'

//Screen
import TimerScreen from './screens/TimerScreen';
import FollowupScreen from './screens/FollowupScreen';

export default function App() {
  return (
        <View style={styles.container}>
      <Text style={styles.title}>MoonLift</Text>
      <View style={styles.contentContainer}>
        <Pressable
          style={styles.timerText}
        >
          <Text style={styles.buttonText}>TIMER</Text>
        </Pressable>
        <Pressable style={styles.followupText}>
          <Text style={styles.buttonText}>FOLLOW-UP</Text>
        </Pressable>
        </View>
      </View>
    )
  }
  
  const styles = StyleSheet.create({
      container: {
          flex: 1,
          backgroundColor: '#000',
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
  
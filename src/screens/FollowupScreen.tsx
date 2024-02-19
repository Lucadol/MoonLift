import { Pressable, StyleSheet, Text, View } from 'react-native'

const FollowupScreen = () => {
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Suivi</Text>
    <View style={styles.contentContainer}>
      <Pressable style={[styles.button, styles.seances]}>
        <Text style={styles.buttonText}>SEANCES</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.reps]}>
        <Text style={styles.buttonText}>REPETITIONS</Text>
      </Pressable>
    </View>
  </View>
  )
}

export default FollowupScreen

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
    button: {
      width: 250,
      padding: 10,
      margin: 10,
      borderRadius: 25,
    },
    seances: {
      backgroundColor: '#10A881',
    },
    reps: {
      backgroundColor: '#F3B431',
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontSize: 20,
      fontWeight: '500',
    },
})

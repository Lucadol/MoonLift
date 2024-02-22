import { Pressable, StyleSheet, Text, View } from 'react-native'

const TimerScreen = () => {
  return (
    <View style={styles.container}>
    <Text style={styles.title}>Chrono</Text>
    <View style={styles.contentContainer}>
      <Pressable style={[styles.button, styles.amrap]}>
        <Text style={styles.buttonText}>AMRAP</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.emom]}>
        <Text style={styles.buttonText}>EMOM</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.tabata]}>
        <Text style={styles.buttonText}>TABATA</Text>
      </Pressable>
      <Pressable style={[styles.button, styles.mix]}>
        <Text style={styles.buttonText}>MIX</Text>
      </Pressable>
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
  amrap: {
    backgroundColor: '#3498DB',
  },
  emom: {
    backgroundColor: '#9B59B6',
  },
  tabata: {
    backgroundColor: '#2ECC71',
  },
  mix: {
    backgroundColor: '#F1C40F',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '500',
  },
})


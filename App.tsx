import { Pressable, StyleSheet, Text, View, useColorScheme } from 'react-native';

//Navigation
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createStackNavigator } from '@react-navigation/stack';
// import { createDrawerNavigator } from '@react-navigation/drawer';

//Screen
import Home from './src/Home';
import TimerScreen from './src/screens/TimerScreen';
import FollowupScreen from './src/screens/FollowupScreen';
import EmomScreen from './src/screens/timerScreens/EmomScreen';

export type RootStackParamList = {
  Home: undefined
  Timer: undefined
  Followup: undefined
  Emom: undefined
}

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const colorScheme = useColorScheme()
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme

  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Timer"
          component={TimerScreen}
          options={{
            headerTitle: '', // Titre vide pour masquer le titre
            headerBackTitleVisible: false, // Masquer le titre de retour
            headerTintColor: 'white', // Couleur blanche pour la flèche de retour
            headerStyle: {
              backgroundColor: '#000', // Couleur de fond noire pour l'en-tête
              elevation: 0, // Supprimer l'élévation (Android)
            }
          }}
        />
        <Stack.Screen 
          name="Followup"
          component={FollowupScreen} 
          options={{
            headerTitle: '',
            headerBackTitleVisible: false,
            headerTintColor: 'white',
            headerStyle: {
              backgroundColor: '#000',
              elevation: 0,
            }
          }}
        />
        <Stack.Screen
          name="Emom"
          component={EmomScreen}
          options={{
            headerTitle: '',
            headerBackTitleVisible: false,
            headerTintColor: 'white',
            headerStyle: {
              backgroundColor: '#000',
              elevation: 0,
            }
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
  
  
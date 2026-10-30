import { StatusBar } from 'expo-status-bar';

//Navigation
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';

//Store
import { StoreProvider } from './src/store/StoreContext';
import { ExerciseRef, TimerConfig, TimerType } from './src/types';
import { colors } from './src/constants/colors';

//Screen
import Home from './src/Home';
import TimerScreen from './src/screens/TimerScreen';
import TimerSetupScreen from './src/screens/timerScreens/TimerSetupScreen';
import TimerRunScreen from './src/screens/timerScreens/TimerRunScreen';
import ProgramsScreen from './src/screens/programScreens/ProgramsScreen';
import ProgramScreen from './src/screens/programScreens/ProgramScreen';
import SessionScreen from './src/screens/programScreens/SessionScreen';
import ExerciseEditScreen from './src/screens/programScreens/ExerciseEditScreen';
import RecordsScreen from './src/screens/recordScreens/RecordsScreen';
import RecordDetailScreen from './src/screens/recordScreens/RecordDetailScreen';
import RecordEditScreen from './src/screens/recordScreens/RecordEditScreen';

export type RootStackParamList = {
  Home: undefined
  Timer: undefined
  TimerSetup: { type: TimerType }
  TimerRun: { config: TimerConfig; exerciseRef?: ExerciseRef }
  Programs: undefined
  Program: { programId: string }
  Session: { programId: string; sessionId: string }
  ExerciseEdit: { programId: string; sessionId: string; exerciseId?: string }
  Records: undefined
  RecordDetail: { movementKey: string }
  RecordEdit: { recordId?: string; movement?: string }
}

const Stack = createStackNavigator<RootStackParamList>();

// L'application est toujours en thème sombre (cf. app.json)
const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.background },
}

const screenOptions: StackNavigationOptions = {
  headerTitle: '', // Titre vide pour masquer le titre
  headerBackTitleVisible: false, // Masquer le titre de retour
  headerTintColor: 'white', // Couleur blanche pour la flèche de retour
  headerStyle: {
    backgroundColor: '#000', // Couleur de fond noire pour l'en-tête
    elevation: 0, // Supprimer l'élévation (Android)
    shadowOpacity: 0, // Supprimer l'ombre (iOS)
  },
}

export default function App() {
  return (
    <StoreProvider>
      <NavigationContainer theme={theme}>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={screenOptions}>
          <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
          <Stack.Screen name="Timer" component={TimerScreen} />
          <Stack.Screen name="TimerSetup" component={TimerSetupScreen} />
          <Stack.Screen name="TimerRun" component={TimerRunScreen} options={{ gestureEnabled: false }} />
          <Stack.Screen name="Programs" component={ProgramsScreen} />
          <Stack.Screen name="Program" component={ProgramScreen} />
          <Stack.Screen name="Session" component={SessionScreen} />
          <Stack.Screen name="ExerciseEdit" component={ExerciseEditScreen} />
          <Stack.Screen name="Records" component={RecordsScreen} />
          <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
          <Stack.Screen name="RecordEdit" component={RecordEditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </StoreProvider>
  );
}

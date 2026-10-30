import { StatusBar } from 'expo-status-bar';
import { useFonts, SpaceGrotesk_500Medium, SpaceGrotesk_700Bold } from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';

//Navigation
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';

//Store & thème
import { StoreProvider } from './src/store/StoreContext';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { ExerciseRef, TimerConfig, TimerType } from './src/types';

//Screen
import Home from './src/Home';
import TimerScreen from './src/screens/TimerScreen';
import TimerSetupScreen from './src/screens/timerScreens/TimerSetupScreen';
import TimerRunScreen from './src/screens/timerScreens/TimerRunScreen';
import ProgramsScreen from './src/screens/programScreens/ProgramsScreen';
import ProgramScreen from './src/screens/programScreens/ProgramScreen';
import SessionScreen from './src/screens/programScreens/SessionScreen';
import ExerciseEditScreen from './src/screens/programScreens/ExerciseEditScreen';
import ImportScreen from './src/screens/programScreens/ImportScreen';
import RecordsScreen from './src/screens/recordScreens/RecordsScreen';
import RecordDetailScreen from './src/screens/recordScreens/RecordDetailScreen';
import RecordEditScreen from './src/screens/recordScreens/RecordEditScreen';
import SettingsScreen from './src/screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined
  Timer: undefined
  TimerSetup: { type: TimerType }
  TimerRun: { config: TimerConfig; exerciseRef?: ExerciseRef }
  Programs: undefined
  Program: { programId: string }
  Session: { programId: string; sessionId: string }
  ExerciseEdit: { programId: string; sessionId: string; exerciseId?: string }
  Import: { programId?: string }
  Records: undefined
  RecordDetail: { movementKey: string }
  RecordEdit: { recordId?: string; movement?: string }
  Settings: undefined
}

const Stack = createStackNavigator<RootStackParamList>();

const Navigation = () => {
  const theme = useTheme()
  const base = theme.mode === 'dark' ? DarkTheme : DefaultTheme
  const navigationTheme = {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.text,
      border: theme.colors.border,
      primary: theme.colors.primary,
    },
  }

  const screenOptions: StackNavigationOptions = {
    headerTitle: '', // Titre vide pour masquer le titre
    headerBackTitleVisible: false, // Masquer le titre de retour
    headerTintColor: theme.colors.text,
    headerStyle: {
      backgroundColor: theme.colors.background,
      elevation: 0, // Supprimer l'élévation (Android)
      shadowOpacity: 0, // Supprimer l'ombre (iOS)
      borderBottomWidth: 0,
    },
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator screenOptions={screenOptions}>
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Timer" component={TimerScreen} />
        <Stack.Screen name="TimerSetup" component={TimerSetupScreen} />
        <Stack.Screen name="TimerRun" component={TimerRunScreen} options={{ gestureEnabled: false }} />
        <Stack.Screen name="Programs" component={ProgramsScreen} />
        <Stack.Screen name="Program" component={ProgramScreen} />
        <Stack.Screen name="Session" component={SessionScreen} />
        <Stack.Screen name="ExerciseEdit" component={ExerciseEditScreen} />
        <Stack.Screen name="Import" component={ImportScreen} />
        <Stack.Screen name="Records" component={RecordsScreen} />
        <Stack.Screen name="RecordDetail" component={RecordDetailScreen} />
        <Stack.Screen name="RecordEdit" component={RecordEditScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default function App() {
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_500Medium,
    SpaceGrotesk_700Bold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })

  if (!fontsLoaded) return null

  return (
    <ThemeProvider>
      <StoreProvider>
        <Navigation />
      </StoreProvider>
    </ThemeProvider>
  );
}

import { ScrollView, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../App'

import Card from '../components/Card'
import ScreenHeader from '../components/ScreenHeader'
import { useCommonStyles } from '../components/styles'
import { makeStyles, useTheme } from '../theme/ThemeContext'
import { timerDescriptions, timerLabels, timerTypes } from '../utils/timer'

type TimerProps = StackScreenProps<RootStackParamList, 'Timer'>

const TimerScreen = ({navigation}: TimerProps) => {
  const theme = useTheme()
  const common = useCommonStyles()
  const styles = useStyles()

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow="Chrono" title="Timers" subtitle="Choisis ton format d'entraînement" pose="run" />
      {timerTypes.map(type => (
        <Card
          key={type}
          accent={theme.timer[type]}
          onPress={() => navigation.navigate('TimerSetup', { type })}
          style={styles.card}
        >
          <View style={styles.text}>
            <Text style={styles.name}>{timerLabels[type]}</Text>
            <Text style={common.cardText}>{timerDescriptions[type]}</Text>
          </View>
          <Text style={styles.chevron}>›</Text>
        </Card>
      ))}
    </ScrollView>
  )
}

export default TimerScreen

const useStyles = makeStyles(({ colors, fonts }) => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
  },
  text: {
    flex: 1,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    letterSpacing: -0.3,
    color: colors.text,
  },
  chevron: {
    fontFamily: fonts.body,
    fontSize: 28,
    color: colors.textMuted,
  },
}))

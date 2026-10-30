import { useState } from 'react'
import { ScrollView } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import Card from '../../components/Card'
import ScreenHeader from '../../components/ScreenHeader'
import TimerConfigForm from '../../components/TimerConfigForm'
import { useCommonStyles } from '../../components/styles'
import { useTheme } from '../../theme/ThemeContext'
import { TimerConfig } from '../../types'
import { defaultTimerConfig, timerDescriptions, timerLabels } from '../../utils/timer'

type TimerSetupProps = StackScreenProps<RootStackParamList, 'TimerSetup'>

const TimerSetupScreen = ({ navigation, route }: TimerSetupProps) => {
  const { type } = route.params
  const theme = useTheme()
  const common = useCommonStyles()
  const [config, setConfig] = useState<TimerConfig>(() => defaultTimerConfig(type))

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <ScreenHeader eyebrow="Réglages" title={timerLabels[type]} subtitle={timerDescriptions[type]} pose="jack" />
      <Card>
        <TimerConfigForm config={config} onChange={setConfig} />
      </Card>
      <Button
        title="Démarrer"
        size="lg"
        color={theme.timer[type]}
        disabled={config.type === 'MIX' && config.segments.length === 0}
        onPress={() => navigation.navigate('TimerRun', { config })}
        style={{ marginTop: 12 }}
      />
    </ScrollView>
  )
}

export default TimerSetupScreen

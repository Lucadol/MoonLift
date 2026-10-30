import { useState } from 'react'
import { ScrollView, Text, View } from 'react-native'

//React Navigation
import { StackScreenProps } from '@react-navigation/stack'
import { RootStackParamList } from '../../../App'

import Button from '../../components/Button'
import TimerConfigForm from '../../components/TimerConfigForm'
import { common } from '../../components/styles'
import { timerColors } from '../../constants/colors'
import { TimerConfig } from '../../types'
import { defaultTimerConfig, timerDescriptions, timerLabels } from '../../utils/timer'

type TimerSetupProps = StackScreenProps<RootStackParamList, 'TimerSetup'>

const TimerSetupScreen = ({ navigation, route }: TimerSetupProps) => {
  const { type } = route.params
  const [config, setConfig] = useState<TimerConfig>(() => defaultTimerConfig(type))

  return (
    <ScrollView style={common.screen} contentContainerStyle={common.content}>
      <Text style={common.title}>{timerLabels[type]}</Text>
      <Text style={common.subtitle}>{timerDescriptions[type]}</Text>
      <View style={common.card}>
        <TimerConfigForm config={config} onChange={setConfig} />
      </View>
      <Button
        title="DÉMARRER"
        color={timerColors[type]}
        onPress={() => navigation.navigate('TimerRun', { config })}
        style={{ marginTop: 20 }}
      />
    </ScrollView>
  )
}

export default TimerSetupScreen

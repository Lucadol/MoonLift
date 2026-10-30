import { StyleSheet, Text, View } from 'react-native'

import { colors } from '../constants/colors'
import { TimerConfig } from '../types'
import { buildPhases, formatClock, totalDurationSec } from '../utils/timer'
import Stepper from './Stepper'

interface TimerConfigFormProps {
  config: TimerConfig
  onChange: (config: TimerConfig) => void
}

const TimerConfigForm = ({ config, onChange }: TimerConfigFormProps) => {
  const total = totalDurationSec(buildPhases(config))

  return (
    <View>
      {config.type === 'AMRAP' && (
        <Stepper
          label="Durée"
          value={config.durationSec}
          onChange={durationSec => onChange({ ...config, durationSec })}
          min={60}
          max={90 * 60}
          step={60}
          format={formatClock}
        />
      )}

      {config.type === 'FOR_TIME' && (
        <Stepper
          label="Time cap"
          value={config.capSec}
          onChange={capSec => onChange({ ...config, capSec })}
          min={60}
          max={90 * 60}
          step={60}
          format={formatClock}
        />
      )}

      {config.type === 'EMOM' && (
        <>
          <Stepper
            label="Toutes les"
            value={config.intervalSec}
            onChange={intervalSec => onChange({ ...config, intervalSec })}
            min={15}
            max={10 * 60}
            step={15}
            format={formatClock}
          />
          <Stepper
            label="Nombre de tours"
            value={config.rounds}
            onChange={rounds => onChange({ ...config, rounds })}
            min={1}
            max={60}
            step={1}
          />
        </>
      )}

      {config.type === 'TABATA' && (
        <>
          <Stepper
            label="Travail"
            value={config.workSec}
            onChange={workSec => onChange({ ...config, workSec })}
            min={5}
            max={10 * 60}
            step={5}
            format={formatClock}
          />
          <Stepper
            label="Repos"
            value={config.restSec}
            onChange={restSec => onChange({ ...config, restSec })}
            min={0}
            max={10 * 60}
            step={5}
            format={formatClock}
          />
          <Stepper
            label="Nombre de tours"
            value={config.rounds}
            onChange={rounds => onChange({ ...config, rounds })}
            min={1}
            max={50}
            step={1}
          />
        </>
      )}

      <Text style={styles.total}>
        {config.type === 'FOR_TIME' ? 'Durée maximale' : 'Durée totale'} : {formatClock(total)}
      </Text>
    </View>
  )
}

export default TimerConfigForm

const styles = StyleSheet.create({
  total: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: 8,
    textAlign: 'right',
  },
})

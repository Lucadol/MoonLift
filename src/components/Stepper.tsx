import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../constants/colors'

interface StepperProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  format?: (value: number) => string
}

const Stepper = ({ label, value, onChange, min, max, step, format = v => `${v}` }: StepperProps) => {
  const change = (delta: number) => onChange(Math.min(max, Math.max(min, value + delta)))

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.controls}>
        <Pressable
          accessibilityLabel={`Diminuer ${label}`}
          onPress={() => change(-step)}
          disabled={value <= min}
          style={[styles.button, value <= min && styles.disabled]}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{format(value)}</Text>
        <Pressable
          accessibilityLabel={`Augmenter ${label}`}
          onPress={() => change(step)}
          disabled={value >= max}
          style={[styles.button, value >= max && styles.disabled]}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default Stepper

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  label: {
    color: colors.text,
    fontSize: 18,
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  buttonText: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '600',
  },
  value: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '600',
    minWidth: 80,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
})

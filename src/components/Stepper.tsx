import { Pressable, Text, View } from 'react-native'
import { makeStyles } from '../theme/ThemeContext'

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
  const styles = useStyles()
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
          hitSlop={4}
        >
          <Text style={styles.buttonText}>−</Text>
        </Pressable>
        <Text style={styles.value}>{format(value)}</Text>
        <Pressable
          accessibilityLabel={`Augmenter ${label}`}
          onPress={() => change(step)}
          disabled={value >= max}
          style={[styles.button, value >= max && styles.disabled]}
          hitSlop={4}
        >
          <Text style={styles.buttonText}>+</Text>
        </Pressable>
      </View>
    </View>
  )
}

export default Stepper

const useStyles = makeStyles(({ colors, fonts }) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 16,
    flexShrink: 1,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.3,
  },
  buttonText: {
    fontFamily: fonts.medium,
    color: colors.text,
    fontSize: 20,
    lineHeight: 22,
  },
  value: {
    fontFamily: fonts.display,
    color: colors.text,
    fontSize: 20,
    minWidth: 78,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
}))

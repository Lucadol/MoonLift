import { Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native'
import { colors } from '../constants/colors'

interface ButtonProps {
  title: string
  onPress: () => void
  color?: string
  variant?: 'filled' | 'outline'
  disabled?: boolean
  style?: StyleProp<ViewStyle>
}

const Button = ({ title, onPress, color = colors.blue, variant = 'filled', disabled, style }: ButtonProps) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    style={({ pressed }) => [
      styles.button,
      variant === 'filled' ? { backgroundColor: color } : { borderColor: color, borderWidth: 2 },
      (pressed || disabled) && { opacity: disabled ? 0.4 : 0.7 },
      style,
    ]}
  >
    <Text style={[styles.text, variant === 'outline' && { color }]}>{title}</Text>
  </Pressable>
)

export default Button

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    alignItems: 'center',
  },
  text: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '600',
  },
})

import { Pressable, StyleProp, Text, ViewStyle } from 'react-native'

import { onColor } from '../theme/palettes'
import { makeStyles, useTheme } from '../theme/ThemeContext'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: 'primary' | 'outline' | 'ghost'
  color?: string // couleur de fond (primary) ou de bordure/texte (outline, ghost)
  disabled?: boolean
  size?: 'md' | 'lg'
  style?: StyleProp<ViewStyle>
}

const Button = ({ title, onPress, variant = 'primary', color, disabled, size = 'md', style }: ButtonProps) => {
  const theme = useTheme()
  const styles = useStyles()
  const main = color ?? (variant === 'primary' ? theme.colors.primary : theme.colors.text)

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        size === 'lg' && styles.large,
        variant === 'primary' && { backgroundColor: main },
        variant === 'outline' && { borderWidth: 1.5, borderColor: main },
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[styles.text, size === 'lg' && styles.textLarge, { color: variant === 'primary' ? onColor(main) : main }]}
      >
        {title}
      </Text>
    </Pressable>
  )
}

export default Button

const useStyles = makeStyles(({ fonts }) => ({
  button: {
    minHeight: 50,
    paddingHorizontal: 22,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  large: {
    minHeight: 58,
    borderRadius: 29,
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.35,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  textLarge: {
    fontSize: 17,
  },
}))

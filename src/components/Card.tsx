import { Pressable, StyleProp, View, ViewStyle } from 'react-native'
import { makeStyles } from '../theme/ThemeContext'

interface CardProps {
  children: React.ReactNode
  onPress?: () => void
  accent?: string // liseré de couleur à gauche
  style?: StyleProp<ViewStyle>
}

const Card = ({ children, onPress, accent, style }: CardProps) => {
  const styles = useStyles()
  const content = (
    <>
      {accent && <View style={[styles.accent, { backgroundColor: accent }]} />}
      {children}
    </>
  )
  if (!onPress) return <View style={[styles.card, style]}>{content}</View>
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}>
      {content}
    </Pressable>
  )
}

export default Card

const useStyles = makeStyles(({ colors }) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 12,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
  },
}))

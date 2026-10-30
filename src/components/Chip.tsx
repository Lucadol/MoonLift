import { Pressable, Text } from 'react-native'

import { onColor } from '../theme/palettes'
import { makeStyles, useTheme } from '../theme/ThemeContext'

interface ChipProps {
  label: string
  selected?: boolean
  color?: string
  onPress: () => void
}

const Chip = ({ label, selected, color, onPress }: ChipProps) => {
  const theme = useTheme()
  const styles = useStyles()
  const main = color ?? theme.colors.text
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={[styles.chip, selected && { backgroundColor: main, borderColor: main }]}
    >
      <Text style={[styles.text, { color: selected ? onColor(main) : theme.colors.text }]}>{label}</Text>
    </Pressable>
  )
}

export default Chip

const useStyles = makeStyles(({ colors, fonts }) => ({
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  text: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    letterSpacing: 0.3,
  },
}))

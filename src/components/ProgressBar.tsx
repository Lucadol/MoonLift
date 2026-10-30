import { StyleProp, View, ViewStyle } from 'react-native'
import { makeStyles, useTheme } from '../theme/ThemeContext'

interface ProgressBarProps {
  progress: number // entre 0 et 1
  color?: string
  trackColor?: string
  style?: StyleProp<ViewStyle>
}

const ProgressBar = ({ progress, color, trackColor, style }: ProgressBarProps) => {
  const theme = useTheme()
  const styles = useStyles()
  return (
    <View style={[styles.track, trackColor ? { backgroundColor: trackColor } : null, style]}>
      <View
        style={[
          styles.fill,
          { width: `${Math.min(1, Math.max(0, progress)) * 100}%`, backgroundColor: color ?? theme.colors.success },
        ]}
      />
    </View>
  )
}

export default ProgressBar

const useStyles = makeStyles(({ colors }) => ({
  track: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
    borderRadius: 3,
  },
}))

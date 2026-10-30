import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native'
import { colors } from '../constants/colors'

interface ProgressBarProps {
  progress: number // entre 0 et 1
  color?: string
  style?: StyleProp<ViewStyle>
}

const ProgressBar = ({ progress, color = colors.green, style }: ProgressBarProps) => (
  <View style={[styles.track, style]}>
    <View style={[styles.fill, { width: `${Math.min(1, Math.max(0, progress)) * 100}%`, backgroundColor: color }]} />
  </View>
)

export default ProgressBar

const styles = StyleSheet.create({
  track: {
    height: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: 6,
  },
})

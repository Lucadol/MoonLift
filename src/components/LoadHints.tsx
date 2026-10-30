import { useMemo } from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'

import { useStore } from '../store/StoreContext'
import { makeStyles } from '../theme/ThemeContext'
import { computeLoads, groupRecords } from '../utils/records'

interface LoadHintsProps {
  name: string
  details: string
  color?: string // couleur du texte (écran du timer)
  background?: string
  style?: StyleProp<ViewStyle>
}

// Charges calculées à partir des PR : « Back Squat 75 % → 94 kg »
const LoadHints = ({ name, details, color, background, style }: LoadHintsProps) => {
  const styles = useStyles()
  const { records } = useStore()
  const hints = useMemo(() => computeLoads(name, details, groupRecords(records)), [name, details, records])
  if (hints.length === 0) return null

  return (
    <View style={[styles.row, style]}>
      {hints.map(h => (
        <View key={`${h.movement}-${h.percent}`} style={[styles.hint, background ? { backgroundColor: background } : null]}>
          <Text style={[styles.text, color ? { color } : null]}>
            {h.movement} {h.percent} % → <Text style={styles.load}>{`${h.load} ${h.unit}`}</Text>
          </Text>
        </View>
      ))}
    </View>
  )
}

export default LoadHints

const useStyles = makeStyles(({ colors, fonts }) => ({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  hint: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.text,
  },
  load: {
    fontFamily: fonts.display,
  },
}))

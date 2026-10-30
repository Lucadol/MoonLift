import { Text, View } from 'react-native'

import { makeStyles } from '../theme/ThemeContext'
import Mascot from './mascot/Mascot'
import { PoseName } from './mascot/figure'
import { useCommonStyles } from './styles'

interface ScreenHeaderProps {
  title: string
  eyebrow?: string
  subtitle?: string
  pose: PoseName
  children?: React.ReactNode // liens d'actions sous le titre
}

// En-tête commun : titre à gauche, mascotte à droite
const ScreenHeader = ({ title, eyebrow, subtitle, pose, children }: ScreenHeaderProps) => {
  const common = useCommonStyles()
  const styles = useStyles()
  return (
    <View style={styles.header}>
      <View style={styles.text}>
        {eyebrow && <Text style={common.eyebrow}>{eyebrow}</Text>}
        <Text style={common.title}>{title}</Text>
        {subtitle && <Text style={[common.subtitle, styles.subtitle]}>{subtitle}</Text>}
        {children}
      </View>
      <Mascot pose={pose} size={96} backdrop />
    </View>
  )
}

export default ScreenHeader

const useStyles = makeStyles(() => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  subtitle: {
    marginTop: 4,
  },
}))

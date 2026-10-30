import { memo, useMemo } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Svg, { Circle, Ellipse, Path, Polyline, Rect } from 'react-native-svg'

import { mascotColorsOn, useTheme } from '../../theme/ThemeContext'
import { ColorRole, PoseName, buildFigure, poses } from './figure'

interface MascotProps {
  pose: PoseName
  size?: number
  backdrop?: boolean
  onBackground?: string // couleur de fond sur laquelle la mascotte est posée (écran du timer)
  colors?: Record<ColorRole, string> // couleurs imposées (aperçu des palettes)
  style?: StyleProp<ViewStyle>
}

const Mascot = ({ pose, size = 120, backdrop = false, onBackground, colors: forcedColors, style }: MascotProps) => {
  const theme = useTheme()
  const colors = useMemo(
    () => forcedColors ?? (onBackground ? mascotColorsOn(onBackground) : theme.mascot),
    [forcedColors, onBackground, theme],
  )
  const primitives = useMemo(() => buildFigure(poses[pose], { backdrop }), [pose, backdrop])

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={style} accessibilityElementsHidden>
      {primitives.map((p, i) => {
        switch (p.kind) {
          case 'line':
            return (
              <Polyline
                key={i}
                points={p.points.map(pt => pt.join(',')).join(' ')}
                fill="none"
                stroke={colors[p.color]}
                strokeWidth={p.width}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )
          case 'circle':
            return <Circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.r} fill={colors[p.color]} opacity={p.opacity} />
          case 'ellipse':
            return (
              <Ellipse key={i} cx={p.c[0]} cy={p.c[1]} rx={p.rx} ry={p.ry} fill={colors[p.color]} opacity={p.opacity} />
            )
          case 'rect':
            return <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} fill={colors[p.color]} />
          case 'path':
            return <Path key={i} d={p.d} fill={colors[p.color]} opacity={p.opacity} />
        }
      })}
    </Svg>
  )
}

export default memo(Mascot)

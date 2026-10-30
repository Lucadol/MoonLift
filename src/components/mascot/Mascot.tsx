import { memo, useEffect, useMemo, useRef } from 'react'
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native'
import Svg, { Circle, Ellipse, Path, Polyline, Rect } from 'react-native-svg'

import { mascotColorsOn, useTheme } from '../../theme/ThemeContext'
import { ColorRole, PoseName, buildFigure, poses } from './figure'

interface MascotProps {
  pose: PoseName
  size?: number
  backdrop?: boolean
  onBackground?: string // couleur de fond sur laquelle Moony est posé : il en prend la couleur lisible
  colors?: Record<ColorRole, string> // couleurs imposées (aperçu des palettes)
  phase?: number // phase de la lune (0 → 1) ; par défaut, le croissant habituel
  animated?: boolean // respiration
  style?: StyleProp<ViewStyle>
}

const useNativeDriver = Platform.OS !== 'web'

const Mascot = ({
  pose,
  size = 120,
  backdrop = false,
  onBackground,
  colors: forcedColors,
  phase,
  animated = true,
  style,
}: MascotProps) => {
  const theme = useTheme()
  const colors = useMemo(
    () => forcedColors ?? (onBackground ? mascotColorsOn(onBackground) : theme.mascot),
    [forcedColors, onBackground, theme],
  )

  // Respiration : Moony monte et descend doucement
  const breath = useRef(new Animated.Value(0)).current
  useEffect(() => {
    if (!animated) return
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver }),
        Animated.timing(breath, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.sin), useNativeDriver }),
      ]),
    )
    loop.start()
    return () => loop.stop()
  }, [animated, breath])

  // La phase est arrondie au centième : inutile de redessiner plus souvent
  const roundedPhase = phase === undefined ? undefined : Math.round(phase * 100) / 100
  const primitives = useMemo(
    () => buildFigure(poses[pose], { backdrop, phase: roundedPhase }),
    [pose, backdrop, roundedPhase],
  )
  const translateY = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.018] })

  return (
    <Animated.View style={[{ width: size, height: size, transform: [{ translateY }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden>
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
              return <Ellipse key={i} cx={p.c[0]} cy={p.c[1]} rx={p.rx} ry={p.ry} fill={colors[p.color]} opacity={p.opacity} />
            case 'rect':
              return <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} fill={colors[p.color]} />
            case 'path':
              return <Path key={i} d={p.d} fill={colors[p.color]} opacity={p.opacity} />
          }
        })}
      </Svg>
    </Animated.View>
  )
}

export default memo(Mascot)

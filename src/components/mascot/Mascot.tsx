import { memo, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, Platform, StyleProp, ViewStyle } from 'react-native'
import Svg, { Circle, Ellipse, Path, Polyline, Rect } from 'react-native-svg'

import { mascotColorsOn, useTheme } from '../../theme/ThemeContext'
import { ColorRole, PoseName, buildFigure, poses } from './figure'

interface MascotProps {
  pose: PoseName
  size?: number
  backdrop?: boolean
  onBackground?: string // couleur de fond sur laquelle Moony est posé (écran du timer)
  colors?: Record<ColorRole, string> // couleurs imposées (aperçu des palettes)
  animated?: boolean // respiration + clignement des yeux
  style?: StyleProp<ViewStyle>
}

const useNativeDriver = Platform.OS !== 'web'

const Mascot = ({
  pose,
  size = 120,
  backdrop = false,
  onBackground,
  colors: forcedColors,
  animated = true,
  style,
}: MascotProps) => {
  const theme = useTheme()
  const colors = useMemo(
    () => forcedColors ?? (onBackground ? mascotColorsOn(theme, onBackground) : theme.mascot),
    [forcedColors, onBackground, theme],
  )

  // Clignement des yeux de temps en temps (seulement quand les yeux sont ouverts)
  const [blinking, setBlinking] = useState(false)
  const canBlink = animated && poses[pose].face === 'happy'
  useEffect(() => {
    if (!canBlink) return
    let timeout: ReturnType<typeof setTimeout>
    const schedule = () => {
      timeout = setTimeout(() => {
        setBlinking(true)
        timeout = setTimeout(() => {
          setBlinking(false)
          schedule()
        }, 150)
      }, 2200 + Math.random() * 3000)
    }
    schedule()
    return () => clearTimeout(timeout)
  }, [canBlink])

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

  const primitives = useMemo(
    () => buildFigure(poses[pose], { backdrop, face: blinking ? 'blink' : undefined }),
    [pose, backdrop, blinking],
  )
  const translateY = breath.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.018] })
  const paint = (c: ColorRole | 'none') => (c === 'none' ? 'none' : colors[c])

  return (
    <Animated.View style={[{ width: size, height: size, transform: [{ translateY }] }, style]}>
      <Svg width={size} height={size} viewBox="0 0 100 100" accessibilityElementsHidden>
        {primitives.map((p, i) => {
          const stroke = p.kind !== 'line' && p.stroke ? { stroke: colors[p.stroke], strokeWidth: p.sw ?? 1, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const } : {}
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
              return <Circle key={i} cx={p.c[0]} cy={p.c[1]} r={p.r} fill={paint(p.color)} opacity={p.opacity} {...stroke} />
            case 'ellipse':
              return (
                <Ellipse key={i} cx={p.c[0]} cy={p.c[1]} rx={p.rx} ry={p.ry} fill={paint(p.color)} opacity={p.opacity} {...stroke} />
              )
            case 'rect':
              return <Rect key={i} x={p.x} y={p.y} width={p.w} height={p.h} rx={p.r} fill={paint(p.color)} {...stroke} />
            case 'path':
              return <Path key={i} d={p.d} fill={paint(p.color)} opacity={p.opacity} {...stroke} />
          }
        })}
      </Svg>
    </Animated.View>
  )
}

export default memo(Mascot)

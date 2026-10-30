import { useMemo, useState } from 'react'
import { LayoutChangeEvent, Text, View } from 'react-native'
import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg'

import { mix } from '../theme/palettes'
import { makeStyles, useTheme } from '../theme/ThemeContext'
import { PersonalRecord } from '../types'
import { formatRecordValue } from '../utils/records'

interface ProgressChartProps {
  records: PersonalRecord[] // même unité, dans n'importe quel ordre
}

const HEIGHT = 180
const PAD = { top: 22, right: 16, bottom: 26, left: 44 }

// Graduations « rondes » : 3 ou 4 valeurs propres couvrant l'étendue
const niceTicks = (min: number, max: number) => {
  const span = max - min || Math.max(1, Math.abs(max) * 0.1)
  const rough = span / 3
  const pow = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 2.5, 5, 10].map(m => m * pow).find(s => s >= rough) ?? rough
  const start = Math.floor(min / step) * step
  const end = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = start; v <= end + step / 2; v += step) ticks.push(Math.round(v * 100) / 100)
  return ticks
}

const shortDate = (iso: string) => {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y.slice(2)}`
}

// Progression d'un PR dans le temps : une seule série, ligne 2 px, points avec anneau, info au toucher
const ProgressChart = ({ records }: ProgressChartProps) => {
  const theme = useTheme()
  const styles = useStyles()
  const [width, setWidth] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)

  const points = useMemo(() => [...records].sort((a, b) => a.date.localeCompare(b.date)), [records])
  // Ocre assombri en clair pour garder un contraste ≥ 3:1 sur la surface
  const lineColor = theme.mode === 'light' ? mix(theme.colors.tertiary, theme.colors.text, 0.3) : theme.colors.tertiary
  const unit = points[0]?.unit

  if (points.length < 2 || !unit) return null

  const values = points.map(p => p.value)
  const ticks = niceTicks(Math.min(...values), Math.max(...values))
  const [yMin, yMax] = [ticks[0], ticks[ticks.length - 1]]
  const times = points.map(p => new Date(p.date).getTime())
  const [tMin, tMax] = [Math.min(...times), Math.max(...times)]
  const plotW = Math.max(1, width - PAD.left - PAD.right)
  const plotH = HEIGHT - PAD.top - PAD.bottom
  const x = (t: number) => PAD.left + (tMax === tMin ? plotW / 2 : ((t - tMin) / (tMax - tMin)) * plotW)
  const y = (v: number) => PAD.top + (yMax === yMin ? plotH / 2 : (1 - (v - yMin) / (yMax - yMin)) * plotH)
  const xy = points.map((p, i) => [x(times[i]), y(p.value)] as const)
  const line = xy.map(([px, py], i) => `${i ? 'L' : 'M'} ${px} ${py}`).join(' ')
  const area = `${line} L ${xy[xy.length - 1][0]} ${PAD.top + plotH} L ${xy[0][0]} ${PAD.top + plotH} Z`
  const tickLabel = (v: number) => (unit === 'time' ? formatRecordValue({ value: v, unit }) : `${v}`)
  const last = points.length - 1
  const focus = selected ?? last

  return (
    <View onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && (
        <Svg width={width} height={HEIGHT}>
          {ticks.map(t => (
            <Line key={t} x1={PAD.left} x2={width - PAD.right} y1={y(t)} y2={y(t)} stroke={theme.colors.border} strokeWidth={1} />
          ))}
          {ticks.map(t => (
            <SvgText
              key={`l${t}`}
              x={PAD.left - 8}
              y={y(t) + 4}
              fontSize={11}
              fill={theme.colors.textMuted}
              textAnchor="end"
              fontFamily={theme.fonts.medium}
            >
              {tickLabel(t)}
            </SvgText>
          ))}
          <SvgText x={PAD.left} y={HEIGHT - 6} fontSize={11} fill={theme.colors.textMuted} fontFamily={theme.fonts.medium}>
            {shortDate(points[0].date)}
          </SvgText>
          <SvgText
            x={width - PAD.right}
            y={HEIGHT - 6}
            fontSize={11}
            fill={theme.colors.textMuted}
            textAnchor="end"
            fontFamily={theme.fonts.medium}
          >
            {shortDate(points[last].date)}
          </SvgText>
          <Path d={area} fill={lineColor} opacity={0.1} />
          <Path d={line} fill="none" stroke={lineColor} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
          {selected !== null && (
            <Line
              x1={xy[selected][0]}
              x2={xy[selected][0]}
              y1={PAD.top}
              y2={PAD.top + plotH}
              stroke={theme.colors.textMuted}
              strokeWidth={1}
            />
          )}
          {xy.map(([px, py], i) => (
            <Circle
              key={points[i].id}
              cx={px}
              cy={py}
              r={i === focus ? 5.5 : 4}
              fill={lineColor}
              stroke={theme.colors.surface}
              strokeWidth={2}
            />
          ))}
          {/* Zones de toucher plus grandes que les points */}
          {xy.map(([px, py], i) => (
            <Circle
              key={`hit${points[i].id}`}
              cx={px}
              cy={py}
              r={16}
              fill="transparent"
              onPress={() => setSelected(s => (s === i ? null : i))}
            />
          ))}
        </Svg>
      )}
      <View style={styles.caption}>
        <Text style={styles.captionValue}>{formatRecordValue(points[focus])}</Text>
        <Text style={styles.captionDate}>
          {selected === null ? 'Dernière entrée' : 'Le'} · {shortDate(points[focus].date)}
        </Text>
      </View>
    </View>
  )
}

export default ProgressChart

const useStyles = makeStyles(({ colors, fonts }) => ({
  caption: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 4,
  },
  captionValue: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.text,
  },
  captionDate: {
    fontFamily: fonts.medium,
    fontSize: 13,
    color: colors.textMuted,
  },
}))

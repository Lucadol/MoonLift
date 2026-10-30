// "Moony", la mascotte de l'app : un petit athlète à tête de lune, dessiné au trait.
// Ce module est purement géométrique (aucune dépendance React) : il transforme une pose en
// primitives SVG, rendues ensuite par <Mascot /> avec les couleurs du thème.

export type Point = [number, number]

export type ColorRole =
  | 'ink' // contours et visage
  | 'fill' // corps
  | 'farFill' // membres à l'arrière-plan
  | 'moon' // croissant de lune sur la tête
  | 'band' // bandeau de sport
  | 'shoe' // baskets
  | 'accent' // disques de la barre, kettlebell, tapis
  | 'gold' // trophée, podium
  | 'cheek' // joues
  | 'sweat' // goutte de sueur
  | 'shadow'
  | 'backdrop'

interface Stroke {
  stroke?: ColorRole
  sw?: number // épaisseur du contour
}

export type Primitive =
  | { kind: 'line'; points: Point[]; width: number; color: ColorRole }
  | ({ kind: 'circle'; c: Point; r: number; color: ColorRole | 'none'; opacity?: number } & Stroke)
  | ({ kind: 'ellipse'; c: Point; rx: number; ry: number; color: ColorRole | 'none'; opacity?: number } & Stroke)
  | ({ kind: 'rect'; x: number; y: number; w: number; h: number; r: number; color: ColorRole | 'none' } & Stroke)
  | ({ kind: 'path'; d: string; color: ColorRole | 'none'; opacity?: number } & Stroke)

// Expressions du visage
export type Face = 'happy' | 'effort' | 'cool' | 'zen' | 'tired' | 'proud' | 'blink'

type Prop =
  | { type: 'barbell'; a: Point; b: Point }
  | { type: 'kettlebell'; at: Point }
  | { type: 'trophy'; at: Point }
  | { type: 'podium' }
  | { type: 'mat' }

export interface Pose {
  head: Point
  neck: Point
  hip: Point
  // Bras et jambe "loin" (dessinés derrière, en plus foncé) puis "près"
  farArm: [Point, Point]
  nearArm: [Point, Point]
  farLeg: [Point, Point]
  nearLeg: [Point, Point]
  facing: 1 | -1 // côté vers lequel regarde Moony
  face: Face
  props?: Prop[]
}

export type PoseName =
  | 'overhead'
  | 'run'
  | 'jack'
  | 'wave'
  | 'squat'
  | 'deadlift'
  | 'swingUp'
  | 'swingDown'
  | 'rest'
  | 'restBreath'
  | 'trophy'
  | 'flex'
  | 'meditate'
  | 'sleep'

export const poses: Record<PoseName, Pose> = {
  // Arraché / jerk verrouillé au-dessus de la tête : c'est aussi le logo
  overhead: {
    head: [50, 33],
    neck: [50, 45],
    hip: [50, 65],
    farArm: [[31, 33], [29, 14]],
    nearArm: [[69, 33], [71, 14]],
    farLeg: [[42, 78], [37, 90]],
    nearLeg: [[58, 78], [63, 90]],
    facing: 1,
    face: 'proud',
    props: [{ type: 'barbell', a: [9, 14], b: [91, 14] }],
  },
  run: {
    head: [57, 25],
    neck: [53, 38],
    hip: [46, 59],
    farArm: [[42, 47], [33, 53]],
    nearArm: [[62, 49], [71, 41]],
    farLeg: [[37, 72], [25, 77]],
    nearLeg: [[60, 71], [57, 88]],
    facing: 1,
    face: 'happy',
  },
  jack: {
    head: [50, 27],
    neck: [50, 40],
    hip: [50, 62],
    farArm: [[35, 31], [28, 18]],
    nearArm: [[65, 31], [72, 18]],
    farLeg: [[41, 76], [33, 89]],
    nearLeg: [[59, 76], [67, 89]],
    facing: 1,
    face: 'happy',
  },
  // Salut de la main
  wave: {
    head: [48, 27],
    neck: [48, 40],
    hip: [48, 62],
    farArm: [[37, 52], [36, 63]],
    nearArm: [[64, 39], [70, 24]],
    farLeg: [[44, 76], [42, 89]],
    nearLeg: [[53, 76], [55, 89]],
    facing: 1,
    face: 'happy',
  },
  // Back squat, barre sur les épaules
  squat: {
    head: [42, 40],
    neck: [46, 52],
    hip: [63, 70],
    farArm: [[36, 58], [41, 47]],
    nearArm: [[38, 60], [44, 48]],
    farLeg: [[44, 72], [52, 89]],
    nearLeg: [[47, 74], [56, 89]],
    facing: -1,
    face: 'effort',
    props: [{ type: 'barbell', a: [20, 48], b: [76, 48] }],
  },
  deadlift: {
    head: [50, 26],
    neck: [50, 39],
    hip: [50, 61],
    farArm: [[44, 50], [42, 63]],
    nearArm: [[56, 50], [58, 63]],
    farLeg: [[46, 76], [44, 89]],
    nearLeg: [[54, 76], [56, 89]],
    facing: 1,
    face: 'effort',
    props: [{ type: 'barbell', a: [15, 63], b: [85, 63] }],
  },
  swingUp: {
    head: [45, 28],
    neck: [47, 40],
    hip: [49, 62],
    farArm: [[59, 41], [71, 39]],
    nearArm: [[60, 43], [72, 41]],
    farLeg: [[46, 76], [43, 89]],
    nearLeg: [[53, 76], [54, 89]],
    facing: 1,
    face: 'effort',
    props: [{ type: 'kettlebell', at: [76, 41] }],
  },
  swingDown: {
    head: [64, 42],
    neck: [57, 51],
    hip: [40, 63],
    farArm: [[53, 63], [50, 74]],
    nearArm: [[55, 64], [52, 75]],
    farLeg: [[47, 77], [40, 89]],
    nearLeg: [[51, 77], [48, 89]],
    facing: 1,
    face: 'effort',
    props: [{ type: 'kettlebell', at: [51, 79] }],
  },
  // Repos : mains sur les hanches
  rest: {
    head: [50, 27],
    neck: [50, 40],
    hip: [50, 62],
    farArm: [[35, 50], [42, 60]],
    nearArm: [[65, 50], [58, 60]],
    farLeg: [[46, 76], [44, 89]],
    nearLeg: [[54, 76], [56, 89]],
    facing: 1,
    face: 'tired',
  },
  restBreath: {
    head: [50, 29],
    neck: [50, 42],
    hip: [50, 63],
    farArm: [[34, 51], [42, 61]],
    nearArm: [[66, 51], [58, 61]],
    farLeg: [[46, 77], [44, 89]],
    nearLeg: [[54, 77], [56, 89]],
    facing: 1,
    face: 'tired',
  },
  trophy: {
    head: [48, 24],
    neck: [49, 36],
    hip: [50, 57],
    farArm: [[38, 45], [40, 55]],
    nearArm: [[62, 28], [67, 16]],
    farLeg: [[46, 69], [44, 80]],
    nearLeg: [[54, 69], [56, 80]],
    facing: 1,
    face: 'proud',
    props: [{ type: 'podium' }, { type: 'trophy', at: [67, 13] }],
  },
  // Double biceps
  flex: {
    head: [50, 26],
    neck: [50, 39],
    hip: [50, 61],
    farArm: [[32, 40], [30, 26]],
    nearArm: [[68, 40], [70, 26]],
    farLeg: [[44, 76], [39, 89]],
    nearLeg: [[56, 76], [61, 89]],
    facing: 1,
    face: 'cool',
  },
  // Assis en tailleur sur un tapis
  meditate: {
    head: [50, 37],
    neck: [50, 50],
    hip: [50, 71],
    farArm: [[37, 61], [33, 73]],
    nearArm: [[63, 61], [67, 73]],
    farLeg: [[30, 80], [56, 84]],
    nearLeg: [[70, 80], [44, 84]],
    facing: 1,
    face: 'zen',
    props: [{ type: 'mat' }],
  },
  // Allongé, il fait la sieste (écrans vides)
  sleep: {
    head: [24, 74],
    neck: [33, 79],
    hip: [56, 80],
    farArm: [[42, 70], [36, 66]],
    nearArm: [[44, 86], [53, 85]],
    farLeg: [[68, 74], [80, 80]],
    nearLeg: [[70, 82], [84, 85]],
    facing: -1,
    face: 'zen',
    props: [{ type: 'mat' }],
  },
}

const HEAD_R = 10
const LIMB_W = 5.6
const TORSO_W = 12
const OUTLINE = 1.9 // épaisseur du trait de contour

const f = (n: number) => n.toFixed(2)

// Un membre « au trait » : un trait épais d'encre, puis le remplissage par-dessus
const tube = (points: Point[], width: number, fill: ColorRole): Primitive[] => [
  { kind: 'line', points, width: width + OUTLINE * 2, color: 'ink' },
  { kind: 'line', points, width, color: fill },
]

// Visage : yeux, bouche, joues, selon l'expression
const facePrimitives = (cx: number, cy: number, face: Face): Primitive[] => {
  const out: Primitive[] = []
  const eyeY = cy - 0.5
  const [lx, rx] = [cx - 3.4, cx + 3.4]
  const stroke = (d: string, sw = 1.5): Primitive => ({ kind: 'path', d, color: 'none', stroke: 'ink', sw })

  // Yeux
  switch (face) {
    case 'happy':
    case 'tired':
      if (face === 'tired') {
        out.push(stroke(`M ${lx - 1.6} ${eyeY} L ${lx + 1.6} ${eyeY}`), stroke(`M ${rx - 1.6} ${eyeY} L ${rx + 1.6} ${eyeY}`))
      } else {
        out.push(
          { kind: 'ellipse', c: [lx, eyeY], rx: 1.25, ry: 1.65, color: 'ink' },
          { kind: 'ellipse', c: [rx, eyeY], rx: 1.25, ry: 1.65, color: 'ink' },
        )
      }
      break
    case 'effort':
      // > <
      out.push(
        stroke(`M ${lx - 1.5} ${eyeY - 1.4} L ${lx + 1.2} ${eyeY} L ${lx - 1.5} ${eyeY + 1.4}`),
        stroke(`M ${rx + 1.5} ${eyeY - 1.4} L ${rx - 1.2} ${eyeY} L ${rx + 1.5} ${eyeY + 1.4}`),
      )
      break
    case 'proud':
      // ^ ^
      out.push(
        stroke(`M ${lx - 1.6} ${eyeY + 0.8} Q ${lx} ${eyeY - 1.8} ${lx + 1.6} ${eyeY + 0.8}`),
        stroke(`M ${rx - 1.6} ${eyeY + 0.8} Q ${rx} ${eyeY - 1.8} ${rx + 1.6} ${eyeY + 0.8}`),
      )
      break
    case 'zen':
    case 'blink':
      // ‿ ‿
      out.push(
        stroke(`M ${lx - 1.6} ${eyeY - 0.3} Q ${lx} ${eyeY + 1.6} ${lx + 1.6} ${eyeY - 0.3}`),
        stroke(`M ${rx - 1.6} ${eyeY - 0.3} Q ${rx} ${eyeY + 1.6} ${rx + 1.6} ${eyeY - 0.3}`),
      )
      break
    case 'cool':
      // Lunettes de soleil
      out.push(
        { kind: 'path', d: `M ${cx - 7} ${eyeY - 2} L ${cx + 7} ${eyeY - 2}`, color: 'none', stroke: 'ink', sw: 1.2 },
        { kind: 'path', d: `M ${lx - 2.8} ${eyeY - 2} L ${lx + 2.6} ${eyeY - 2} L ${lx + 2.1} ${eyeY + 1.2} Q ${lx} ${eyeY + 2.8} ${lx - 2.3} ${eyeY + 1.2} Z`, color: 'ink' },
        { kind: 'path', d: `M ${rx - 2.6} ${eyeY - 2} L ${rx + 2.8} ${eyeY - 2} L ${rx + 2.3} ${eyeY + 1.2} Q ${rx} ${eyeY + 2.8} ${rx - 2.1} ${eyeY + 1.2} Z`, color: 'ink' },
      )
      break
  }

  // Joues
  if (face !== 'cool') {
    out.push(
      { kind: 'ellipse', c: [lx - 1.6, cy + 2.6], rx: 1.7, ry: 1.1, color: 'cheek', opacity: 0.55 },
      { kind: 'ellipse', c: [rx + 1.6, cy + 2.6], rx: 1.7, ry: 1.1, color: 'cheek', opacity: 0.55 },
    )
  }

  // Bouche
  const my = cy + 3.6
  switch (face) {
    case 'happy':
    case 'blink':
      out.push(stroke(`M ${cx - 2.4} ${my - 0.4} Q ${cx} ${my + 2.4} ${cx + 2.4} ${my - 0.4}`))
      break
    case 'proud':
      out.push({ kind: 'path', d: `M ${cx - 3} ${my - 0.8} Q ${cx} ${my + 4} ${cx + 3} ${my - 0.8} Z`, color: 'ink' })
      break
    case 'effort':
      out.push({ kind: 'rect', x: cx - 2.4, y: my - 1, w: 4.8, h: 2.4, r: 1, color: 'fill', stroke: 'ink', sw: 1.2 })
      break
    case 'tired':
      out.push({ kind: 'ellipse', c: [cx, my + 0.4], rx: 1.3, ry: 1.7, color: 'ink' })
      break
    case 'zen':
      out.push(stroke(`M ${cx - 1.6} ${my} Q ${cx} ${my + 1.4} ${cx + 1.6} ${my}`))
      break
    case 'cool':
      out.push(stroke(`M ${cx - 2.6} ${my + 0.4} Q ${cx + 0.5} ${my + 2} ${cx + 2.8} ${my - 0.8}`))
      break
  }

  // Goutte de sueur
  if (face === 'tired' || face === 'effort') {
    const [sx, sy] = [cx + 9.5, cy - 6]
    out.push({
      kind: 'path',
      d: `M ${sx} ${sy - 3} Q ${sx + 2.3} ${sy + 0.6} ${sx} ${sy + 1.6} Q ${sx - 2.3} ${sy + 0.6} ${sx} ${sy - 3} Z`,
      color: 'sweat',
      stroke: 'ink',
      sw: 0.9,
    })
  }
  return out
}

// Tête : disque, croissant de lune à l'arrière, bandeau, contour et visage
const moonHead = ([cx, cy]: Point, facing: 1 | -1, face: Face): Primitive[] => {
  const r = HEAD_R
  const d = r * 0.62 // décalage du cercle qui "creuse" le croissant (plus petit = plus fin)
  const h = Math.sqrt(r * r - (d / 2) * (d / 2))
  // Le croissant est à l'arrière de la tête, vers le haut
  const angle = (facing === 1 ? 35 : 145) * (Math.PI / 180)
  const rot = ([x, y]: Point): Point => [
    cx + x * Math.cos(angle) - y * Math.sin(angle),
    cy + x * Math.sin(angle) + y * Math.cos(angle),
  ]
  const p1 = rot([d / 2, -h])
  const p2 = rot([d / 2, h])
  const crescent =
    `M ${f(p1[0])} ${f(p1[1])} ` +
    `A ${r} ${r} 0 1 0 ${f(p2[0])} ${f(p2[1])} ` +
    `A ${r} ${r} 0 0 1 ${f(p1[0])} ${f(p1[1])} Z`

  // Bandeau : une corde du cercle un peu au-dessus des yeux, avec ses deux pans qui flottent
  const by = cy - 5.2
  const bx = Math.sqrt(r * r - (by - cy) ** 2)
  const tail = cx - facing * bx
  const band: Primitive[] = [
    { kind: 'line', points: [[cx - bx + 0.6, by], [cx + bx - 0.6, by]], width: 3.4 + OUTLINE * 1.4, color: 'ink' },
    { kind: 'line', points: [[cx - bx + 0.6, by], [cx + bx - 0.6, by]], width: 3.4, color: 'band' },
    {
      kind: 'path',
      d: `M ${tail} ${by} q ${-facing * 4} ${-1} ${-facing * 6.5} ${2.5} q ${facing * 3} ${-0.4} ${facing * 4.5} ${-1.2} Z`,
      color: 'band',
      stroke: 'ink',
      sw: 1.1,
    },
  ]

  const faceX = cx + facing * 1.2
  return [
    { kind: 'circle', c: [cx, cy], r, color: 'fill' },
    { kind: 'path', d: crescent, color: 'moon' },
    { kind: 'circle', c: [cx, cy], r, color: 'none', stroke: 'ink', sw: OUTLINE },
    ...band,
    ...facePrimitives(faceX, cy + 1.5, face),
  ]
}

const propPrimitives = (prop: Prop, layer: 'back' | 'front'): Primitive[] => {
  switch (prop.type) {
    case 'barbell': {
      if (layer === 'back') return []
      const [a, b] = [prop.a, prop.b]
      const plate = (x: number, y: number, w: number, h: number): Primitive => ({
        kind: 'rect',
        x: x - w / 2,
        y: y - h / 2,
        w,
        h,
        r: 1.8,
        color: 'accent',
        stroke: 'ink',
        sw: 1.3,
      })
      return [
        { kind: 'line', points: [a, b], width: 2.4, color: 'ink' },
        plate(a[0] + 4, a[1], 5, 17),
        plate(a[0] + 8.5, a[1], 3.6, 11),
        plate(b[0] - 4, b[1], 5, 17),
        plate(b[0] - 8.5, b[1], 3.6, 11),
      ]
    }
    case 'kettlebell': {
      if (layer === 'back') return []
      const [x, y] = prop.at
      return [
        { kind: 'path', d: `M ${x - 3.2} ${y + 3} L ${x - 3.2} ${y - 0.5} Q ${x} ${y - 3} ${x + 3.2} ${y - 0.5} L ${x + 3.2} ${y + 3}`, color: 'none', stroke: 'ink', sw: 2 },
        { kind: 'circle', c: [x, y + 6.5], r: 5.6, color: 'accent', stroke: 'ink', sw: 1.4 },
      ]
    }
    case 'trophy': {
      if (layer === 'back') return []
      const [x, y] = prop.at
      return [
        { kind: 'path', d: `M ${x - 6} ${y - 8} L ${x + 6} ${y - 8} L ${x + 5} ${y - 3} A 5 5 0 0 1 ${x - 5} ${y - 3} Z`, color: 'gold', stroke: 'ink', sw: 1.2 },
        { kind: 'rect', x: x - 1, y: y - 1.5, w: 2, h: 3.5, r: 0.5, color: 'gold', stroke: 'ink', sw: 0.9 },
        { kind: 'rect', x: x - 4, y: y + 1.8, w: 8, h: 2.6, r: 1, color: 'gold', stroke: 'ink', sw: 1 },
      ]
    }
    case 'podium':
      return layer === 'back'
        ? [
            { kind: 'rect', x: 12, y: 86, w: 18, h: 7, r: 2, color: 'farFill', stroke: 'ink', sw: 1.3 },
            { kind: 'rect', x: 70, y: 88, w: 18, h: 5, r: 2, color: 'farFill', stroke: 'ink', sw: 1.3 },
            { kind: 'rect', x: 30, y: 80.5, w: 40, h: 12.5, r: 2, color: 'gold', stroke: 'ink', sw: 1.3 },
          ]
        : []
    case 'mat':
      return layer === 'back'
        ? [{ kind: 'rect', x: 12, y: 86, w: 76, h: 5, r: 2.5, color: 'accent', stroke: 'ink', sw: 1.3 }]
        : []
  }
}

// Basket au bout de la jambe, orientée vers l'avant
const shoe = (foot: Point, knee: Point, facing: 1 | -1, fill: ColorRole): Primitive => {
  const dir = Math.abs(foot[1] - knee[1]) > Math.abs(foot[0] - knee[0]) ? facing : Math.sign(foot[0] - knee[0]) || facing
  return {
    kind: 'ellipse',
    c: [foot[0] + dir * 1.6, foot[1] + 0.6],
    rx: 4.4,
    ry: 2.6,
    color: fill,
    stroke: 'ink',
    sw: OUTLINE * 0.8,
  }
}

const hand = (point: Point, fill: ColorRole): Primitive => ({
  kind: 'circle',
  c: point,
  r: 3.1,
  color: fill,
  stroke: 'ink',
  sw: OUTLINE * 0.8,
})

export const buildFigure = (
  pose: Pose,
  options: { backdrop?: boolean; face?: Face } = {},
): Primitive[] => {
  const props = pose.props ?? []
  const groundY = props.some(p => p.type === 'podium') ? 81 : 91
  const out: Primitive[] = []
  if (options.backdrop) out.push({ kind: 'circle', c: [50, 54], r: 43, color: 'backdrop' })
  out.push({ kind: 'ellipse', c: [50, groundY + 1], rx: 22, ry: 2.5, color: 'shadow', opacity: 0.12 })
  props.forEach(p => out.push(...propPrimitives(p, 'back')))

  // Les bras partent des épaules, un peu sous le haut du tronc
  const shoulder: Point = [
    pose.neck[0] + (pose.hip[0] - pose.neck[0]) * 0.14,
    pose.neck[1] + (pose.hip[1] - pose.neck[1]) * 0.14,
  ]

  // Membres de l'arrière-plan
  out.push(...tube([pose.hip, ...pose.farLeg], LIMB_W, 'farFill'))
  out.push(shoe(pose.farLeg[1], pose.farLeg[0], pose.facing, 'shoe'))
  out.push(...tube([shoulder, ...pose.farArm], LIMB_W, 'farFill'))
  out.push(hand(pose.farArm[1], 'farFill'))

  // Tronc
  out.push(...tube([pose.neck, pose.hip], TORSO_W, 'fill'))

  // Membres du premier plan
  out.push(...tube([pose.hip, ...pose.nearLeg], LIMB_W, 'fill'))
  out.push(shoe(pose.nearLeg[1], pose.nearLeg[0], pose.facing, 'shoe'))
  out.push(...tube([shoulder, ...pose.nearArm], LIMB_W, 'fill'))
  out.push(hand(pose.nearArm[1], 'fill'))

  // Tête légèrement détachée du tronc
  const [dx, dy] = [pose.head[0] - pose.neck[0], pose.head[1] - pose.neck[1]]
  const len = Math.hypot(dx, dy) || 1
  const head: Point = [pose.head[0] + (dx / len) * 1.5, pose.head[1] + (dy / len) * 1.5]
  out.push(...moonHead(head, pose.facing, options.face ?? pose.face))

  props.forEach(p => out.push(...propPrimitives(p, 'front')))
  return out
}

// Rendu SVG texte (utilisé pour générer l'icône de l'application et les aperçus)
export const figureToSvg = (
  primitives: Primitive[],
  colors: Record<ColorRole, string>,
  size = 200,
  background?: string,
) => {
  const paint = (c: ColorRole | 'none') => (c === 'none' ? 'none' : colors[c])
  const strokeAttr = (p: Stroke) => (p.stroke ? ` stroke="${colors[p.stroke]}" stroke-width="${p.sw ?? 1}" stroke-linejoin="round" stroke-linecap="round"` : '')
  const body = primitives
    .map(p => {
      const op = 'opacity' in p && p.opacity !== undefined ? ` opacity="${p.opacity}"` : ''
      switch (p.kind) {
        case 'line':
          return `<polyline points="${p.points.map(pt => pt.join(',')).join(' ')}" fill="none" stroke="${colors[p.color]}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"/>`
        case 'circle':
          return `<circle cx="${p.c[0]}" cy="${p.c[1]}" r="${p.r}" fill="${paint(p.color)}"${op}${strokeAttr(p)}/>`
        case 'ellipse':
          return `<ellipse cx="${p.c[0]}" cy="${p.c[1]}" rx="${p.rx}" ry="${p.ry}" fill="${paint(p.color)}"${op}${strokeAttr(p)}/>`
        case 'rect':
          return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${p.r}" fill="${paint(p.color)}"${strokeAttr(p)}/>`
        case 'path':
          return `<path d="${p.d}" fill="${paint(p.color)}"${op}${strokeAttr(p)}/>`
      }
    })
    .join('')
  const bg = background ? `<rect width="100" height="100" fill="${background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${bg}${body}</svg>`
}

// "Moony", la mascotte MoonLift : un bonhomme à tête de lune dessiné avec des traits arrondis.
// Ce module est purement géométrique (aucune dépendance React) : il transforme une pose en
// primitives SVG, rendues ensuite par <Mascot /> avec les couleurs du thème.

export type Point = [number, number]

export type ColorRole = 'ink' | 'far' | 'moon' | 'moonShade' | 'accent' | 'gold' | 'shadow' | 'backdrop'

export type Primitive =
  | { kind: 'line'; points: Point[]; width: number; color: ColorRole }
  | { kind: 'circle'; c: Point; r: number; color: ColorRole; opacity?: number }
  | { kind: 'ellipse'; c: Point; rx: number; ry: number; color: ColorRole; opacity?: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r: number; color: ColorRole }
  | { kind: 'path'; d: string; color: ColorRole; opacity?: number }

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
  // Bras et jambe "loin" (dessinés en clair derrière) puis "près"
  farArm: [Point, Point]
  nearArm: [Point, Point]
  farLeg: [Point, Point]
  nearLeg: [Point, Point]
  facing: 1 | -1 // sens du croissant de lune
  props?: Prop[]
}

export type PoseName =
  | 'overhead'
  | 'run'
  | 'jack'
  | 'squat'
  | 'deadlift'
  | 'swingUp'
  | 'swingDown'
  | 'rest'
  | 'restBreath'
  | 'trophy'
  | 'flex'
  | 'meditate'

export const poses: Record<PoseName, Pose> = {
  // Arraché / jerk verrouillé au-dessus de la tête : c'est aussi le logo
  overhead: {
    head: [50, 30],
    neck: [50, 41],
    hip: [50, 63],
    farArm: [[35, 32], [31, 17]],
    nearArm: [[65, 32], [69, 17]],
    farLeg: [[42, 77], [37, 91]],
    nearLeg: [[58, 77], [63, 91]],
    facing: 1,
    props: [{ type: 'barbell', a: [11, 17], b: [89, 17] }],
  },
  run: {
    head: [56, 22],
    neck: [53, 33],
    hip: [46, 56],
    farArm: [[42, 43], [33, 50]],
    nearArm: [[61, 45], [70, 37]],
    farLeg: [[37, 70], [24, 76]],
    nearLeg: [[60, 68], [57, 87]],
    facing: 1,
  },
  jack: {
    head: [50, 24],
    neck: [50, 35],
    hip: [50, 59],
    farArm: [[35, 27], [28, 14]],
    nearArm: [[65, 27], [72, 14]],
    farLeg: [[41, 75], [33, 91]],
    nearLeg: [[59, 75], [67, 91]],
    facing: 1,
  },
  // Back squat, barre sur les épaules
  squat: {
    head: [43, 40],
    neck: [46, 50],
    hip: [63, 70],
    farArm: [[37, 56], [42, 46]],
    nearArm: [[39, 58], [45, 47]],
    farLeg: [[44, 72], [52, 91]],
    nearLeg: [[47, 74], [56, 91]],
    facing: -1,
    props: [{ type: 'barbell', a: [22, 46], b: [74, 46] }],
  },
  deadlift: {
    head: [50, 24],
    neck: [50, 35],
    hip: [50, 59],
    farArm: [[44, 48], [42, 61]],
    nearArm: [[56, 48], [58, 61]],
    farLeg: [[46, 75], [44, 91]],
    nearLeg: [[54, 75], [56, 91]],
    facing: 1,
    props: [{ type: 'barbell', a: [18, 61], b: [82, 61] }],
  },
  swingUp: {
    head: [46, 25],
    neck: [47, 36],
    hip: [49, 59],
    farArm: [[59, 37], [71, 35]],
    nearArm: [[60, 39], [72, 37]],
    farLeg: [[46, 75], [43, 91]],
    nearLeg: [[53, 75], [54, 91]],
    facing: 1,
    props: [{ type: 'kettlebell', at: [76, 37] }],
  },
  swingDown: {
    head: [62, 41],
    neck: [57, 49],
    hip: [40, 61],
    farArm: [[53, 61], [50, 73]],
    nearArm: [[55, 62], [52, 74]],
    farLeg: [[47, 76], [40, 91]],
    nearLeg: [[51, 76], [48, 91]],
    facing: 1,
    props: [{ type: 'kettlebell', at: [51, 79] }],
  },
  // Repos : mains sur les hanches
  rest: {
    head: [50, 25],
    neck: [50, 36],
    hip: [50, 60],
    farArm: [[36, 47], [43, 58]],
    nearArm: [[64, 47], [57, 58]],
    farLeg: [[46, 76], [44, 91]],
    nearLeg: [[54, 76], [56, 91]],
    facing: 1,
  },
  restBreath: {
    head: [50, 27],
    neck: [50, 38],
    hip: [50, 61],
    farArm: [[35, 48], [43, 59]],
    nearArm: [[65, 48], [57, 59]],
    farLeg: [[46, 76], [44, 91]],
    nearLeg: [[54, 76], [56, 91]],
    facing: 1,
  },
  trophy: {
    head: [50, 20],
    neck: [50, 31],
    hip: [50, 54],
    farArm: [[38, 40], [41, 50]],
    nearArm: [[62, 23], [66, 13]],
    farLeg: [[46, 68], [44, 81]],
    nearLeg: [[54, 68], [56, 81]],
    facing: 1,
    props: [{ type: 'podium' }, { type: 'trophy', at: [66, 11] }],
  },
  // Double biceps
  flex: {
    head: [50, 24],
    neck: [50, 35],
    hip: [50, 59],
    farArm: [[33, 36], [31, 22]],
    nearArm: [[67, 36], [69, 22]],
    farLeg: [[44, 75], [39, 91]],
    nearLeg: [[56, 75], [61, 91]],
    facing: 1,
  },
  // Assis en tailleur sur un tapis
  meditate: {
    head: [50, 35],
    neck: [50, 46],
    hip: [50, 70],
    farArm: [[37, 58], [33, 72]],
    nearArm: [[63, 58], [67, 72]],
    farLeg: [[30, 80], [56, 85]],
    nearLeg: [[70, 80], [44, 85]],
    facing: 1,
    props: [{ type: 'mat' }],
  },
}

const HEAD_R = 8.5
const LIMB_W = 7.5
const TORSO_W = 11

// Tête en croissant de lune : un disque pâle + un croissant plein
const moonHead = ([cx, cy]: Point, facing: 1 | -1): Primitive[] => {
  const r = HEAD_R
  const d = r * 0.9 // décalage du cercle qui "creuse" le croissant
  const h = Math.sqrt(r * r - (d / 2) * (d / 2))
  // Le croissant est tourné vers l'arrière de la tête, légèrement vers le haut
  const angle = (facing === 1 ? 200 : -20) * (Math.PI / 180)
  const rot = ([x, y]: Point): Point => [
    cx + x * Math.cos(angle) - y * Math.sin(angle),
    cy + x * Math.sin(angle) + y * Math.cos(angle),
  ]
  // Repère local : le cercle creux est décalé vers +x, le croissant est donc côté -x
  const p1 = rot([d / 2, -h])
  const p2 = rot([d / 2, h])
  const f = (n: number) => n.toFixed(2)
  const crescent =
    `M ${f(p1[0])} ${f(p1[1])} ` +
    `A ${r} ${r} 0 1 0 ${f(p2[0])} ${f(p2[1])} ` +
    `A ${r} ${r} 0 0 1 ${f(p1[0])} ${f(p1[1])} Z`
  return [
    { kind: 'circle', c: [cx, cy], r, color: 'moonShade' },
    { kind: 'path', d: crescent, color: 'moon' },
  ]
}

const propPrimitives = (prop: Prop, layer: 'back' | 'front'): Primitive[] => {
  switch (prop.type) {
    case 'barbell': {
      if (layer === 'back') return []
      const [a, b] = [prop.a, prop.b]
      const plate = (x: number, y: number): Primitive => ({
        kind: 'rect',
        x: x - 2.5,
        y: y - 8,
        w: 5,
        h: 16,
        r: 2,
        color: 'accent',
      })
      return [
        { kind: 'line', points: [a, b], width: 2.5, color: 'ink' },
        plate(a[0] + 4, a[1]),
        plate(b[0] - 4, b[1]),
        { kind: 'rect', x: a[0] + 7, y: a[1] - 5.5, w: 3.5, h: 11, r: 1.5, color: 'accent' },
        { kind: 'rect', x: b[0] - 10.5, y: b[1] - 5.5, w: 3.5, h: 11, r: 1.5, color: 'accent' },
      ]
    }
    case 'kettlebell': {
      if (layer === 'back') return []
      const [x, y] = prop.at
      return [
        { kind: 'line', points: [[x - 3, y + 2], [x - 3, y - 1], [x + 3, y - 1], [x + 3, y + 2]], width: 2, color: 'ink' },
        { kind: 'circle', c: [x, y + 6], r: 5.5, color: 'accent' },
      ]
    }
    case 'trophy': {
      if (layer === 'back') return []
      const [x, y] = prop.at
      return [
        { kind: 'path', d: `M ${x - 6} ${y - 8} L ${x + 6} ${y - 8} L ${x + 5} ${y - 3} A 5 5 0 0 1 ${x - 5} ${y - 3} Z`, color: 'gold' },
        { kind: 'rect', x: x - 1, y: y - 2, w: 2, h: 4, r: 0.5, color: 'gold' },
        { kind: 'rect', x: x - 4, y: y + 1.5, w: 8, h: 2.5, r: 1, color: 'gold' },
      ]
    }
    case 'podium':
      return layer === 'back'
        ? [
            { kind: 'rect', x: 30, y: 81, w: 40, h: 12, r: 2, color: 'gold' },
            { kind: 'rect', x: 12, y: 86, w: 18, h: 7, r: 2, color: 'far' },
            { kind: 'rect', x: 70, y: 88, w: 18, h: 5, r: 2, color: 'far' },
          ]
        : []
    case 'mat':
      return layer === 'back' ? [{ kind: 'rect', x: 18, y: 85, w: 64, h: 5, r: 2.5, color: 'accent' }] : []
  }
}

export const buildFigure = (pose: Pose, options: { backdrop?: boolean } = {}): Primitive[] => {
  const props = pose.props ?? []
  const groundY = props.some(p => p.type === 'podium') ? 81 : 92
  const out: Primitive[] = []
  if (options.backdrop) out.push({ kind: 'circle', c: [50, 54], r: 42, color: 'backdrop' })
  out.push({ kind: 'ellipse', c: [50, groundY + 1], rx: 22, ry: 2.5, color: 'shadow', opacity: 0.12 })
  props.forEach(p => out.push(...propPrimitives(p, 'back')))
  // Membres "loin" en clair, puis le tronc, puis les membres "près"
  out.push({ kind: 'line', points: [pose.hip, ...pose.farLeg], width: LIMB_W, color: 'far' })
  // Les bras partent des épaules, un peu sous le haut du tronc
  const shoulder: Point = [
    pose.neck[0] + (pose.hip[0] - pose.neck[0]) * 0.12,
    pose.neck[1] + (pose.hip[1] - pose.neck[1]) * 0.12,
  ]
  out.push({ kind: 'line', points: [shoulder, ...pose.farArm], width: LIMB_W, color: 'far' })
  out.push({ kind: 'line', points: [pose.neck, pose.hip], width: TORSO_W, color: 'ink' })
  out.push({ kind: 'line', points: [pose.hip, ...pose.nearLeg], width: LIMB_W, color: 'ink' })
  out.push({ kind: 'line', points: [shoulder, ...pose.nearArm], width: LIMB_W, color: 'ink' })
  // La tête est légèrement détachée du tronc, façon pictogramme
  const [dx, dy] = [pose.head[0] - pose.neck[0], pose.head[1] - pose.neck[1]]
  const len = Math.hypot(dx, dy) || 1
  out.push(...moonHead([pose.head[0] + (dx / len) * 2.5, pose.head[1] + (dy / len) * 2.5], pose.facing))
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
  const body = primitives
    .map(p => {
      const op = p.kind !== 'line' && p.kind !== 'rect' && p.opacity !== undefined ? ` opacity="${p.opacity}"` : ''
      switch (p.kind) {
        case 'line':
          return `<polyline points="${p.points.map(pt => pt.join(',')).join(' ')}" fill="none" stroke="${colors[p.color]}" stroke-width="${p.width}" stroke-linecap="round" stroke-linejoin="round"/>`
        case 'circle':
          return `<circle cx="${p.c[0]}" cy="${p.c[1]}" r="${p.r}" fill="${colors[p.color]}"${op}/>`
        case 'ellipse':
          return `<ellipse cx="${p.c[0]}" cy="${p.c[1]}" rx="${p.rx}" ry="${p.ry}" fill="${colors[p.color]}"${op}/>`
        case 'rect':
          return `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="${p.r}" fill="${colors[p.color]}"/>`
        case 'path':
          return `<path d="${p.d}" fill="${colors[p.color]}"${op}/>`
      }
    })
    .join('')
  const bg = background ? `<rect width="100" height="100" fill="${background}"/>` : ''
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}">${bg}${body}</svg>`
}

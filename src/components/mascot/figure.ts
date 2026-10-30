// "Moony", la mascotte de l'app : une silhouette pleine à tête de lune.
// Pendant le timer, sa tête passe par les phases de la lune (du fin croissant à la pleine lune).
// Ce module est purement géométrique (aucune dépendance React) : il transforme une pose en
// primitives SVG, rendues ensuite par <Mascot /> avec les couleurs du thème (ou du fond).

export type Point = [number, number]

export type ColorRole = 'ink' | 'far' | 'moon' | 'moonShade' | 'accent' | 'gold' | 'shadow' | 'backdrop'

export type Primitive =
  | { kind: 'line'; points: Point[]; width: number; color: ColorRole }
  | { kind: 'circle'; c: Point; r: number; color: ColorRole; opacity?: number }
  | { kind: 'ellipse'; c: Point; rx: number; ry: number; color: ColorRole; opacity?: number }
  | { kind: 'rect'; x: number; y: number; w: number; h: number; r: number; color: ColorRole }
  | { kind: 'path'; d: string; color: ColorRole; opacity?: number }

type Prop =
  | { type: 'barbell'; a: Point; b: Point; behind?: boolean } // behind : barre derrière la nuque
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
  facing: 1 | -1 // côté vers lequel regarde Moony (la lune est éclairée à l'arrière)
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
  },
  // Back squat vu de face : barre derrière la nuque, genoux ouverts, fesses basses
  squat: {
    head: [50, 33],
    neck: [50, 45],
    hip: [50, 64],
    farArm: [[35, 56], [30, 46]],
    nearArm: [[65, 56], [70, 46]],
    farLeg: [[30, 71], [36, 89]],
    nearLeg: [[70, 71], [64, 89]],
    facing: 1,
    props: [{ type: 'barbell', a: [10, 46], b: [90, 46], behind: true }],
  },
  // Soulevé de terre vu de face : buste penché (donc raccourci), bras tendus hors des genoux, barre aux tibias
  deadlift: {
    head: [50, 37],
    neck: [50, 49],
    hip: [50, 63],
    farArm: [[37, 62], [34, 76]],
    nearArm: [[63, 62], [66, 76]],
    farLeg: [[39, 74], [41, 89]],
    nearLeg: [[61, 74], [59, 89]],
    facing: 1,
    props: [{ type: 'barbell', a: [10, 76], b: [90, 76] }],
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
    props: [{ type: 'mat' }],
  },
}

const HEAD_R = 8.8
const LIMB_W = 7.5
const TORSO_W = 11

// Phase de Moony hors du timer : son croissant habituel
export const DEFAULT_PHASE = 0.4

const f = (n: number) => n.toFixed(2)

// Tête en phase de lune : p = 0 nouvelle lune, 0,5 demi-lune, 1 pleine lune.
// Le côté éclairé est à l'arrière de la tête, vers le haut.
const moonHead = ([cx, cy]: Point, facing: 1 | -1, phase: number): Primitive[] => {
  const r = HEAD_R
  const out: Primitive[] = [{ kind: 'circle', c: [cx, cy], r, color: 'moonShade' }]
  const p = Math.min(1, Math.max(0, phase))
  if (p >= 0.99) return [...out, { kind: 'circle', c: [cx, cy], r, color: 'moon' }]
  if (p <= 0.01) return out
  // Demi-cercle éclairé + terminateur elliptique, dans un repère tourné vers l'arrière de la tête
  const angle = ((facing === 1 ? 215 : -35) * Math.PI) / 180
  const rot = ([x, y]: Point): Point => [
    cx + x * Math.cos(angle) - y * Math.sin(angle),
    cy + x * Math.sin(angle) + y * Math.cos(angle),
  ]
  const top = rot([0, -r])
  const bottom = rot([0, r])
  const rx = r * Math.abs(1 - 2 * p)
  const deg = (angle * 180) / Math.PI
  const d =
    `M ${f(top[0])} ${f(top[1])} A ${r} ${r} 0 0 1 ${f(bottom[0])} ${f(bottom[1])} ` +
    `A ${f(rx)} ${r} ${f(deg)} 0 ${p < 0.5 ? 0 : 1} ${f(top[0])} ${f(top[1])} Z`
  return [...out, { kind: 'path', d, color: 'moon' }]
}

const propPrimitives = (prop: Prop, layer: 'back' | 'front'): Primitive[] => {
  switch (prop.type) {
    case 'barbell': {
      if ((layer === 'back') !== !!prop.behind) return []
      const [a, b] = [prop.a, prop.b]
      const plate = (x: number, y: number, w: number, h: number): Primitive => ({
        kind: 'rect',
        x: x - w / 2,
        y: y - h / 2,
        w,
        h,
        r: 1.8,
        color: 'accent',
      })
      return [
        { kind: 'line', points: [a, b], width: 2.4, color: 'ink' },
        plate(a[0] + 4, a[1], 5, 16),
        plate(a[0] + 8.5, a[1], 3.5, 11),
        plate(b[0] - 4, b[1], 5, 16),
        plate(b[0] - 8.5, b[1], 3.5, 11),
      ]
    }
    case 'kettlebell': {
      if (layer === 'back') return []
      const [x, y] = prop.at
      return [
        { kind: 'line', points: [[x - 3, y + 2], [x - 3, y - 1], [x + 3, y - 1], [x + 3, y + 2]], width: 2, color: 'ink' },
        { kind: 'circle', c: [x, y + 6.5], r: 5.6, color: 'accent' },
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
            { kind: 'rect', x: 30, y: 80.5, w: 40, h: 12.5, r: 2, color: 'gold' },
            { kind: 'rect', x: 12, y: 86, w: 18, h: 7, r: 2, color: 'far' },
            { kind: 'rect', x: 70, y: 88, w: 18, h: 5, r: 2, color: 'far' },
          ]
        : []
    case 'mat':
      return layer === 'back' ? [{ kind: 'rect', x: 14, y: 86, w: 72, h: 5, r: 2.5, color: 'accent' }] : []
  }
}

export const buildFigure = (pose: Pose, options: { backdrop?: boolean; phase?: number } = {}): Primitive[] => {
  const props = pose.props ?? []
  const groundY = props.some(p => p.type === 'podium') ? 81 : 92
  const out: Primitive[] = []
  if (options.backdrop) out.push({ kind: 'circle', c: [50, 54], r: 43, color: 'backdrop' })
  out.push({ kind: 'ellipse', c: [50, groundY + 1], rx: 22, ry: 2.5, color: 'shadow', opacity: 0.12 })
  props.forEach(p => out.push(...propPrimitives(p, 'back')))

  // Les bras partent des épaules, un peu sous le haut du tronc
  const shoulder: Point = [
    pose.neck[0] + (pose.hip[0] - pose.neck[0]) * 0.12,
    pose.neck[1] + (pose.hip[1] - pose.neck[1]) * 0.12,
  ]
  // Membres "loin" en clair, puis le tronc, puis les membres "près"
  out.push({ kind: 'line', points: [pose.hip, ...pose.farLeg], width: LIMB_W, color: 'far' })
  out.push({ kind: 'line', points: [shoulder, ...pose.farArm], width: LIMB_W, color: 'far' })
  out.push({ kind: 'line', points: [pose.neck, pose.hip], width: TORSO_W, color: 'ink' })
  out.push({ kind: 'line', points: [pose.hip, ...pose.nearLeg], width: LIMB_W, color: 'ink' })
  out.push({ kind: 'line', points: [shoulder, ...pose.nearArm], width: LIMB_W, color: 'ink' })

  // La tête est légèrement détachée du tronc, façon pictogramme
  const [dx, dy] = [pose.head[0] - pose.neck[0], pose.head[1] - pose.neck[1]]
  const len = Math.hypot(dx, dy) || 1
  out.push(...moonHead([pose.head[0] + (dx / len) * 1.2, pose.head[1] + (dy / len) * 1.2], pose.facing, options.phase ?? DEFAULT_PHASE))

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
      const op = 'opacity' in p && p.opacity !== undefined ? ` opacity="${p.opacity}"` : ''
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

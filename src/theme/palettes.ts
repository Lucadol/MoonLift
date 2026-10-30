export type PaletteId = 'terracotta' | 'sauge' | 'ocean' | 'encre'
export type ColorMode = 'light' | 'dark'

export interface Accents {
  primary: string // boutons principaux, phase de travail, tête de la mascotte
  secondary: string
  tertiary: string // records, préparation
  quaternary: string // repos, EMOM
  success: string // exercice validé
  moon: string // tête de la mascotte
}

export interface Palette {
  id: PaletteId
  name: string
  description: string
  light: Accents
  dark: Accents
}

// Associations de couleurs désaturées, pensées pour un fond beige (clair) ou brun très sombre (sombre)
export const palettes: Palette[] = [
  {
    id: 'terracotta',
    name: 'Terre cuite',
    description: 'Terre cuite, sauge, ocre et ardoise',
    light: { primary: '#C0623F', secondary: '#7E8F6A', tertiary: '#CF9A3E', quaternary: '#5A7180', success: '#6F8A5E', moon: '#C0623F' },
    dark: { primary: '#D7795A', secondary: '#9AAB85', tertiary: '#DDAE5E', quaternary: '#7C96A6', success: '#8FAA7C', moon: '#D7795A' },
  },
  {
    id: 'sauge',
    name: 'Sauge & caramel',
    description: 'Vert sauge, caramel, sable et bleu gris',
    light: { primary: '#5E7D63', secondary: '#B7835A', tertiary: '#C4A465', quaternary: '#6E7F96', success: '#5E7D63', moon: '#B7835A' },
    dark: { primary: '#86A68B', secondary: '#CB9A73', tertiary: '#D6BB82', quaternary: '#8D9DB3', success: '#86A68B', moon: '#CB9A73' },
  },
  {
    id: 'ocean',
    name: 'Nuit & corail',
    description: 'Bleu nuit, corail, miel et vert d’eau',
    light: { primary: '#3D405B', secondary: '#E07A5F', tertiary: '#DDA853', quaternary: '#6FA088', success: '#6FA088', moon: '#E07A5F' },
    dark: { primary: '#8E92C4', secondary: '#E8907A', tertiary: '#EDC388', quaternary: '#8DBFA6', success: '#8DBFA6', moon: '#E8907A' },
  },
  {
    id: 'encre',
    name: 'Encre & lin',
    description: 'Noir d’encre, taupe, lin et olive',
    light: { primary: '#2B2622', secondary: '#9C8B78', tertiary: '#B8975F', quaternary: '#6F7A6A', success: '#6F7A6A', moon: '#B8975F' },
    dark: { primary: '#EDE6DA', secondary: '#B3A391', tertiary: '#CDAE78', quaternary: '#919C8B', success: '#A3AE9C', moon: '#CDAE78' },
  },
]

export const neutrals = {
  light: {
    background: '#F3EEE5', // beige
    surface: '#FBF8F2',
    surfaceAlt: '#ECE5DA',
    border: '#E0D7C9',
    text: '#2B2622',
    textMuted: '#8C8277',
    danger: '#B5483B',
  },
  dark: {
    background: '#161412',
    surface: '#211E1B',
    surfaceAlt: '#2D2925',
    border: '#3A3530',
    text: '#F1EBE1',
    textMuted: '#9A9086',
    danger: '#D46A5C',
  },
}

// Couleur de texte lisible sur un fond donné
export const onColor = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
  return luminance > 0.4 ? '#2B2622' : '#FBF8F2'
}

// Mélange une couleur avec une autre (t = 0 → a, t = 1 → b)
export const mix = (a: string, b: string, t: number) => {
  const pa = parseInt(a.replace('#', ''), 16)
  const pb = parseInt(b.replace('#', ''), 16)
  const channel = (shift: number) =>
    Math.round(((pa >> shift) & 255) * (1 - t) + ((pb >> shift) & 255) * t)
  return `#${((channel(16) << 16) | (channel(8) << 8) | channel(0)).toString(16).padStart(6, '0')}`
}

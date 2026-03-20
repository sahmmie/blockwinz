export type ColorMul = {
  mul: number
  color: string
  mulText?: string
}

export type MulType = {
  [risk: string]: {
    [segments: number]: {
      muls: number[]
      colors: ColorMul[]
    }
  }
}

const colorMap: { [key: string]: string } = {
  black: '#545463',
  white: '#bec6d1',
  purple: '#470CA6',
  yellow: '#F9BD4A',
  red: '#E42429',
  green: '#00DD25',
}

const b = colorMap['black']
const w = colorMap['white']
const g = colorMap['green']
const r = colorMap['red']
const y = colorMap['yellow']
const p = colorMap['purple']

const lowClrs = [
  { mul: 0, mulText: '0.00', color: b },
  { mul: 1.2, mulText: '1.20', color: w },
  { mul: 1.5, mulText: '1.50', color: g },
]

const medClrs10 = [
  { mul: 0, mulText: '0.00', color: b },
  { mul: 1.5, mulText: '1.50', color: w },
  { mul: 1.9, mulText: '1.90', color: p },
  { mul: 2, mulText: '2.00', color: r },
  { mul: 3, mulText: '3.00', color: g },
]

const medClrs20 = [
  { mul: 0, mulText: '0.00', color: b },
  { mul: 1.5, mulText: '1.50', color: w },
  { mul: 1.8, mulText: '1.80', color: p },
  { mul: 2, mulText: '2.00', color: r },
  { mul: 3, mulText: '3.00', color: g },
]

const medClrs30 = [
  { mul: 0, mulText: '0.00', color: b },
  { mul: 1.5, mulText: '1.50', color: w },
  { mul: 1.7, mulText: '1.70', color: y },
  { mul: 2, mulText: '2.00', color: p },
  { mul: 3, mulText: '3.00', color: r },
  { mul: 4, mulText: '4.00', color: g },
]

const medClrs40 = [
  { mul: 0, mulText: '0.00', color: b },
  { mul: 1.5, mulText: '1.50', color: w },
  { mul: 1.6, mulText: '1.60', color: p },
  { mul: 2, mulText: '2.00', color: r },
  { mul: 3, mulText: '3.00', color: g },
]

const medClrs50 = [
  { mul: 0, mulText: '0.00', color: b },
  { mul: 1.5, mulText: '1.50', color: w },
  { mul: 2, mulText: '2.00', color: p },
  { mul: 3, mulText: '3.00', color: r },
  { mul: 5, mulText: '5.00', color: g },
]
export const wheelMuls: MulType = {
  LOW: {
    10: {
      muls: [0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 0, 1.5],
      colors: lowClrs,
    },
    20: {
      muls: [
        1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2,
      ],
      colors: lowClrs,
    },
    30: {
      muls: [
        1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2,
        1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2,
      ],
      colors: lowClrs,
    },
    40: {
      muls: [
        0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2,
        0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2,
      ],
      colors: lowClrs,
    },
    50: {
      muls: [
        1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0,
        1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0, 1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0,
        1.2, 1.2, 1.2, 1.2, 0, 1.2, 1.2, 1.2, 1.5, 0,
      ],
      colors: lowClrs,
    },
  },
  MEDIUM: {
    10: { muls: [3, 0, 1.5, 0, 2, 0, 1.5, 0, 1.9, 0], colors: medClrs10 },
    20: {
      muls: [3, 0, 2, 0, 2, 0, 1.5, 0, 2, 0, 2, 0, 1.8, 0, 2, 0, 1.5, 0, 2, 0],
      colors: medClrs20,
    },
    30: {
      muls: [
        4, 0, 2, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 1.5, 0, 1.7, 0, 3, 0, 2, 0, 1.5, 0, 2, 0, 1.5, 0, 2,
        0, 1.5, 0,
      ],
      colors: medClrs30,
    },
    40: {
      muls: [
        1.6, 0, 1.5, 0, 2, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 3,
        0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 3, 0, 1.5, 0,
      ],
      colors: medClrs40,
    },
    50: {
      muls: [
        5, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0,
        1.5, 0, 2, 0, 1.5, 0, 2, 0, 1.5, 0, 3, 0, 1.5, 0, 2, 0, 1.5, 0, 1.5, 0, 2, 0, 1.5, 0,
      ],
      colors: medClrs50,
    },
  },
  HIGH: {
    10: {
      muls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 9],
      colors: [
        { mul: 0, color: b, mulText: '0.00' },
        { mul: 9, color: g, mulText: '9.00' },
      ],
    },
    20: {
      muls: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 19.8],
      colors: [
        { mul: 0, color: b, mulText: '0.00' },
        { mul: 19.8, color: g, mulText: '19.80' },
      ],
    },
    30: {
      muls: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 29.7,
      ],
      colors: [
        { mul: 0, color: b, mulText: '0.00' },
        { mul: 29.7, color: g, mulText: '29.70' },
      ],
    },
    40: {
      muls: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 39.6,
      ],
      colors: [
        { mul: 0, color: b, mulText: '0.00' },
        { mul: 39.6, color: g, mulText: '39.60' },
      ],
    },
    50: {
      muls: [
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 49.5,
      ],
      colors: [
        { mul: 0, color: b, mulText: '0.00' },
        { mul: 49.5, color: g, mulText: '49.50' },
      ],
    },
  },
}

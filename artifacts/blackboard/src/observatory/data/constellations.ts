/**
 * Compact major constellation stick figures.
 * Stars as RA (hours) + Dec (degrees). Public-domain bright-star links
 * (IAU traditional figures, simplified).
 */

export interface SkyStar {
  id: string;
  ra: number;
  dec: number;
  mag?: number;
}

export interface ConstellationLine {
  id: string;
  name: string;
  abbr: string;
  /** Pairs of star indices into `stars`. */
  lines: [number, number][];
  stars: SkyStar[];
}

export const CONSTELLATIONS: ConstellationLine[] = [
  {
    id: 'ori',
    name: 'Orion',
    abbr: 'Ori',
    stars: [
      { id: 'Betelgeuse', ra: 5.9195, dec: 7.4071 },
      { id: 'Bellatrix', ra: 5.4189, dec: 6.3497 },
      { id: 'Alnitak', ra: 5.6793, dec: -1.9426 },
      { id: 'Alnilam', ra: 5.6036, dec: -1.2019 },
      { id: 'Mintaka', ra: 5.5334, dec: -0.2991 },
      { id: 'Rigel', ra: 5.2423, dec: -8.2016 },
      { id: 'Saiph', ra: 5.7959, dec: -9.6696 },
    ],
    lines: [[0, 1], [1, 4], [4, 3], [3, 2], [2, 0], [4, 5], [2, 6], [0, 3], [1, 3]],
  },
  {
    id: 'uma',
    name: 'Ursa Major',
    abbr: 'UMa',
    stars: [
      { id: 'Dubhe', ra: 11.0621, dec: 61.751 },
      { id: 'Merak', ra: 11.0307, dec: 56.3824 },
      { id: 'Phecda', ra: 11.8972, dec: 53.6948 },
      { id: 'Megrez', ra: 12.2571, dec: 57.0326 },
      { id: 'Alioth', ra: 12.9004, dec: 55.9598 },
      { id: 'Mizar', ra: 13.3987, dec: 54.9254 },
      { id: 'Alkaid', ra: 13.7923, dec: 49.3133 },
    ],
    lines: [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5], [5, 6]],
  },
  {
    id: 'cas',
    name: 'Cassiopeia',
    abbr: 'Cas',
    stars: [
      { id: 'Schedar', ra: 0.6751, dec: 56.5373 },
      { id: 'Caph', ra: 0.1529, dec: 59.1498 },
      { id: 'Gamma Cas', ra: 0.9451, dec: 60.7167 },
      { id: 'Ruchbah', ra: 1.4302, dec: 60.2353 },
      { id: 'Segin', ra: 1.9066, dec: 63.6701 },
    ],
    lines: [[1, 0], [0, 2], [2, 3], [3, 4]],
  },
  {
    id: 'sco',
    name: 'Scorpius',
    abbr: 'Sco',
    stars: [
      { id: 'Antares', ra: 16.4901, dec: -26.4319 },
      { id: 'Graffias', ra: 16.0906, dec: -19.8057 },
      { id: 'Dschubba', ra: 16.0056, dec: -22.6217 },
      { id: 'Sargas', ra: 17.6219, dec: -42.9978 },
      { id: 'Shaula', ra: 17.5601, dec: -37.1038 },
      { id: 'Lesath', ra: 17.5065, dec: -37.2958 },
    ],
    lines: [[1, 2], [2, 0], [0, 3], [3, 4], [4, 5]],
  },
  {
    id: 'cyg',
    name: 'Cygnus',
    abbr: 'Cyg',
    stars: [
      { id: 'Deneb', ra: 20.6905, dec: 45.2803 },
      { id: 'Sadr', ra: 20.3705, dec: 40.2567 },
      { id: 'Gienah', ra: 20.7702, dec: 33.9703 },
      { id: 'Delta Cyg', ra: 19.7496, dec: 45.1308 },
      { id: 'Albireo', ra: 19.512, dec: 27.9597 },
    ],
    lines: [[0, 1], [1, 4], [3, 1], [1, 2]],
  },
  {
    id: 'leo',
    name: 'Leo',
    abbr: 'Leo',
    stars: [
      { id: 'Regulus', ra: 10.1395, dec: 11.9672 },
      { id: 'Denebola', ra: 11.8177, dec: 14.5721 },
      { id: 'Algieba', ra: 10.3329, dec: 19.8415 },
      { id: 'Zosma', ra: 11.2351, dec: 20.5237 },
      { id: 'Ras Elased', ra: 9.7642, dec: 23.7743 },
    ],
    lines: [[4, 2], [2, 0], [0, 3], [3, 1], [2, 3]],
  },
  {
    id: 'tau',
    name: 'Taurus',
    abbr: 'Tau',
    stars: [
      { id: 'Aldebaran', ra: 4.5987, dec: 16.5093 },
      { id: 'Elnath', ra: 5.4382, dec: 28.6075 },
      { id: 'Ain', ra: 4.4777, dec: 19.1804 },
      { id: 'Alcyone', ra: 3.7903, dec: 24.1051 },
    ],
    lines: [[3, 2], [2, 0], [0, 1]],
  },
  {
    id: 'gem',
    name: 'Gemini',
    abbr: 'Gem',
    stars: [
      { id: 'Castor', ra: 7.5766, dec: 31.8883 },
      { id: 'Pollux', ra: 7.7553, dec: 28.0262 },
      { id: 'Alhena', ra: 6.6285, dec: 16.3993 },
      { id: 'Wasat', ra: 7.3354, dec: 21.9823 },
    ],
    lines: [[0, 1], [1, 3], [3, 2], [0, 3]],
  },
  {
    id: 'sgr',
    name: 'Sagittarius',
    abbr: 'Sgr',
    stars: [
      { id: 'Kaus Australis', ra: 18.4029, dec: -34.3846 },
      { id: 'Nunki', ra: 18.9211, dec: -26.2967 },
      { id: 'Ascella', ra: 19.0435, dec: -29.8801 },
      { id: 'Kaus Media', ra: 18.3499, dec: -29.8281 },
      { id: 'Kaus Borealis', ra: 18.4662, dec: -25.4217 },
    ],
    lines: [[0, 3], [3, 4], [4, 1], [1, 2], [2, 0]],
  },
  {
    id: 'aqr',
    name: 'Aquarius',
    abbr: 'Aqr',
    stars: [
      { id: 'Sadalmelik', ra: 22.0964, dec: -0.3199 },
      { id: 'Sadalsuud', ra: 21.5259, dec: -5.5712 },
      { id: 'Skat', ra: 22.9108, dec: -15.8208 },
      { id: 'Ancha', ra: 22.2806, dec: -7.7833 },
    ],
    lines: [[1, 0], [0, 3], [3, 2]],
  },
  {
    id: 'psc',
    name: 'Pisces',
    abbr: 'Psc',
    stars: [
      { id: 'Alrescha', ra: 2.0342, dec: 2.7638 },
      { id: 'Fumalsamakah', ra: 23.6658, dec: 5.6263 },
      { id: 'Delta Psc', ra: 0.8114, dec: 7.5851 },
    ],
    lines: [[1, 2], [2, 0]],
  },
  {
    id: 'vir',
    name: 'Virgo',
    abbr: 'Vir',
    stars: [
      { id: 'Spica', ra: 13.4199, dec: -11.1613 },
      { id: 'Porrima', ra: 12.6943, dec: -1.4494 },
      { id: 'Vindemiatrix', ra: 13.0363, dec: 10.9592 },
      { id: 'Zavijava', ra: 11.8448, dec: 1.7647 },
    ],
    lines: [[3, 1], [1, 0], [1, 2]],
  },
  {
    id: 'lib',
    name: 'Libra',
    abbr: 'Lib',
    stars: [
      { id: 'Zubenelgenubi', ra: 14.8479, dec: -16.0418 },
      { id: 'Zubeneschamali', ra: 15.2835, dec: -9.3829 },
      { id: 'Brachium', ra: 15.5921, dec: -14.7895 },
    ],
    lines: [[0, 1], [1, 2], [2, 0]],
  },
  {
    id: 'cap',
    name: 'Capricornus',
    abbr: 'Cap',
    stars: [
      { id: 'Deneb Algedi', ra: 21.784, dec: -16.1273 },
      { id: 'Dabih', ra: 20.3502, dec: -14.7814 },
      { id: 'Nashira', ra: 21.6682, dec: -16.6623 },
      { id: 'Algedi', ra: 20.2946, dec: -12.5083 },
    ],
    lines: [[3, 1], [1, 2], [2, 0]],
  },
  {
    id: 'crux',
    name: 'Crux',
    abbr: 'Cru',
    stars: [
      { id: 'Acrux', ra: 12.4433, dec: -63.0991 },
      { id: 'Mimosa', ra: 12.7954, dec: -59.6888 },
      { id: 'Gacrux', ra: 12.5194, dec: -57.1132 },
      { id: 'Delta Cru', ra: 12.2524, dec: -58.7489 },
    ],
    lines: [[0, 2], [3, 1]],
  },
  {
    id: 'and',
    name: 'Andromeda',
    abbr: 'And',
    stars: [
      { id: 'Alpheratz', ra: 0.1398, dec: 29.0904 },
      { id: 'Mirach', ra: 1.1622, dec: 35.6206 },
      { id: 'Almach', ra: 2.06498, dec: 42.3297 },
    ],
    lines: [[0, 1], [1, 2]],
  },
];

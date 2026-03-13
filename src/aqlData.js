/**
 * AQL (Acceptable Quality Level) data tables
 * Based on ISO 2859-1 / ANSI/ASQ Z1.4 / MIL-STD-105E
 */

// ----- Lot Size → Sample Size Code Letter -----
// Columns: S1, S2, S3, S4, I, II, III
export const LOT_SIZE_RANGES = [
  { min: 2,      max: 8,      codes: ['A','A','A','A','A','A','B'] },
  { min: 9,      max: 15,     codes: ['A','A','A','A','A','B','C'] },
  { min: 16,     max: 25,     codes: ['A','A','B','B','B','C','D'] },
  { min: 26,     max: 50,     codes: ['A','B','B','C','C','D','E'] },
  { min: 51,     max: 90,     codes: ['B','B','C','C','C','E','F'] },
  { min: 91,     max: 150,    codes: ['B','B','C','D','D','F','G'] },
  { min: 151,    max: 280,    codes: ['B','C','D','E','E','G','H'] },
  { min: 281,    max: 500,    codes: ['B','C','D','E','F','H','J'] },
  { min: 501,    max: 1200,   codes: ['C','C','E','F','G','J','K'] },
  { min: 1201,   max: 3200,   codes: ['C','D','E','G','H','K','L'] },
  { min: 3201,   max: 10000,  codes: ['C','D','F','G','J','L','M'] },
  { min: 10001,  max: 35000,  codes: ['C','D','F','H','K','M','N'] },
  { min: 35001,  max: 150000, codes: ['D','E','G','J','L','N','P'] },
  { min: 150001, max: 500000, codes: ['D','E','G','J','M','P','Q'] },
  { min: 500001, max: Infinity,codes: ['D','E','H','K','N','Q','R'] },
]

export const INSPECTION_LEVEL_INDEX = {
  'S-1': 0,
  'S-2': 1,
  'S-3': 2,
  'S-4': 3,
  'I':   4,
  'II':  5,
  'III': 6,
}

// ----- Sample Size Code Letter → Sample Size -----
export const SAMPLE_SIZES = {
  A: 2,
  B: 3,
  C: 5,
  D: 8,
  E: 13,
  F: 20,
  G: 32,
  H: 50,
  J: 80,
  K: 125,
  L: 200,
  M: 315,
  N: 500,
  P: 800,
  Q: 1250,
  R: 2000,
}

export const CODE_LETTERS = ['A','B','C','D','E','F','G','H','J','K','L','M','N','P','Q','R']

// ----- AQL Levels -----
export const AQL_LEVELS = [0.010, 0.015, 0.025, 0.040, 0.065, 0.10, 0.15, 0.25, 0.40, 0.65, 1.0, 1.5, 2.5, 4.0, 6.5, 10, 15, 25, 40, 65, 100]

// ----- Normal Single Sampling Plan (Table II-A, ISO 2859-1) -----
// Format: { ac: number, re: number } | { useBelow: true } | { useAbove: true }
// useBelow = arrow pointing down (↓) = use the first plan below the given AQL
// useAbove = arrow pointing up (↑) = use the first plan above the given AQL
//
// Indexed by [codeLetter][aqlLevelIndex]
// aqlLevelIndex corresponds to AQL_LEVELS array positions

const D = { useBelow: true }   // ↓ arrow — use plan below (increase sample size)
const U = { useAbove: true }   // ↑ arrow — use plan above (decrease sample size)

// Each row = [0.010, 0.015, 0.025, 0.040, 0.065, 0.10, 0.15, 0.25, 0.40, 0.65, 1.0, 1.5, 2.5, 4.0, 6.5, 10, 15, 25, 40, 65, 100]
export const NORMAL_PLAN = {
  A: [D, D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, U, U, U, U, U],
  B: [D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, U, U, U, U, U, U],
  C: [D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, U, U, U, U, U, U, U],
  D: [D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, U, U, U, U, U, U, U],
  E: [D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, U, U, U, U, U, U],
  F: [D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, U, U, U, U, U],
  G: [D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, U, U, U, U, U],
  H: [D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U],
  J: [D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U],
  K: [D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U],
  L: [D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U, U],
  M: [D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U, U, U],
  N: [D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U, U, U, U],
  P: [D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U, U, U, U, U],
  Q: [{ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U, U, U, U, U, U],
  R: [{ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:7,re:8}, {ac:10,re:11}, {ac:14,re:15}, {ac:21,re:22}, U, U, U, U, U, U, U, U, U, U, U, U, U],
}

// ----- Tightened Single Sampling Plan (Table III-A, ISO 2859-1) -----
export const TIGHTENED_PLAN = {
  A: [D, D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, U, U, U, U, U, U],
  B: [D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, U, U, U, U, U, U, U],
  C: [D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, U, U, U, U, U, U, U, U],
  D: [D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, U, U, U, U, U, U, U],
  E: [D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, U, U, U, U, U, U, U],
  F: [D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, U, U, U, U, U],
  G: [D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, U, U, U, U, U],
  H: [D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U],
  J: [D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U],
  K: [D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U],
  L: [D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U, U],
  M: [D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U, U, U],
  N: [D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U, U, U, U],
  P: [D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U, U, U, U, U],
  Q: [{ac:0,re:1}, {ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U, U, U, U, U, U],
  R: [{ac:1,re:2}, {ac:2,re:3}, {ac:3,re:4}, {ac:5,re:6}, {ac:8,re:9}, {ac:12,re:13}, {ac:18,re:19}, {ac:27,re:28}, U, U, U, U, U, U, U, U, U, U, U, U, U],
}

// ----- Reduced Single Sampling Plan (Table IV-A, ISO 2859-1) -----
// Note: Reduced plans may have a "range" area where neither accept/reject applies for certain counts
// Format adds optional range: [rangeMin, rangeMax] where if defects fall in this range → no decision
export const REDUCED_PLAN = {
  A: [D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, U, U, U, U],
  B: [D, D, D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, U, U, U, U, U],
  C: [D, D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, U, U, U, U, U, U],
  D: [D, D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, U, U, U, U, U, U],
  E: [D, D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, U, U, U, U, U, U],
  F: [D, D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, U, U, U, U, U],
  G: [D, D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, U, U, U, U, U],
  H: [D, D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U],
  J: [D, D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U],
  K: [D, D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U],
  L: [D, D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U, U],
  M: [D, D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U, U, U],
  N: [D, D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U, U, U, U],
  P: [D, D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U, U, U, U, U],
  Q: [D, D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U, U, U, U, U, U],
  R: [D, {ac:0,re:1}, {ac:1,re:2}, {ac:2,re:4}, {ac:3,re:6}, {ac:5,re:9}, {ac:7,re:11}, {ac:10,re:16}, U, U, U, U, U, U, U, U, U, U, U, U, U],
}

export const INSPECTION_PLANS = {
  Normal:    NORMAL_PLAN,
  Tightened: TIGHTENED_PLAN,
  Reduced:   REDUCED_PLAN,
}

// ----- Core lookup functions -----

/**
 * Get the sample size code letter for a given lot size and inspection level.
 */
export function getCodeLetter(lotSize, inspectionLevel) {
  const col = INSPECTION_LEVEL_INDEX[inspectionLevel]
  if (col === undefined) return null
  const row = LOT_SIZE_RANGES.find(r => lotSize >= r.min && lotSize <= r.max)
  if (!row) return null
  return row.codes[col]
}

/**
 * Resolve a code letter + AQL index from a plan, following ↓/↑ arrows.
 * Returns { codeLetter, sampleSize, ac, re, resolvedAqlIndex } or null.
 */
function resolvePlan(plan, codeLetter, aqlIdx) {
  const codeOrder = CODE_LETTERS
  let codeIdx = codeOrder.indexOf(codeLetter)
  if (codeIdx === -1) return null

  let resolvedAqlIdx = aqlIdx

  // Try to resolve the entry at this code letter and AQL index
  // Follow arrows by shifting code letter (↓ = go to next letter, ↑ = go to previous letter)
  // with a safety cap to avoid infinite loops
  for (let iter = 0; iter < CODE_LETTERS.length; iter++) {
    const letter = codeOrder[codeIdx]
    const row = plan[letter]
    if (!row) return null

    const entry = row[resolvedAqlIdx]
    if (!entry) return null

    if (entry.useBelow) {
      // Move to the next larger code letter (smaller AQL threshold = bigger sample)
      codeIdx++
      if (codeIdx >= codeOrder.length) return null
    } else if (entry.useAbove) {
      // Move to the next smaller code letter (larger AQL threshold = smaller sample)
      codeIdx--
      if (codeIdx < 0) return null
    } else {
      // Valid entry found
      return {
        codeLetter: letter,
        sampleSize: SAMPLE_SIZES[letter],
        ac: entry.ac,
        re: entry.re,
        resolvedAqlIdx,
      }
    }
  }

  return null
}

/**
 * Get the full sampling plan result for a given lot size, inspection level,
 * inspection type, and AQL level.
 * Returns { codeLetter, sampleSize, ac, re } or null if not applicable.
 */
export function getSamplingPlan(lotSize, inspectionLevel, inspectionType, aqlLevel) {
  const codeLetter = getCodeLetter(lotSize, inspectionLevel)
  if (!codeLetter) return null

  const aqlIdx = AQL_LEVELS.indexOf(aqlLevel)
  if (aqlIdx === -1) return null

  const plan = INSPECTION_PLANS[inspectionType]
  if (!plan) return null

  return resolvePlan(plan, codeLetter, aqlIdx)
}

/**
 * Get results for all AQL levels for a given setup (for the summary table).
 */
export function getAllAqlResults(lotSize, inspectionLevel, inspectionType) {
  const codeLetter = getCodeLetter(lotSize, inspectionLevel)
  if (!codeLetter) return []

  const plan = INSPECTION_PLANS[inspectionType]
  if (!plan) return []

  return AQL_LEVELS.map((aql, idx) => {
    const result = resolvePlan(plan, codeLetter, idx)
    return { aql, result }
  })
}

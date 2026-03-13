import { useState, useMemo } from 'react'
import {
  AQL_LEVELS,
  INSPECTION_LEVEL_INDEX,
  getCodeLetter,
  getSamplingPlan,
  getAllAqlResults,
  LOT_SIZE_RANGES,
} from './aqlData'

const INSPECTION_LEVELS = Object.keys(INSPECTION_LEVEL_INDEX)
const INSPECTION_TYPES = ['Normal', 'Tightened', 'Reduced']

const COMMON_AQL_LEVELS = [0.065, 0.10, 0.15, 0.25, 0.40, 0.65, 1.0, 1.5, 2.5, 4.0, 6.5, 10]

function formatAql(v) {
  if (v < 1) return v.toString()
  return v.toString()
}

function AqlBadge({ ac, re }) {
  if (ac === undefined || re === undefined) return <span className="badge badge-na">N/A</span>
  return (
    <span className="badge-pair">
      <span className="badge badge-accept">{ac}</span>
      <span className="badge-sep">/</span>
      <span className="badge badge-reject">{re}</span>
    </span>
  )
}

function LotSizeRangeHint({ lotSize }) {
  if (!lotSize || lotSize < 2) return null
  const range = LOT_SIZE_RANGES.find(r => lotSize >= r.min && lotSize <= r.max)
  if (!range) return null
  const maxLabel = range.max === Infinity ? '500,001+' : `${range.max.toLocaleString()}`
  return (
    <span className="range-hint">
      Lot range: {range.min.toLocaleString()} – {maxLabel}
    </span>
  )
}

export default function App() {
  const [lotSize, setLotSize] = useState('')
  const [inspectionLevel, setInspectionLevel] = useState('II')
  const [inspectionType, setInspectionType] = useState('Normal')
  const [selectedAql, setSelectedAql] = useState(1.0)

  const parsedLot = parseInt(lotSize, 10)
  const validLot = !isNaN(parsedLot) && parsedLot >= 2

  const codeLetter = useMemo(
    () => (validLot ? getCodeLetter(parsedLot, inspectionLevel) : null),
    [parsedLot, inspectionLevel, validLot]
  )

  const primaryResult = useMemo(
    () =>
      validLot
        ? getSamplingPlan(parsedLot, inspectionLevel, inspectionType, selectedAql)
        : null,
    [parsedLot, inspectionLevel, inspectionType, selectedAql, validLot]
  )

  const allResults = useMemo(
    () =>
      validLot ? getAllAqlResults(parsedLot, inspectionLevel, inspectionType) : [],
    [parsedLot, inspectionLevel, inspectionType, validLot]
  )

  const commonResults = allResults.filter(r => COMMON_AQL_LEVELS.includes(r.aql))

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <rect width="32" height="32" rx="8" fill="#2563eb"/>
              <path d="M8 24L12 8h2l3 11 3-11h2l4 16h-2.5l-2.5-10-3 10h-1l-3-10-2.5 10H8z" fill="white"/>
            </svg>
            <span className="logo-text">AQL Inspector</span>
          </div>
          <p className="header-sub">Sample Size Calculator · ISO 2859-1 / ANSI Z1.4</p>
        </div>
      </header>

      <main className="main">
        {/* ── Controls ── */}
        <section className="card controls-card">
          <h2 className="card-title">Inspection Parameters</h2>
          <div className="controls-grid">

            {/* Lot Quantity */}
            <div className="field">
              <label className="label" htmlFor="lot-size">Lot Quantity</label>
              <input
                id="lot-size"
                className={`input ${lotSize && !validLot ? 'input-error' : ''}`}
                type="number"
                min="2"
                placeholder="e.g. 1500"
                value={lotSize}
                onChange={e => setLotSize(e.target.value)}
              />
              {lotSize && !validLot && (
                <span className="field-error">Enter a whole number ≥ 2</span>
              )}
              {validLot && <LotSizeRangeHint lotSize={parsedLot} />}
            </div>

            {/* Inspection Level */}
            <div className="field">
              <label className="label" htmlFor="inspection-level">Inspection Level</label>
              <select
                id="inspection-level"
                className="select"
                value={inspectionLevel}
                onChange={e => setInspectionLevel(e.target.value)}
              >
                <optgroup label="General">
                  {['I','II','III'].map(l => (
                    <option key={l} value={l}>Level {l}{l === 'II' ? ' (standard)' : ''}</option>
                  ))}
                </optgroup>
                <optgroup label="Special">
                  {['S-1','S-2','S-3','S-4'].map(l => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Inspection Type */}
            <div className="field">
              <label className="label" htmlFor="inspection-type">Inspection Type</label>
              <select
                id="inspection-type"
                className="select"
                value={inspectionType}
                onChange={e => setInspectionType(e.target.value)}
              >
                {INSPECTION_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>

            {/* AQL Level */}
            <div className="field">
              <label className="label" htmlFor="aql-level">AQL Level (%)</label>
              <select
                id="aql-level"
                className="select"
                value={selectedAql}
                onChange={e => setSelectedAql(parseFloat(e.target.value))}
              >
                {COMMON_AQL_LEVELS.map(a => (
                  <option key={a} value={a}>{formatAql(a)}%</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* ── Primary Result ── */}
        {validLot && (
          <section className="card result-card">
            <h2 className="card-title">Result</h2>
            {primaryResult ? (
              <div className="result-grid">
                <div className="result-stat">
                  <span className="stat-label">Code Letter</span>
                  <span className="stat-value stat-code">{primaryResult.codeLetter}</span>
                  {primaryResult.codeLetter !== codeLetter && (
                    <span className="stat-note">
                      (adjusted from {codeLetter})
                    </span>
                  )}
                </div>
                <div className="result-stat">
                  <span className="stat-label">Sample Size</span>
                  <span className="stat-value stat-sample">{primaryResult.sampleSize}</span>
                  <span className="stat-note">
                    {((primaryResult.sampleSize / parsedLot) * 100).toFixed(1)}% of lot
                  </span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Accept ≤</span>
                  <span className="stat-value stat-accept">{primaryResult.ac}</span>
                  <span className="stat-note">defects</span>
                </div>
                <div className="result-stat">
                  <span className="stat-label">Reject ≥</span>
                  <span className="stat-value stat-reject">{primaryResult.re}</span>
                  <span className="stat-note">defects</span>
                </div>
              </div>
            ) : (
              <div className="no-plan">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="#f59e0b" strokeWidth="2"/>
                  <path d="M10 6v5M10 13v1" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                No applicable sampling plan for this combination. Try a different AQL level or inspection type.
              </div>
            )}
          </section>
        )}

        {/* ── AQL Summary Table ── */}
        {validLot && commonResults.length > 0 && (
          <section className="card table-card">
            <h2 className="card-title">
              All Common AQL Levels
              <span className="card-title-sub">
                {inspectionType} Inspection · Level {inspectionLevel} · Lot: {parsedLot.toLocaleString()}
              </span>
            </h2>
            <div className="table-wrap">
              <table className="aql-table">
                <thead>
                  <tr>
                    <th>AQL (%)</th>
                    <th>Code</th>
                    <th>Sample Size</th>
                    <th>% of Lot</th>
                    <th>Accept / Reject</th>
                  </tr>
                </thead>
                <tbody>
                  {commonResults.map(({ aql, result }) => {
                    const isSelected = aql === selectedAql
                    return (
                      <tr
                        key={aql}
                        className={isSelected ? 'row-selected' : ''}
                        onClick={() => setSelectedAql(aql)}
                        style={{ cursor: 'pointer' }}
                      >
                        <td className="td-aql">{formatAql(aql)}%</td>
                        <td className="td-code">{result ? result.codeLetter : '—'}</td>
                        <td className="td-size">{result ? result.sampleSize : '—'}</td>
                        <td className="td-pct">
                          {result
                            ? `${((result.sampleSize / parsedLot) * 100).toFixed(1)}%`
                            : '—'}
                        </td>
                        <td className="td-acre">
                          {result ? <AqlBadge ac={result.ac} re={result.re} /> : <span className="badge badge-na">N/A</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="table-hint">Click any row to select that AQL level above.</p>
          </section>
        )}

        {/* ── How It Works ── */}
        <section className="card info-card">
          <h2 className="card-title">How It Works</h2>
          <div className="info-grid">
            <div className="info-step">
              <span className="step-num">1</span>
              <div>
                <strong>Lot Size → Code Letter</strong>
                <p>The lot quantity is looked up in the ISO 2859-1 sample size code letter table using the chosen inspection level (General I/II/III or Special S-1–S-4).</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-num">2</span>
              <div>
                <strong>Code Letter → Sample Size</strong>
                <p>Each code letter maps to a fixed sample size (e.g., J → 80 units). If the table shows an arrow, the next applicable plan is used automatically.</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-num">3</span>
              <div>
                <strong>AQL + Inspection Type → Accept/Reject</strong>
                <p>The AQL level and inspection type (Normal / Tightened / Reduced) determine the acceptance number (Ac) and rejection number (Re) for the lot.</p>
              </div>
            </div>
            <div className="info-step">
              <span className="step-num">4</span>
              <div>
                <strong>Decision</strong>
                <p>Inspect the required sample. If defects found ≤ Ac → <span className="text-accept">Accept</span> the lot. If defects found ≥ Re → <span className="text-reject">Reject</span> the lot.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>Based on ISO 2859-1 · ANSI/ASQ Z1.4 · MIL-STD-105E</p>
      </footer>
    </div>
  )
}

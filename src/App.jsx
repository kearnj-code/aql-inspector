import { useState, useRef, useCallback, useMemo } from 'react'
import {
  LOT_SIZE_RANGES,
  getCodeLetter,
  getSamplingPlan,
  getAllAqlResults,
} from './aqlData'

const COMMON_AQL   = [0.065, 0.10, 0.25, 0.40, 0.65, 1.0, 1.5, 2.5, 4.0, 6.5, 10]
const INSP_LEVELS  = ['I', 'II', 'III', 'S-1', 'S-2', 'S-3', 'S-4']
const INSP_TYPES   = ['Normal', 'Tightened', 'Reduced']
const RANGE_COUNT  = LOT_SIZE_RANGES.length // 15

function getRangeMidpoint(range) {
  if (range.max === Infinity) return range.min * 3
  return Math.round((range.min + range.max) / 2)
}

function formatRangeShort(range) {
  const fmt = n => {
    if (n >= 1000000) return (n / 1000000).toFixed(n % 1000000 ? 1 : 0) + 'M'
    if (n >= 1000)    return (n / 1000).toFixed(n % 1000 ? 1 : 0) + 'K'
    return n.toString()
  }
  if (range.max === Infinity) return '500K+'
  return `${fmt(range.min)}–${fmt(range.max)}`
}

function formatRangeFull(range) {
  const fmt = n => n.toLocaleString()
  if (range.max === Infinity) return '500,001 and over'
  return `${fmt(range.min)} – ${fmt(range.max)}`
}

export default function App() {
  const [lotInput, setLotInput]         = useState('1500')
  const [inspectionLevel, setLevel]     = useState('II')
  const [inspectionType, setType]       = useState('Normal')
  const [selectedAql, setAql]           = useState(1.0)
  const [showRefTable, setShowRefTable] = useState(false)

  const trackRef   = useRef(null)
  const dragging   = useRef(false)

  const parsedLot = parseInt(lotInput, 10)
  const validLot  = !isNaN(parsedLot) && parsedLot >= 2

  const rangeIdx = useMemo(
    () => validLot
      ? LOT_SIZE_RANGES.findIndex(r => parsedLot >= r.min && parsedLot <= r.max)
      : -1,
    [parsedLot, validLot]
  )

  const codeLetter = useMemo(
    () => validLot ? getCodeLetter(parsedLot, inspectionLevel) : null,
    [parsedLot, inspectionLevel, validLot]
  )

  const result = useMemo(
    () => validLot
      ? getSamplingPlan(parsedLot, inspectionLevel, inspectionType, selectedAql)
      : null,
    [parsedLot, inspectionLevel, inspectionType, selectedAql, validLot]
  )

  const allResults = useMemo(
    () => validLot ? getAllAqlResults(parsedLot, inspectionLevel, inspectionType) : [],
    [parsedLot, inspectionLevel, inspectionType, validLot]
  )

  const cursorPct = rangeIdx >= 0
    ? ((rangeIdx + 0.5) / RANGE_COUNT) * 100
    : null

  // ── Scale interaction ──────────────────────────────────────────────
  const posToLotSize = useCallback((clientX) => {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const x    = clientX - rect.left
    const pct  = Math.max(0, Math.min(0.9999, x / rect.width))
    const idx  = Math.min(Math.floor(pct * RANGE_COUNT), RANGE_COUNT - 1)
    return getRangeMidpoint(LOT_SIZE_RANGES[idx])
  }, [])

  const handleTrackPointerDown = useCallback((e) => {
    dragging.current = true
    trackRef.current.setPointerCapture(e.pointerId)
    const v = posToLotSize(e.clientX)
    if (v) setLotInput(v.toString())
  }, [posToLotSize])

  const handleTrackPointerMove = useCallback((e) => {
    if (!dragging.current) return
    const v = posToLotSize(e.clientX)
    if (v) setLotInput(v.toString())
  }, [posToLotSize])

  const handleTrackPointerUp = useCallback(() => {
    dragging.current = false
  }, [])

  const currentRange = rangeIdx >= 0 ? LOT_SIZE_RANGES[rangeIdx] : null
  const pctOfLot     = result && validLot
    ? ((result.sampleSize / parsedLot) * 100).toFixed(1)
    : null

  return (
    <div className="page">
      <div className="rule-outer">

        {/* ── Header plate ─────────────────────────────────────── */}
        <div className="rule-header">
          <span className="rivet">◉</span>
          <div className="header-center">
            <span className="header-title">AQL INSPECTOR'S RULE</span>
            <span className="header-std">ISO 2859-1 · ANSI/ASQ Z1.4 · MIL-STD-105E</span>
          </div>
          <span className="rivet">◉</span>
        </div>

        {/* ── Rule face ────────────────────────────────────────── */}
        <div className="rule-face">

          {/* Scale rail */}
          <div className="scale-rail">
            <div className="scale-row-label">LOT QUANTITY</div>

            <div
              className="scale-track"
              ref={trackRef}
              onPointerDown={handleTrackPointerDown}
              onPointerMove={handleTrackPointerMove}
              onPointerUp={handleTrackPointerUp}
              title="Drag or click to select lot size"
            >
              {/* Segments */}
              {LOT_SIZE_RANGES.map((range, i) => (
                <div
                  key={i}
                  className={`scale-seg${rangeIdx === i ? ' scale-seg-active' : ''}`}
                  style={{
                    left:  `${(i / RANGE_COUNT) * 100}%`,
                    width: `${100 / RANGE_COUNT}%`,
                  }}
                >
                  <div className="tick" />
                  <div className="seg-label">{formatRangeShort(range)}</div>
                </div>
              ))}

              {/* End tick */}
              <div className="tick tick-end" />

              {/* Cursor hairline */}
              {cursorPct !== null && (
                <div
                  className="cursor"
                  style={{ left: `${cursorPct}%` }}
                >
                  <div className="cursor-flag">▼</div>
                  <div className="cursor-line" />
                </div>
              )}
            </div>
          </div>

          {/* ── Sliding strip divider ── */}
          <div className="strip-divider">
            <div className="strip-edge top" />
            <div className="strip-body">
              <span className="strip-label">SAMPLE SIZE CODE LETTER</span>
            </div>
            <div className="strip-edge bottom" />
          </div>

          {/* ── Result windows ── */}
          <div className="windows-row">
            <Window label="CODE" note={result && result.codeLetter !== codeLetter ? `adj. from ${codeLetter}` : null}>
              <span className="val-code">{result?.codeLetter ?? codeLetter ?? '—'}</span>
            </Window>

            <div className="window-sep" />

            <Window label="SAMPLE SIZE" note={pctOfLot ? `${pctOfLot}% of lot` : null}>
              <span className="val-sample">{result?.sampleSize ?? '—'}</span>
            </Window>

            <div className="window-sep" />

            <Window label="ACCEPT  ≤" note="defects">
              <span className="val-accept">{result ? result.ac : '—'}</span>
            </Window>

            <div className="window-sep" />

            <Window label="REJECT  ≥" note="defects">
              <span className="val-reject">{result ? result.re : '—'}</span>
            </Window>
          </div>

        </div>{/* /rule-face */}

        {/* ── Settings rail ────────────────────────────────────── */}
        <div className="settings-rail">
          <SettingGroup label="INSP. LEVEL">
            {INSP_LEVELS.map(l => (
              <SegBtn key={l} active={inspectionLevel === l} onClick={() => setLevel(l)}>{l}</SegBtn>
            ))}
          </SettingGroup>

          <div className="settings-vsep" />

          <SettingGroup label="TYPE">
            {INSP_TYPES.map(t => (
              <SegBtn key={t} active={inspectionType === t} onClick={() => setType(t)}>{t}</SegBtn>
            ))}
          </SettingGroup>

          <div className="settings-vsep" />

          <SettingGroup label="AQL  %">
            {COMMON_AQL.map(a => (
              <SegBtn key={a} active={selectedAql === a} onClick={() => setAql(a)}>{a}</SegBtn>
            ))}
          </SettingGroup>
        </div>

        {/* ── Input / lot entry rail ────────────────────────────── */}
        <div className="input-rail">
          <span className="rivet small">◉</span>

          <div className="input-group">
            <label className="input-lbl" htmlFor="lot-qty">LOT QTY</label>
            <input
              id="lot-qty"
              className={`lot-input${lotInput && !validLot ? ' lot-input-err' : ''}`}
              type="number"
              min="2"
              placeholder="e.g. 1500"
              value={lotInput}
              onChange={e => setLotInput(e.target.value)}
            />
            {currentRange && (
              <span className="range-display">
                range&nbsp;&nbsp;{formatRangeFull(currentRange)}
              </span>
            )}
            {lotInput && !validLot && (
              <span className="input-err-msg">Enter a whole number ≥ 2</span>
            )}
          </div>

          <button
            className="ref-toggle"
            onClick={() => setShowRefTable(t => !t)}
            title="Toggle full AQL reference table"
          >
            {showRefTable ? '▲ HIDE TABLE' : '▼ FULL TABLE'}
          </button>

          <span className="rivet small">◉</span>
        </div>

        {/* ── Reference table (collapsible) ─────────────────────── */}
        {showRefTable && validLot && (
          <div className="ref-table-wrap">
            <div className="ref-table-header">
              ALL AQL LEVELS — {inspectionType.toUpperCase()} INSPECTION · LEVEL {inspectionLevel} · LOT {parsedLot.toLocaleString()}
            </div>
            <div className="ref-table-scroll">
              <table className="ref-table">
                <thead>
                  <tr>
                    <th>AQL %</th>
                    <th>Code</th>
                    <th>n</th>
                    <th>% Lot</th>
                    <th>Ac</th>
                    <th>Re</th>
                  </tr>
                </thead>
                <tbody>
                  {allResults
                    .filter(r => COMMON_AQL.includes(r.aql))
                    .map(({ aql, result: r }) => (
                    <tr
                      key={aql}
                      className={selectedAql === aql ? 'ref-row-active' : ''}
                      onClick={() => setAql(aql)}
                    >
                      <td className="rt-aql">{aql}%</td>
                      <td className="rt-code">{r?.codeLetter ?? '—'}</td>
                      <td className="rt-n">{r?.sampleSize ?? '—'}</td>
                      <td className="rt-pct">
                        {r && validLot ? `${((r.sampleSize / parsedLot) * 100).toFixed(1)}%` : '—'}
                      </td>
                      <td className="rt-ac">{r ? r.ac : '—'}</td>
                      <td className="rt-re">{r ? r.re : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Footer plate ─────────────────────────────────────── */}
        <div className="rule-footer">
          <span className="rivet">◉</span>
          <span className="footer-text">
            SINGLE SAMPLING PLAN · NORMAL / TIGHTENED / REDUCED
          </span>
          <span className="rivet">◉</span>
        </div>

      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────

function Window({ label, note, children }) {
  return (
    <div className="window">
      <div className="window-label">{label}</div>
      <div className="window-val">{children}</div>
      {note && <div className="window-note">{note}</div>}
    </div>
  )
}

function SettingGroup({ label, children }) {
  return (
    <div className="setting-group">
      <span className="setting-lbl">{label}</span>
      <div className="seg-btns">{children}</div>
    </div>
  )
}

function SegBtn({ active, onClick, children }) {
  return (
    <button
      className={`seg-btn${active ? ' seg-btn-active' : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

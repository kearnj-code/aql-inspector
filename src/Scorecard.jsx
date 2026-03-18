import { useState, useEffect, useCallback, useRef } from 'react'
import './scorecard.css'

// ── Storage helpers ────────────────────────────────────────────────
const STORAGE_KEY = 'chf-eos-scorecard'

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY + ':' + key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function save(key, value) {
  try { localStorage.setItem(STORAGE_KEY + ':' + key, JSON.stringify(value)) } catch {}
}

// ── Defaults ───────────────────────────────────────────────────────
const WEEKS = 5

function isoWeek() {
  const d = new Date()
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const startOfWeek1 = new Date(jan4)
  startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
  const diff = d - startOfWeek1
  return `W${Math.ceil((diff / 86400000 + 1) / 7)} ${d.getFullYear()}`
}

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

function nextId(arr) {
  return arr.length ? Math.max(...arr.map(x => x.id)) + 1 : 1
}

const DEFAULT_MEASURABLES = [
  { id: 1, name: 'First Pass Yield (%)', goal: '≥ 98', owner: 'J. Smith', values: Array(WEEKS).fill(''), onTrack: null },
  { id: 2, name: 'Defect Rate (PPM)', goal: '≤ 500', owner: 'M. Chen', values: Array(WEEKS).fill(''), onTrack: null },
  { id: 3, name: 'Inspection Completion (%)', goal: '= 100', owner: 'L. Park', values: Array(WEEKS).fill(''), onTrack: null },
  { id: 4, name: 'NCR Closure Rate (%)', goal: '≥ 90', owner: 'R. Torres', values: Array(WEEKS).fill(''), onTrack: null },
  { id: 5, name: 'Customer Complaints (#)', goal: '= 0', owner: 'J. Smith', values: Array(WEEKS).fill(''), onTrack: null },
  { id: 6, name: 'Supplier Reject Rate (%)', goal: '≤ 2', owner: 'M. Chen', values: Array(WEEKS).fill(''), onTrack: null },
]

const DEFAULT_ROCKS = [
  { id: 1, rock: 'Implement SPC for critical CTQ characteristics', owner: 'M. Chen', due: '2026-06-30', pct: 25, status: 'on' },
  { id: 2, rock: 'Reduce incoming inspection cycle time by 20%', owner: 'L. Park', due: '2026-06-30', pct: 10, status: 'on' },
  { id: 3, rock: 'Complete ISO 9001:2015 internal audit program', owner: 'R. Torres', due: '2026-06-30', pct: 50, status: 'off' },
  { id: 4, rock: 'Train all inspectors on updated work instructions', owner: 'J. Smith', due: '2026-06-30', pct: 75, status: 'on' },
]

const DEFAULT_TODOS = [
  { id: 1, action: 'Update control charts for Line 3', owner: 'M. Chen', due: '2026-03-20', done: false },
  { id: 2, action: 'Review and respond to supplier audit reports', owner: 'L. Park', due: '2026-03-18', done: false },
  { id: 3, action: 'Send weekly NCR summary to Operations', owner: 'R. Torres', due: '2026-03-17', done: true },
  { id: 4, action: 'Schedule calibration for CMM gauges', owner: 'J. Smith', due: '2026-03-21', done: false },
]

const DEFAULT_ISSUES = [
  { id: 1, issue: 'Supplier XYZ repeat rejections on Part #4872', priority: 'High', owner: 'J. Smith' },
  { id: 2, issue: 'Measurement gauge calibration overdue (3 units)', priority: 'Med', owner: 'L. Park' },
  { id: 3, issue: 'SOP-QA-07 needs update after process change', priority: 'Low', owner: 'M. Chen' },
]

const WEEK_LABELS = (() => {
  const labels = []
  const now = new Date()
  for (let i = WEEKS - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i * 7)
    labels.push(`W${Math.ceil((d - new Date(d.getFullYear(), 0, 1)) / 604800000)}`)
  }
  return labels
})()

// ── Main Component ─────────────────────────────────────────────────
export default function Scorecard() {
  const [teamName, setTeamName] = useState(() => load('teamName', 'CHF Quality Team'))
  const [meetingDate, setMeetingDate] = useState(() => load('meetingDate', todayStr()))
  const [quarter, setQuarter] = useState(() => load('quarter', 'Q2 2026'))
  const [measurables, setMeasurables] = useState(() => load('measurables', DEFAULT_MEASURABLES))
  const [rocks, setRocks] = useState(() => load('rocks', DEFAULT_ROCKS))
  const [todos, setTodos] = useState(() => load('todos', DEFAULT_TODOS))
  const [issues, setIssues] = useState(() => load('issues', DEFAULT_ISSUES))
  const [emailTo, setEmailTo] = useState(() => load('emailTo', ''))
  const [showEmailPanel, setShowEmailPanel] = useState(false)
  const [copied, setCopied] = useState(false)
  const emailInputRef = useRef(null)

  // Persist on change
  useEffect(() => { save('teamName', teamName) }, [teamName])
  useEffect(() => { save('meetingDate', meetingDate) }, [meetingDate])
  useEffect(() => { save('quarter', quarter) }, [quarter])
  useEffect(() => { save('measurables', measurables) }, [measurables])
  useEffect(() => { save('rocks', rocks) }, [rocks])
  useEffect(() => { save('todos', todos) }, [todos])
  useEffect(() => { save('issues', issues) }, [issues])
  useEffect(() => { save('emailTo', emailTo) }, [emailTo])

  // ── Measurables ──────────────────────────────────────────────────
  const updateMeasurable = useCallback((id, field, value) => {
    setMeasurables(prev => prev.map(m =>
      m.id === id ? { ...m, [field]: value } : m
    ))
  }, [])

  const updateMeasurableValue = useCallback((id, weekIdx, value) => {
    setMeasurables(prev => prev.map(m => {
      if (m.id !== id) return m
      const values = [...m.values]
      values[weekIdx] = value
      return { ...m, values }
    }))
  }, [])

  const addMeasurable = useCallback(() => {
    setMeasurables(prev => [...prev, {
      id: nextId(prev), name: 'New Metric', goal: '', owner: '', values: Array(WEEKS).fill(''), onTrack: null
    }])
  }, [])

  const removeMeasurable = useCallback((id) => {
    setMeasurables(prev => prev.filter(m => m.id !== id))
  }, [])

  // ── Rocks ────────────────────────────────────────────────────────
  const updateRock = useCallback((id, field, value) => {
    setRocks(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const addRock = useCallback(() => {
    setRocks(prev => [...prev, { id: nextId(prev), rock: 'New Rock', owner: '', due: '', pct: 0, status: 'on' }])
  }, [])

  const removeRock = useCallback((id) => {
    setRocks(prev => prev.filter(r => r.id !== id))
  }, [])

  // ── Todos ────────────────────────────────────────────────────────
  const updateTodo = useCallback((id, field, value) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t))
  }, [])

  const addTodo = useCallback(() => {
    setTodos(prev => [...prev, { id: nextId(prev), action: 'New action item', owner: '', due: '', done: false }])
  }, [])

  const removeTodo = useCallback((id) => {
    setTodos(prev => prev.filter(t => t.id !== id))
  }, [])

  // ── Issues ───────────────────────────────────────────────────────
  const updateIssue = useCallback((id, field, value) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i))
  }, [])

  const addIssue = useCallback(() => {
    setIssues(prev => [...prev, { id: nextId(prev), issue: 'New issue', priority: 'Med', owner: '' }])
  }, [])

  const removeIssue = useCallback((id) => {
    setIssues(prev => prev.filter(i => i.id !== id))
  }, [])

  // ── Email export ─────────────────────────────────────────────────
  const buildEmailBody = useCallback(() => {
    const hr = '─'.repeat(58)
    const lines = []

    lines.push(`EOS SCORECARD — ${teamName.toUpperCase()}`)
    lines.push(`Meeting Date: ${meetingDate}   Quarter: ${quarter}`)
    lines.push('')
    lines.push(hr)
    lines.push('SCORECARD (MEASURABLES)')
    lines.push(hr)
    measurables.forEach(m => {
      const latest = [...m.values].reverse().find(v => v !== '') ?? '—'
      const track = m.onTrack === true ? '[ON]' : m.onTrack === false ? '[OFF]' : '[?]'
      lines.push(`${track} ${m.name}`)
      lines.push(`     Goal: ${m.goal || '—'}   Owner: ${m.owner || '—'}   Latest: ${latest}`)
      const weekStr = WEEK_LABELS.map((wk, i) => `${wk}:${m.values[i] || '—'}`).join('  ')
      lines.push(`     ${weekStr}`)
    })

    lines.push('')
    lines.push(hr)
    lines.push(`ROCKS — ${quarter}`)
    lines.push(hr)
    rocks.forEach(r => {
      const track = r.status === 'on' ? '[ON TRACK]' : '[OFF TRACK]'
      lines.push(`${track}  ${r.rock}`)
      lines.push(`   Owner: ${r.owner || '—'}   Due: ${r.due || '—'}   Progress: ${r.pct}%`)
    })

    lines.push('')
    lines.push(hr)
    lines.push('TO-DO / ACTION ITEMS')
    lines.push(hr)
    todos.forEach(t => {
      const done = t.done ? '[DONE]' : '[    ]'
      lines.push(`${done} ${t.action}`)
      lines.push(`       Owner: ${t.owner || '—'}   Due: ${t.due || '—'}`)
    })

    lines.push('')
    lines.push(hr)
    lines.push('ISSUES LIST (IDS)')
    lines.push(hr)
    issues.forEach(i => {
      lines.push(`[${i.priority.toUpperCase()}] ${i.issue}`)
      lines.push(`      Owner: ${i.owner || '—'}`)
    })

    lines.push('')
    lines.push(hr)
    lines.push(`Generated: ${new Date().toLocaleString()}`)

    return lines.join('\n')
  }, [teamName, meetingDate, quarter, measurables, rocks, todos, issues])

  const handleSendEmail = useCallback(() => {
    const subject = encodeURIComponent(`EOS Scorecard – ${teamName} – ${meetingDate}`)
    const body = encodeURIComponent(buildEmailBody())
    const to = encodeURIComponent(emailTo)
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`
  }, [emailTo, teamName, meetingDate, buildEmailBody])

  const handleCopyText = useCallback(() => {
    const text = buildEmailBody()
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [buildEmailBody])

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div className="sc-page">
      {/* ── Page header ── */}
      <div className="sc-header">
        <div className="sc-header-left">
          <div className="sc-logo">EOS</div>
          <div className="sc-header-info">
            <EditableText
              className="sc-team-name"
              value={teamName}
              onChange={setTeamName}
              aria-label="Team name"
            />
            <div className="sc-meta-row">
              <label className="sc-meta-label">Meeting Date</label>
              <input
                type="date"
                className="sc-meta-input"
                value={meetingDate}
                onChange={e => setMeetingDate(e.target.value)}
              />
              <label className="sc-meta-label">Quarter</label>
              <input
                type="text"
                className="sc-meta-input sc-meta-input--short"
                value={quarter}
                onChange={e => setQuarter(e.target.value)}
                placeholder="Q2 2026"
              />
            </div>
          </div>
        </div>
        <button className="sc-email-btn" onClick={() => setShowEmailPanel(p => !p)}>
          <span className="sc-email-icon">✉</span>
          Export via Email
        </button>
      </div>

      {/* ── Email panel ── */}
      {showEmailPanel && (
        <div className="sc-email-panel">
          <div className="sc-email-panel-inner">
            <div className="sc-email-row">
              <label className="sc-email-label">To:</label>
              <input
                ref={emailInputRef}
                type="email"
                className="sc-email-input"
                placeholder="team@company.com"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
              />
              <button className="sc-action-btn sc-action-btn--primary" onClick={handleSendEmail}>
                Open in Mail App
              </button>
              <button className="sc-action-btn" onClick={handleCopyText}>
                {copied ? 'Copied!' : 'Copy Text'}
              </button>
              <button className="sc-action-btn sc-action-btn--ghost" onClick={() => setShowEmailPanel(false)}>
                ✕
              </button>
            </div>
            <p className="sc-email-hint">
              Opens your default mail client with a pre-filled scorecard summary. Or copy the plain-text version to paste anywhere.
            </p>
          </div>
        </div>
      )}

      {/* ── Body ── */}
      <div className="sc-body">

        {/* ── Section: Scorecard / Measurables ── */}
        <Section
          title="Scorecard"
          subtitle="Weekly Measurables"
          badge={`${measurables.filter(m => m.onTrack === true).length}/${measurables.length} on track`}
          badgeColor={measurables.every(m => m.onTrack !== false) ? 'green' : 'red'}
          onAdd={addMeasurable}
          addLabel="+ Add Metric"
        >
          <div className="sc-table-wrap">
            <table className="sc-table">
              <thead>
                <tr>
                  <th className="sc-th sc-th--track">Track</th>
                  <th className="sc-th sc-th--name">Metric</th>
                  <th className="sc-th sc-th--goal">Goal</th>
                  <th className="sc-th sc-th--owner">Owner</th>
                  {WEEK_LABELS.map((wk, i) => (
                    <th key={i} className={`sc-th sc-th--week${i === WEEK_LABELS.length - 1 ? ' sc-th--current' : ''}`}>{wk}</th>
                  ))}
                  <th className="sc-th sc-th--del" />
                </tr>
              </thead>
              <tbody>
                {measurables.map(m => (
                  <tr key={m.id} className={`sc-tr${m.onTrack === false ? ' sc-tr--off' : m.onTrack === true ? ' sc-tr--on' : ''}`}>
                    <td className="sc-td sc-td--track">
                      <TrackToggle value={m.onTrack} onChange={v => updateMeasurable(m.id, 'onTrack', v)} />
                    </td>
                    <td className="sc-td sc-td--name">
                      <input
                        className="sc-cell-input sc-cell-input--name"
                        value={m.name}
                        onChange={e => updateMeasurable(m.id, 'name', e.target.value)}
                      />
                    </td>
                    <td className="sc-td">
                      <input
                        className="sc-cell-input sc-cell-input--goal"
                        value={m.goal}
                        onChange={e => updateMeasurable(m.id, 'goal', e.target.value)}
                        placeholder="Goal"
                      />
                    </td>
                    <td className="sc-td">
                      <input
                        className="sc-cell-input sc-cell-input--owner"
                        value={m.owner}
                        onChange={e => updateMeasurable(m.id, 'owner', e.target.value)}
                        placeholder="Owner"
                      />
                    </td>
                    {m.values.map((val, i) => (
                      <td key={i} className={`sc-td sc-td--week${i === WEEK_LABELS.length - 1 ? ' sc-td--current' : ''}`}>
                        <input
                          className="sc-cell-input sc-cell-input--val"
                          value={val}
                          onChange={e => updateMeasurableValue(m.id, i, e.target.value)}
                          placeholder="—"
                        />
                      </td>
                    ))}
                    <td className="sc-td sc-td--del">
                      <DelBtn onClick={() => removeMeasurable(m.id)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── Section: Rocks ── */}
        <Section
          title="Rocks"
          subtitle={quarter}
          badge={`${rocks.filter(r => r.status === 'on').length}/${rocks.length} on track`}
          badgeColor={rocks.every(r => r.status === 'on') ? 'green' : 'amber'}
          onAdd={addRock}
          addLabel="+ Add Rock"
        >
          <div className="sc-rocks-list">
            {rocks.map(r => (
              <div key={r.id} className={`sc-rock-card${r.status === 'off' ? ' sc-rock-card--off' : ''}`}>
                <div className="sc-rock-status">
                  <StatusToggle value={r.status} onChange={v => updateRock(r.id, 'status', v)} />
                </div>
                <div className="sc-rock-body">
                  <input
                    className="sc-rock-title"
                    value={r.rock}
                    onChange={e => updateRock(r.id, 'rock', e.target.value)}
                    placeholder="Rock description"
                  />
                  <div className="sc-rock-meta">
                    <span className="sc-rock-meta-item">
                      <span className="sc-rock-meta-label">Owner</span>
                      <input
                        className="sc-inline-input"
                        value={r.owner}
                        onChange={e => updateRock(r.id, 'owner', e.target.value)}
                        placeholder="—"
                      />
                    </span>
                    <span className="sc-rock-meta-item">
                      <span className="sc-rock-meta-label">Due</span>
                      <input
                        type="date"
                        className="sc-inline-input"
                        value={r.due}
                        onChange={e => updateRock(r.id, 'due', e.target.value)}
                      />
                    </span>
                    <span className="sc-rock-meta-item sc-rock-pct-item">
                      <span className="sc-rock-meta-label">Progress</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className="sc-inline-input sc-inline-input--pct"
                        value={r.pct}
                        onChange={e => updateRock(r.id, 'pct', Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                      />
                      <span className="sc-rock-meta-label">%</span>
                    </span>
                  </div>
                  <div className="sc-progress-bar">
                    <div className="sc-progress-fill" style={{ width: `${r.pct}%`, background: r.status === 'on' ? 'var(--sc-green)' : 'var(--sc-red)' }} />
                  </div>
                </div>
                <DelBtn onClick={() => removeRock(r.id)} />
              </div>
            ))}
          </div>
        </Section>

        {/* ── Two-column: Todos + Issues ── */}
        <div className="sc-two-col">

          {/* ── Section: To-Do List ── */}
          <Section
            title="To-Do List"
            subtitle="7-Day Actions"
            badge={`${todos.filter(t => t.done).length}/${todos.length} done`}
            badgeColor={todos.length > 0 && todos.every(t => t.done) ? 'green' : 'neutral'}
            onAdd={addTodo}
            addLabel="+ Add Action"
          >
            <div className="sc-todo-list">
              {todos.map(t => (
                <div key={t.id} className={`sc-todo-item${t.done ? ' sc-todo-item--done' : ''}`}>
                  <input
                    type="checkbox"
                    className="sc-checkbox"
                    checked={t.done}
                    onChange={e => updateTodo(t.id, 'done', e.target.checked)}
                  />
                  <div className="sc-todo-body">
                    <input
                      className="sc-todo-action"
                      value={t.action}
                      onChange={e => updateTodo(t.id, 'action', e.target.value)}
                      placeholder="Action item"
                    />
                    <div className="sc-todo-meta">
                      <input
                        className="sc-inline-input sc-inline-input--sm"
                        value={t.owner}
                        onChange={e => updateTodo(t.id, 'owner', e.target.value)}
                        placeholder="Owner"
                      />
                      <input
                        type="date"
                        className="sc-inline-input sc-inline-input--sm"
                        value={t.due}
                        onChange={e => updateTodo(t.id, 'due', e.target.value)}
                      />
                    </div>
                  </div>
                  <DelBtn onClick={() => removeTodo(t.id)} />
                </div>
              ))}
            </div>
          </Section>

          {/* ── Section: Issues List ── */}
          <Section
            title="Issues List"
            subtitle="IDS — Identify · Discuss · Solve"
            badge={`${issues.length} open`}
            badgeColor={issues.length === 0 ? 'green' : 'neutral'}
            onAdd={addIssue}
            addLabel="+ Add Issue"
          >
            <div className="sc-issues-list">
              {issues.map(i => (
                <div key={i.id} className="sc-issue-item">
                  <PriorityBadge
                    value={i.priority}
                    onChange={v => updateIssue(i.id, 'priority', v)}
                  />
                  <div className="sc-issue-body">
                    <input
                      className="sc-issue-text"
                      value={i.issue}
                      onChange={e => updateIssue(i.id, 'issue', e.target.value)}
                      placeholder="Issue description"
                    />
                    <input
                      className="sc-inline-input sc-inline-input--sm"
                      value={i.owner}
                      onChange={e => updateIssue(i.id, 'owner', e.target.value)}
                      placeholder="Owner"
                    />
                  </div>
                  <DelBtn onClick={() => removeIssue(i.id)} />
                </div>
              ))}
            </div>
          </Section>

        </div>{/* /sc-two-col */}

      </div>{/* /sc-body */}

      <div className="sc-footer">
        <span>CHF Quality Team · EOS Scorecard</span>
        <span>All data saved locally in your browser</span>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────

function Section({ title, subtitle, badge, badgeColor, onAdd, addLabel, children }) {
  return (
    <div className="sc-section">
      <div className="sc-section-header">
        <div className="sc-section-title-group">
          <h2 className="sc-section-title">{title}</h2>
          {subtitle && <span className="sc-section-subtitle">{subtitle}</span>}
        </div>
        <div className="sc-section-actions">
          {badge && <span className={`sc-badge sc-badge--${badgeColor}`}>{badge}</span>}
          {onAdd && (
            <button className="sc-add-btn" onClick={onAdd}>{addLabel}</button>
          )}
        </div>
      </div>
      <div className="sc-section-body">{children}</div>
    </div>
  )
}

function EditableText({ className, value, onChange, ...rest }) {
  return (
    <input
      className={className}
      value={value}
      onChange={e => onChange(e.target.value)}
      {...rest}
    />
  )
}

function TrackToggle({ value, onChange }) {
  const cycle = () => {
    if (value === null) onChange(true)
    else if (value === true) onChange(false)
    else onChange(null)
  }
  return (
    <button
      className={`sc-track-btn${value === true ? ' sc-track-btn--on' : value === false ? ' sc-track-btn--off' : ''}`}
      onClick={cycle}
      title={value === true ? 'On Track – click to toggle' : value === false ? 'Off Track – click to toggle' : 'Not set – click to set'}
    >
      {value === true ? '●' : value === false ? '●' : '○'}
    </button>
  )
}

function StatusToggle({ value, onChange }) {
  return (
    <button
      className={`sc-status-pill${value === 'on' ? ' sc-status-pill--on' : ' sc-status-pill--off'}`}
      onClick={() => onChange(value === 'on' ? 'off' : 'on')}
      title="Click to toggle on/off track"
    >
      {value === 'on' ? 'On Track' : 'Off Track'}
    </button>
  )
}

function PriorityBadge({ value, onChange }) {
  const cycle = () => {
    if (value === 'High') onChange('Med')
    else if (value === 'Med') onChange('Low')
    else onChange('High')
  }
  return (
    <button
      className={`sc-priority sc-priority--${value.toLowerCase()}`}
      onClick={cycle}
      title="Click to change priority"
    >
      {value}
    </button>
  )
}

function DelBtn({ onClick }) {
  return (
    <button className="sc-del-btn" onClick={onClick} title="Remove row" aria-label="Remove">
      ✕
    </button>
  )
}

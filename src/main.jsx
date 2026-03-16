import React, { useState } from 'react'
import ReactDOM from 'react-dom/client'
import AqlApp from './App'
import Scorecard from './Scorecard'
import './index.css'
import './nav.css'

function Root() {
  const [tool, setTool] = useState(() => {
    try { return localStorage.getItem('active-tool') || 'scorecard' } catch { return 'scorecard' }
  })

  const switchTo = (t) => {
    setTool(t)
    try { localStorage.setItem('active-tool', t) } catch {}
  }

  return (
    <>
      <nav className="app-nav">
        <span className="app-nav-brand">CHF Quality Tools</span>
        <div className="app-nav-tabs">
          <button
            className={`app-nav-tab${tool === 'scorecard' ? ' app-nav-tab--active' : ''}`}
            onClick={() => switchTo('scorecard')}
          >
            EOS Scorecard
          </button>
          <button
            className={`app-nav-tab${tool === 'aql' ? ' app-nav-tab--active' : ''}`}
            onClick={() => switchTo('aql')}
          >
            AQL Inspector
          </button>
        </div>
      </nav>

      {tool === 'scorecard' ? <Scorecard /> : <AqlApp />}
    </>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

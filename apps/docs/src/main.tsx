import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { Router } from './site/router'
import { SettingsProvider } from './site/settings'
import './styles/docs.css'

const container = document.getElementById('root')
if (!container) throw new Error('missing #root')

createRoot(container).render(
  <StrictMode>
    <Router>
      <SettingsProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </SettingsProvider>
    </Router>
  </StrictMode>,
)

import React from 'react'
import ReactDOM from 'react-dom/client'
import { InsforgeProvider } from '@insforge/react'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <InsforgeProvider
      baseUrl={import.meta.env.VITE_INSFORGE_BASE_URL || 'https://nsir3ccz.us-east.insforge.app'}
    >
      <App />
    </InsforgeProvider>
  </React.StrictMode>,
)


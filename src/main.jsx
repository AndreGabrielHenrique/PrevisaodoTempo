// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './css/index.css'
import App from './App.jsx'

// Ponto de entrada principal da aplicação
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Habilita verificações extras de desenvolvimento */}
    <App />
  </StrictMode>,
)
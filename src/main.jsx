// src/main.jsx

// Importa StrictMode do React para verificações extras de desenvolvimento
import { StrictMode } from 'react'
// Importa função para criar raiz de renderização do React 18+
import { createRoot } from 'react-dom/client'
// Importa estilos globais (SASS compilado para CSS)
import './sass/index.sass'
// Importa o componente principal da aplicação
import App from './App.jsx'

// Ponto de entrada principal da aplicação: renderiza o React na div#root do HTML
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Habilita verificações extras de desenvolvimento (ex: detectar efeitos colaterais, depreciações) */}
    <App />
  </StrictMode>,
)
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom' // <- Asegúrate de que esté importado aquí
import './index.css' // O tus estilos de Tailwind

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter> {/* Envuélvelo AQUÍ, afuera de App */}
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
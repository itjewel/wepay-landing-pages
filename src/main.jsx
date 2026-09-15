import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SuccessPage from './components/SuccessPage.jsx'

const isSuccessPage = window.location.pathname === '/success'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {isSuccessPage ? <SuccessPage /> : <App />}
  </StrictMode>,
)

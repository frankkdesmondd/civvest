import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from './context/ToastContext';
import { UserProvider } from './context/UserContext.tsx';
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UserProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </UserProvider>
  </StrictMode>,
)

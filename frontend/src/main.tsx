import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './styles/tailwind.css';
import { AuthProvider } from './context/AuthContext.tsx';

// Application bootstrap sequence:
// - Load global CSS and Tailwind utility layers
// - Provide authentication state to the full component tree
// - Mount the routed React app into the DOM root element

createRoot(document.getElementById('root')!).render(
  <AuthProvider>
    <App />
  </AuthProvider>,
)

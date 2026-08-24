import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { LanguageProvider } from './context/LanguageProvider.tsx'

// eslint-disable-next-line no-console
console.info(`[my-favorite] build: ${__BUILD_TIME__}`);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
    </LanguageProvider>
  </StrictMode>,
)

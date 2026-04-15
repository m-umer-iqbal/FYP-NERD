import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from "./App"
import { ClerkProvider } from "@clerk/chrome-extension"

const key = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!key) {
  throw new Error("VITE_CLERK_PUBLISHABLE_KEY does not found.");
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ClerkProvider
      publishableKey={key}
    >
      <App />
    </ClerkProvider>
  </StrictMode>,
)

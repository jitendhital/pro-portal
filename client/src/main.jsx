import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { store, persistor } from './redux/store.js'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastProvider } from './contexts/ToastContext'
import { ThemeProvider } from './contexts/ThemeContext'
import ErrorBoundary from './ErrorBoundary.jsx'

console.log('🚀 Starting app...');
console.log('Root element:', document.getElementById('root'));

// Error boundary to catch any rendering errors
try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }

  console.log('✅ Root element found, rendering app...');

  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <Provider store={store}>
          <PersistGate loading={<div style={{ padding: '20px', textAlign: 'center', background: 'purple', color: 'white' }}>Loading...</div>} persistor={persistor}>
            <ThemeProvider>
              <ToastProvider>
                <App />
              </ToastProvider>
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </ErrorBoundary>
    </StrictMode>
  );

  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; color: red; background: #fee;">
        <h1>Error Loading App</h1>
        <p><strong>Error:</strong> ${error.message}</p>
        <pre style="background: #fdd; padding: 10px; overflow: auto;">${error.stack}</pre>
        <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 10px; background: red; color: white; border: none; cursor: pointer;">Reload Page</button>
      </div>
    `;
  }
}

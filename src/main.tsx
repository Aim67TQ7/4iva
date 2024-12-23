import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Only render the app if we're in development mode
if (process.env.NODE_ENV === 'development') {
  createRoot(document.getElementById("root")!).render(<App />);
}

// Export the components for library use
export * from './lib';
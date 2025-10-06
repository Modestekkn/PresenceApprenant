import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { initializeDatabase } from './config/db';
import { ToastProvider } from './components/UI/Toast';

function App() {
  useEffect(() => {
    // Initialiser la base de données au démarrage
    initializeDatabase().catch(console.error);
  }, []);

  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;

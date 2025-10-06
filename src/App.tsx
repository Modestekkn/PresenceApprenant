import { useEffect } from 'react';
import { AppRouter } from './routes/AppRouter';
import { initializeDatabase } from './config/db';
import { ToastProvider } from './components/UI/Toast';
import { initializeApp } from './utils/appInitializer';

function App() {
  useEffect(() => {
    const initApp = async () => {
      try {
        // Initialiser la base de données
        await initializeDatabase();
        console.log('✅ Base de données initialisée');

        // Initialiser tous les services de l'application
        await initializeApp({
          api: {
            baseUrl: 'http://localhost:3001/api',
            timeout: 10000,
            enableSync: false // Changez en true quand le backend est prêt
          },
          notifications: {
            enabled: true,
            requestPermissionOnLoad: true,
            reminderAdvanceTime: 30
          },
          pwa: {
            enableServiceWorker: true,
            enableBackgroundSync: true
          },
          app: {
            presenceTimeWindow: {
              start: '07:30',
              end: '08:00'
            },
            defaultSessionDuration: 120,
            autoSaveInterval: 30000
          }
        });

        console.log('🎉 Application prête à l\'utilisation');
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation de l\'application:', error);
      }
    };

    initApp();
  }, []);

  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
}

export default App;

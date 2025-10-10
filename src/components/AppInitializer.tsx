import { useEffect, useState } from 'react';
import App from '../App';
import { seedDatabase } from '../utils/seed';

/**
 * Ce composant a pour seul rôle d'exécuter le script d'initialisation
 * de la base de données (`seedDatabase`) une seule fois au chargement de l'application.
 */
const AppInitializer = () => {
  const [isSeeding, setIsSeeding] = useState(true);
  const [seedError, setSeedError] = useState<string | null>(null);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log('🚀 Initialisation de l\'application...');
        await seedDatabase();
        console.log('✅ Application initialisée avec succès');
        setIsSeeding(false);
      } catch (error) {
        console.error('❌ Erreur fatale lors de l\'initialisation:', error);
        setSeedError(error instanceof Error ? error.message : 'Erreur inconnue');
        setIsSeeding(false);
      }
    };

    initializeApp();
  }, []);

  if (isSeeding) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Initialisation de l'application...</p>
        </div>
      </div>
    );
  }

  if (seedError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg">
          <h2 className="text-red-600 text-xl font-bold mb-2">Erreur d'initialisation</h2>
          <p className="text-red-800 mb-4">{seedError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return <App />;
};

export default AppInitializer;

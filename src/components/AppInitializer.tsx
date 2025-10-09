import { useEffect } from 'react';
import App from '../App';
import { seedDatabase } from '../utils/seed';

/**
 * Ce composant a pour seul rôle d'exécuter le script d'initialisation
 * de la base de données (`seedDatabase`) une seule fois au chargement de l'application.
 */
const AppInitializer = () => {
  useEffect(() => {
    seedDatabase();
  }, []);

  return <App />;
};

export default AppInitializer;

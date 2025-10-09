import { superadminStorage, formateurStorage } from './storageUtils';
import { db } from '@/config/db';

/**
 * Initialise la base de données avec des données par défaut si elle est vide.
 * Cette fonction est conçue pour être appelée une seule fois au démarrage de l'application.
 */
export const seedDatabase = async () => {
  try {
    // Vérifie si la table des superadmins est vide
    const superadminCount = await db.superadmins.count();

    if (superadminCount === 0) {
      console.log('Base de données vide, initialisation des données par défaut...');

      // Créer le superadmin par défaut
      await superadminStorage.create({
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@presence.app',
        mot_de_passe: 'admin123',
      });
      console.log('Superadmin par défaut créé.');

      // Vérifie si la table des formateurs est vide
      const formateurCount = await db.formateurs.count();
      if (formateurCount === 0) {
        // Créer le formateur par défaut
        await formateurStorage.create({
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@formation.com',
          mot_de_passe: 'formateur123',
          numero_telephone: '0102030405', // Numéro par défaut
        });
        console.log('Formateur par défaut créé.');
      }
      
      console.log('Initialisation de la base de données terminée.');
    } else {
      console.log('La base de données contient déjà des données. Aucune initialisation nécessaire.');
    }
  } catch (error) {
    console.error("Erreur lors de l'initialisation de la base de données :", error);
  }
};

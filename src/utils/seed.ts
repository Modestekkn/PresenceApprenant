import { superadminStorage, formateurStorage } from './storageUtils';
import { db } from '@/config/db';

/**
 * Initialise la base de données avec des données par défaut si elle est vide.
 * Cette fonction est conçue pour être appelée une seule fois au démarrage de l'application.
 */
export const seedDatabase = async () => {
  try {
    console.log('🌱 Démarrage du seeding de la base de données...');
    
    // Vérifie si la base de données est accessible
    await db.open();
    console.log('✅ Base de données ouverte avec succès');
    
    // Vérifie si la table des superadmins est vide
    const superadminCount = await db.superadmins.count();
    console.log(`📊 Nombre de superadmins existants: ${superadminCount}`);

    if (superadminCount === 0) {
      console.log('🔄 Base de données vide, initialisation des données par défaut...');

      // Créer le superadmin par défaut
      const superadmin = await superadminStorage.create({
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@presence.app',
        mot_de_passe: 'admin123',
      });
      console.log('✅ Superadmin par défaut créé:', superadmin);

      // Vérifie si la table des formateurs est vide
      const formateurCount = await db.formateurs.count();
      console.log(`📊 Nombre de formateurs existants: ${formateurCount}`);
      
      if (formateurCount === 0) {
        // Créer le formateur par défaut
        const formateur = await formateurStorage.create({
          nom: 'Dupont',
          prenom: 'Jean',
          email: 'jean.dupont@formation.com',
          mot_de_passe: 'formateur123',
          numero_telephone: '0102030405',
        });
        console.log('✅ Formateur par défaut créé:', formateur);
      }
      
      console.log('🎉 Initialisation de la base de données terminée avec succès!');
    } else {
      console.log('ℹ️ La base de données contient déjà des données. Aucune initialisation nécessaire.');
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation de la base de données :", error);
    console.error("Détails de l'erreur:", {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
  }
};

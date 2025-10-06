import Dexie, { Table } from 'dexie';

// Types pour la base de données
export interface Superadmin {
  id_superadmin?: number;
  nom: string;
  prenom: string;
  email: string;
  mot_de_passe: string;
  created_at?: Date;
}

export interface Formateur {
  id_formateur?: number;
  nom: string;
  prenom: string;
  email: string;
  numero_telephone: string;
  mot_de_passe: string;
  created_at?: Date;
}

export interface Apprenant {
  id_apprenant?: number;
  nom: string;
  prenom: string;
  email?: string;
  numero_telephone?: string;
  created_at?: Date;
}

export interface Formation {
  id_formation?: number;
  nom_formation: string;
  description: string;
  id_formateur: number;
  created_at?: Date;
}

export interface Session {
  id_session?: number;
  date_session: string;
  heure_debut: string;
  heure_fin: string;
  id_formation: number;
  id_formateur: number;
  statut: 'planifiée' | 'en cours' | 'terminée';
  created_at?: Date;
}

export interface Presence {
  id_presence?: number;
  id_session: number;
  id_apprenant: number;
  heure_enregistrement: string;
  present: boolean;
  created_at?: Date;
}

export interface PresenceFormateur {
  id_presence_formateur?: number;
  id_session: number;
  id_formateur: number;
  heure_enregistrement: string;
  present: boolean;
  created_at?: Date;
}

export interface Rapport {
  id_rapport?: number;
  id_session: number;
  id_formateur: number;
  type_rapport: 'texte' | 'fichier';
  contenu: string;
  date_soumission: string;
  created_at?: Date;
}

// Table de liaison pour assigner les apprenants aux sessions
export interface SessionApprenant {
  id_session_apprenant?: number;
  id_session: number;
  id_apprenant: number;
  created_at?: Date;
}

// Configuration de la base de données Dexie
export class AttendanceDatabase extends Dexie {
  superadmins!: Table<Superadmin>;
  formateurs!: Table<Formateur>;
  apprenants!: Table<Apprenant>;
  formations!: Table<Formation>;
  sessions!: Table<Session>;
  session_apprenants!: Table<SessionApprenant>;
  presences!: Table<Presence>;
  presences_formateur!: Table<PresenceFormateur>;
  rapports!: Table<Rapport>;

  constructor() {
    super('AttendanceDatabase');
    
    this.version(1).stores({
      superadmins: '++id_superadmin, email',
      formateurs: '++id_formateur, email, numero_telephone',
      apprenants: '++id_apprenant, nom, prenom',
      formations: '++id_formation, nom_formation, id_formateur',
      sessions: '++id_session, date_session, id_formation, id_formateur, statut',
      session_apprenants: '++id_session_apprenant, id_session, id_apprenant',
      presences: '++id_presence, id_session, id_apprenant',
      presences_formateur: '++id_presence_formateur, id_session, id_formateur',
      rapports: '++id_rapport, id_session, id_formateur, date_soumission'
    });

    // Hook pour ajouter automatiquement les dates de création
    this.superadmins.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.formateurs.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.apprenants.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.formations.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.sessions.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.session_apprenants.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.presences.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.presences_formateur.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });

    this.rapports.hook('creating', function (_primKey, obj) {
      obj.created_at = new Date();
    });
  }
}

// Instance globale de la base de données
export const db = new AttendanceDatabase();

// Fonction d'initialisation avec données de test
export const initializeDatabase = async () => {
  try {
    // Vérifier si la base est déjà initialisée
    const superadminCount = await db.superadmins.count();
    
    if (superadminCount === 0) {
      // Créer un superadmin par défaut
      await db.superadmins.add({
        nom: 'Admin',
        prenom: 'Super',
        email: 'admin@presence.app',
        mot_de_passe: 'admin123', // À hasher en production
      });

      // Créer un formateur de test
      const formateurId = await db.formateurs.add({
        nom: 'Dupont',
        prenom: 'Jean',
        email: 'jean.dupont@formation.com',
        numero_telephone: '+229 97 12 34 56',
        mot_de_passe: 'formateur123', // À hasher en production
      });

      // Créer quelques apprenants de test
      await db.apprenants.bulkAdd([
        {
          nom: 'Martin',
          prenom: 'Alice',
          email: 'alice.martin@email.com',
          numero_telephone: '+229 95 11 22 33'
        },
        {
          nom: 'Bernard',
          prenom: 'Paul',
          email: 'paul.bernard@email.com',
          numero_telephone: '+229 96 44 55 66'
        },
        {
          nom: 'Durand',
          prenom: 'Sophie',
          email: 'sophie.durand@email.com',
          numero_telephone: '+229 97 77 88 99'
        }
      ]);

      // Créer une formation de test
      await db.formations.add({
        nom_formation: 'Développement Web Frontend',
        description: 'Formation complète sur le développement web frontend avec React',
        id_formateur: formateurId as number
      });

      console.log('Base de données initialisée avec succès !');
    }
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
  }
};
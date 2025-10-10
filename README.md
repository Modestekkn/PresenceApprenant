# PWA Gestion de Présence - Système de Suivi Intelligent

> Application Web Progressive moderne pour la gestion automatisée des présences en formation professionnelle.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-purple.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Deployment](https://img.shields.io/badge/Deployment-Vercel-black.svg)](https://presence-apprenant.vercel.app/)
[![Status](https://img.shields.io/badge/Status-Production-success.svg)](https://presence-apprenant.vercel.app/)

---

## Aperçu du projet

**PWA Gestion de Présence** est une application web progressive conçue pour automatiser et optimiser le suivi des présences dans les centres de formation professionnelle. Elle offre une interface intuitive, des contrôles temporels configurables et une gestion complète multi-rôles.

**Application en ligne** : [https://presence-apprenant.vercel.app/](https://presence-apprenant.vercel.app/)

**Dépôt GitHub** : [https://github.com/Modestekkn/PresenceApprenant](https://github.com/Modestekkn/PresenceApprenant)

### Fonctionnalités principales

**GESTION DES UTILISATEURS**
- Authentification Multi-Rôles (Superadmin / Formateur / Apprenant)
- Gestion complète des formateurs (CRUD)
- Gestion complète des apprenants (CRUD)
- Recherche et filtrage avancés

**GESTION DES FORMATIONS**
- Création et gestion de formations
- Assignation des formateurs
- Organisation des sessions
- Planification flexible

**SYSTÈME DE PRÉSENCE**
- Contrôles temporels configurables par le superadmin
- Marquage rapide des présences (formateur et apprenants)
- Validation avec plage horaire personnalisable
- Historique complet des présences
- Statistiques en temps réel

**RAPPORTS INTELLIGENTS**
- Inclusion automatique des données de présence
- Résumé visuel avant soumission
- Liste détaillée des apprenants présents/absents
- Statut du formateur inclus
- Export PDF des rapports
- Validation par le superadmin

**INTERFACE UTILISATEUR**
- Design moderne et responsive
- Optimisation mobile (boutons icônes adaptatifs)
- Tableaux de bord interactifs
- Notifications toast personnalisées
- Modales de confirmation élégantes
- Mode sombre (à venir)

**TECHNIQUE**
- Base de données locale (IndexedDB)
- Mode hors-ligne fonctionnel
- Synchronisation automatique
- PWA installable
- Performance optimisée

---

## Architecture technique

### Stack technologique
```
Frontend:        React 19.1.1 + TypeScript 5.9.3
Build Tool:      Vite 7.1.7 + ESBuild
Styling:         Tailwind CSS 3.x + CSS Variables
Database:        IndexedDB + Dexie.js 4.0.16
Routing:         React Router DOM v7
State:           React Context API + Hooks
Icons:           Lucide React
PWA:             Vite PWA Plugin + Service Worker
Linting:         ESLint + TypeScript ESLint
Deployment:      Vercel
```

### Structure du projet
```
presence-apprenant/
├── public/
│   ├── manifest.json              # Configuration PWA
│   └── icons/                     # Icônes d'application
├── src/
│   ├── components/                # Composants réutilisables
│   │   ├── Layout/               # Layout principal et navigation
│   │   ├── UI/                   # Composants UI (Button, Modal, Toast, etc.)
│   │   └── Dashboard/            # Composants spécifiques aux dashboards
│   ├── pages/                    # Pages de l'application
│   │   ├── Login.tsx             # Page de connexion
│   │   └── Dashboard/            # Tableaux de bord
│   │       ├── Superadmin/       # Interface superadmin
│   │       │   ├── SuperadminHome.tsx
│   │       │   ├── ManageFormateurs.tsx
│   │       │   ├── ManageApprenants.tsx
│   │       │   ├── ManageFormations.tsx
│   │       │   ├── ManageSessions.tsx
│   │       │   ├── ViewRapports.tsx
│   │       │   └── PresenceTimeSettings.tsx
│   │       └── Formateur/        # Interface formateur
│   │           ├── FormateurHome.tsx
│   │           ├── MarquerPresence.tsx
│   │           └── SoumettreRapport.tsx
│   ├── contexts/                 # Contexts React
│   │   └── AuthContext.tsx       # Gestion de l'authentification
│   ├── hooks/                    # Hooks personnalisés
│   │   ├── useAuth.ts            # Hook d'authentification
│   │   ├── usePresence.ts        # Hook de gestion des présences
│   │   └── useConfirmation.ts    # Hook pour modales de confirmation
│   ├── utils/                    # Utilitaires
│   │   ├── storageUtils.ts       # Gestion de la base de données
│   │   └── seed.ts               # Initialisation des données
│   ├── config/                   # Configuration
│   │   ├── db.ts                 # Configuration IndexedDB (Dexie)
│   │   └── constants.ts          # Constantes et paramètres
│   └── routes/                   # Configuration du routage
│       └── AppRouter.tsx         # Définition des routes
├── package.json                  # Dépendances et scripts
├── tsconfig.json                 # Configuration TypeScript
├── tailwind.config.js            # Configuration Tailwind CSS
├── vite.config.ts                # Configuration Vite
└── README.md                     # Documentation
```

---

## Base de données

### Schéma des tables (IndexedDB v2)

| Table | Description | Champs Principaux | Index |
|-------|-------------|-------------------|-------|
| `superadmins` | Comptes administrateurs | `id`, `nom`, `prenom`, `email`, `mot_de_passe` | `email` |
| `formateurs` | Comptes formateurs | `id`, `nom`, `prenom`, `email`, `numero_telephone`, `mot_de_passe` | `email`, `numero_telephone` |
| `apprenants` | Liste des apprenants | `id`, `nom`, `prenom`, `email`, `numero_telephone` | `nom`, `prenom` |
| `formations` | Formations disponibles | `id`, `nom_formation`, `description`, `id_formateur` | `nom_formation`, `id_formateur` |
| `sessions` | Sessions de formation | `id`, `id_formation`, `id_formateur`, `date_session`, `heure_debut`, `heure_fin`, `statut` | `date_session`, `id_formation`, `id_formateur`, `statut` |
| `session_apprenants` | Apprenants assignés aux sessions | `id`, `id_session`, `id_apprenant` | `id_session`, `id_apprenant`, `[id_session+id_apprenant]` |
| `presences` | Présences des apprenants | `id`, `id_session`, `id_apprenant`, `present`, `heure_enregistrement` | `id_session`, `id_apprenant`, `[id_session+id_apprenant]` |
| `presences_formateur` | Présences des formateurs | `id`, `id_session`, `id_formateur`, `present`, `heure_enregistrement` | `id_session`, `id_formateur`, `[id_session+id_formateur]` |
| `rapports` | Rapports de sessions | `id`, `id_session`, `id_formateur`, `type_rapport`, `contenu`, `date_soumission`, `statut` | `id_session`, `id_formateur`, `date_soumission` |

**Note importante**: Les index composés `[id_session+id_apprenant]` et `[id_session+id_formateur]` sont essentiels pour les requêtes de présence et évitent les doublons.

### Relations
- `sessions` vers `formations` (Many-to-One)
- `sessions` vers `formateurs` (Many-to-One)
- `session_apprenants` vers `sessions` + `apprenants` (Many-to-Many)
- `presences` vers `sessions` + `apprenants` (Many-to-Many)
- `presences_formateur` vers `sessions` + `formateurs` (Many-to-Many)
- `rapports` vers `sessions` + `formateurs` (One-to-One avec données de présence incluses)

---

## Gestion des rôles et permissions

### Superadmin - Contrôle total du système

**GESTION DES UTILISATEURS**
- Créer, modifier et supprimer des formateurs
- Créer, modifier et supprimer des apprenants
- Recherche et filtrage avancés
- Visualisation des statistiques utilisateurs

**GESTION DES FORMATIONS ET SESSIONS**
- Créer et organiser des formations
- Planifier des sessions de formation
- Assigner des formateurs aux sessions
- Assigner des apprenants aux sessions (multi-sélection)
- Gérer le statut des sessions (planifiée, en cours, terminée)

**CONFIGURATION SYSTÈME**
- Définir la plage horaire de prise de présence (personnalisable)
- Paramétrage global de l'application
- Gestion des paramètres stockés dans localStorage

**RAPPORTS ET SUIVI**
- Consultation de tous les rapports de formation
- Validation ou rejet des rapports
- Export PDF des rapports (individuel ou global)
- Vue détaillée incluant les données de présence complètes
  - Liste des apprenants présents/absents
  - Statut de présence du formateur
  - Heures d'enregistrement
  - Contenu du rapport du formateur

**TABLEAU DE BORD**
- Statistiques globales en temps réel
- Nombre total de formateurs, apprenants, formations, sessions
- Vue d'ensemble du système

### Formateur - Gestion des sessions assignées

**MARQUAGE DES PRÉSENCES**
- Marquer sa propre présence pour les sessions du jour
- Enregistrer les présences/absences des apprenants assignés
- Validation automatique de la plage horaire (configurée par superadmin)
- Boutons adaptatifs (texte sur desktop, icônes sur mobile)
- Interface responsive optimisée

**SOUMISSION DE RAPPORTS**
- Soumettre des rapports pour les sessions terminées
- Choix du format : texte ou fichier (PDF, DOC, DOCX, TXT)
- Aperçu visuel des données de présence avant soumission
  - Résumé avec statistiques (total, présents, absents)
  - Statut de sa propre présence
  - Liste détaillée des apprenants avec statut
- Le rapport inclut automatiquement toutes les données de présence
- Mise à jour possible des rapports déjà soumis

**TABLEAU DE BORD**
- Vue d'ensemble de ses sessions
- Sessions du jour en priorité
- Statistiques personnelles
- Accès rapide aux fonctionnalités

### Apprenant - Consultation (à venir)
- Consultation de son historique de présence
- Visualisation des sessions assignées
- Suivi personnel de l'assiduité

---

## Installation et configuration

### Prérequis
- Node.js version 18.0 ou supérieure
- pnpm version 8.0 ou supérieure (ou npm 9.0+)
- Navigateur moderne supportant PWA et IndexedDB
  - Chrome 90+
  - Firefox 88+
  - Safari 14+
  - Edge 90+

### Installation

```bash
# Cloner le projet
git clone https://github.com/Modestekkn/PresenceApprenant.git
cd presence-apprenant

# Installer les dépendances
pnpm install

# Démarrer le serveur de développement
pnpm dev
# L'application sera accessible sur http://localhost:5173

# Build de production
pnpm build

# Prévisualiser le build de production
pnpm preview
```

### Scripts disponibles

```bash
pnpm dev       # Démarre le serveur de développement avec HMR
pnpm build     # Compile l'application pour la production
pnpm preview   # Prévisualise le build de production localement
pnpm lint      # Exécute ESLint pour vérifier le code
```

### Configuration de l'environnement

Créer un fichier `.env` à la racine (optionnel) :
```env
VITE_APP_TITLE=Gestion de Présence
VITE_APP_VERSION=2.0.0
```

---

## Accès à l'application

### Application en production

**URL de production** : [https://presence-apprenant.vercel.app/](https://presence-apprenant.vercel.app/)

L'application est déployée sur Vercel et accessible 24/7. Elle initialise automatiquement les données de test au premier chargement grâce au système de seeding intelligent.

### Comptes de test

L'application crée automatiquement des comptes de test au premier lancement via un système de seeding robuste avec logs détaillés.

#### Superadmin
```
Email:    admin@presence.app
Password: admin123
```

#### Formateur
```
Email:    jean.dupont@formation.com
Password: formateur123
```

### Système de seeding automatique

Au premier lancement de l'application :
1. Le système vérifie si la base de données IndexedDB est vide
2. Si vide, il crée automatiquement :
   - Un compte superadmin par défaut
   - Un compte formateur par défaut
3. Des logs détaillés s'affichent dans la console du navigateur :
   - 🌱 Démarrage du seeding
   - ✅ Confirmation de création des comptes
   - 📊 Statistiques de la base de données
   - ❌ Erreurs détaillées en cas de problème

**Vérification du seeding** :
Pour vérifier que le seeding a fonctionné, ouvrez la console du navigateur (F12) et vérifiez les messages de logs.

**Note** : Pour réinitialiser la base de données, ouvrez la console du navigateur (F12) et exécutez :
```javascript
indexedDB.deleteDatabase('PresenceDB')
```
Puis rechargez la page (Ctrl + F5).

---

## Guide d'utilisation

### 1. Configuration initiale (Superadmin)

#### Étape 1 : Configurer la plage horaire de présence

1. Se connecter avec le compte superadmin
2. Sur le tableau de bord, cliquer sur "Paramètres de présence" ou "Configurer les heures"
3. Définir l'heure de début (par défaut : 07:30)
4. Définir l'heure de fin (par défaut : 08:00)
5. Cliquer sur "Enregistrer les paramètres"

**Remarque** : Cette plage horaire s'applique à toutes les sessions. Seul le marquage de présence pendant cette période sera autorisé.

#### Étape 2 : Créer des formateurs

1. Aller dans "Gestion des Formateurs"
2. Cliquer sur "Ajouter"
3. Remplir les informations :
   - Nom et prénom
   - Email (utilisé pour la connexion)
   - Numéro de téléphone
   - Mot de passe
4. Cliquer sur "Enregistrer"

#### Étape 3 : Créer des apprenants

1. Aller dans "Gestion des Apprenants"
2. Cliquer sur "Ajouter"
3. Remplir les informations :
   - Nom et prénom
   - Email (optionnel)
   - Numéro de téléphone (optionnel)
4. Cliquer sur "Enregistrer"

#### Étape 4 : Créer des formations

1. Aller dans "Gestion des Formations"
2. Cliquer sur "Ajouter une formation"
3. Remplir :
   - Nom de la formation
   - Description
   - Formateur responsable (sélectionner dans la liste)
4. Enregistrer

#### Étape 5 : Planifier une session

1. Aller dans "Gestion des Sessions"
2. Cliquer sur "Créer une session"
3. Remplir les informations :
   - Sélectionner une formation
   - Assigner un formateur
   - Définir la date de la session
   - Définir l'heure de début
   - Définir l'heure de fin
   - Choisir le statut (planifiée / en cours / terminée)
4. Assigner les apprenants :
   - Utiliser la section "Formateur assigné"
   - Cocher les apprenants qui participent à cette session
5. Cliquer sur "Créer" ou "Enregistrer"

### 2. Prise de présence (Formateur)

#### Marquage des présences

1. Se connecter avec un compte formateur
2. Aller dans "Marquer les présences"
3. Les sessions du jour s'affichent automatiquement
4. Vérifier que vous êtes dans la plage horaire configurée (affichée en haut)
5. Marquer votre propre présence en cliquant sur "Marquer ma présence"
6. Pour chaque apprenant :
   - Sur desktop : Cliquer sur "Présent" (vert) ou "Absent" (rouge)
   - Sur mobile : Utiliser les boutons avec icônes (check ou croix)
7. Les présences sont enregistrées instantanément

**Restrictions** :
- Le marquage n'est possible que pendant la plage horaire définie par le superadmin
- Une fois marquée, la présence ne peut plus être modifiée (pour l'intégrité des données)
- Seules les sessions du jour sont disponibles

### 3. Soumission de rapports (Formateur)

#### Rédaction et soumission

1. Se connecter avec un compte formateur
2. Aller dans "Soumettre un rapport"
3. Sélectionner une session terminée dans la liste
4. **Consulter le résumé de présence** :
   - Statistiques visuelles (total, présents, absents)
   - Statut de votre propre présence
   - Liste détaillée de tous les apprenants avec leur statut
   - Heures d'enregistrement
5. Choisir le type de rapport :
   - **Rapport texte** : Rédiger directement dans le formulaire
   - **Fichier** : Joindre un document (PDF, DOC, DOCX, TXT, max 5 MB)
6. Rédiger le contenu du rapport
7. Cliquer sur "Soumettre le rapport"

**Ce qui est automatiquement inclus dans le rapport** :
- Toutes les informations de la session (date, horaires, formation)
- Présence du formateur (présent/absent)
- Liste complète des apprenants avec statut (présent/absent)
- Heures d'enregistrement des présences
- Statistiques (total, présents, absents)
- Contenu rédigé par le formateur

**Mise à jour d'un rapport** :
- Les rapports déjà soumis peuvent être modifiés
- Le bouton "Mettre à jour" remplace "Soumettre"
- Les données de présence sont actualisées

### 4. Consultation des rapports (Superadmin)

#### Visualisation et validation

1. Se connecter en tant que superadmin
2. Aller dans "Gestion des Rapports"
3. Consulter la liste de tous les rapports soumis
4. Utiliser les filtres :
   - Par formateur
   - Par session
   - Par statut (Soumis / Validé / Rejeté)
5. Cliquer sur "Consulter" (desktop) ou l'icône œil (mobile) pour voir les détails
6. Dans la modale de détails, visualiser :
   - Toutes les informations de présence
   - Liste des apprenants présents/absents
   - Statut du formateur
   - Contenu du rapport
7. Valider ou rejeter le rapport
8. **Exporter en PDF** :
   - Export individuel : bouton "Export" sur chaque ligne
   - Export global : bouton "Exporter tous les rapports" en haut

### 5. Suivi et statistiques

#### Tableau de bord Superadmin

- **Vue d'ensemble** :
  - Nombre total de formateurs
  - Nombre total d'apprenants
  - Nombre total de formations
  - Nombre total de sessions
- **Accès rapide** :
  - Liens vers toutes les sections de gestion
  - Configuration des paramètres système
  - Consultation des rapports

#### Tableau de bord Formateur

- **Sessions du jour** :
  - Liste des sessions planifiées pour aujourd'hui
  - Indication de la plage horaire de présence
  - Statut de la période (active ou fermée)
- **Statistiques personnelles** :
  - Nombre de sessions ce mois
  - Nombre de rapports soumis
  - Vue d'ensemble de l'activité
- **Actions rapides** :
  - Marquer les présences
  - Soumettre un rapport

---

## Fonctionnalités techniques détaillées

### Contrôles temporels dynamiques

Le système de gestion des horaires de présence est entièrement configurable :

**Configuration (Superadmin)** :
- Interface dédiée dans le dashboard superadmin
- Définition de l'heure de début (ex: 07:30)
- Définition de l'heure de fin (ex: 08:00)
- Stockage dans localStorage
- Mise à jour immédiate dans toute l'application

**Validation en temps réel** :
- Horloge affichée en permanence sur la page de marquage
- Indicateur visuel de la période (vert = actif, orange = fermé)
- Validation stricte côté client avant chaque marquage
- Blocage automatique des boutons hors période
- Messages d'erreur explicites

**Avantages** :
- Flexibilité totale pour s'adapter aux besoins
- Pas de redéploiement nécessaire pour changer les horaires
- Cohérence garantie dans toute l'application
- Traçabilité des heures d'enregistrement

### Système de rapports intelligent

Le système de rapports a été conçu pour inclure automatiquement toutes les données essentielles :

**Collecte automatique** :
- Lors de la soumission, le système récupère :
  - Informations de la session
  - Présence du formateur
  - Liste complète des apprenants assignés
  - Statut de chaque apprenant (présent/absent)
  - Heures d'enregistrement
  - Statistiques calculées

**Format structuré** :
```
════════════════════════════════════════════════
            DONNÉES DE PRÉSENCE
════════════════════════════════════════════════

Session: [nom]
Date: [date complète]
Horaires: [début] - [fin]

FORMATEUR
────────────────────────────────────────────
[Nom complet]
Statut: ✓ Présent / ✗ Absent

APPRENANTS (X)
────────────────────────────────────────────
Présents: X
Absents: X

LISTE DES APPRENANTS:
1. Prénom Nom - ✓ Présent (08:00)
2. Prénom Nom - ✗ Absent
...

════════════════════════════════════════════════
         RAPPORT DU FORMATEUR
════════════════════════════════════════════════

[Contenu rédigé par le formateur]
```

**Aperçu visuel avant soumission** :
- Cartes colorées avec statistiques
- Badge de statut formateur
- Liste interactive des apprenants
- Design responsive

**Export PDF** :
- Export individuel par rapport
- Export global de tous les rapports filtrés
- Format texte structuré et lisible
- Nom de fichier descriptif automatique

### Responsivité mobile avancée

L'application est entièrement optimisée pour les appareils mobiles :

**Adaptations spécifiques** :
- **Boutons d'action** : Icônes uniquement sur mobile (taille icon)
- **En-têtes** : Layout en colonne sur petit écran
- **Textes** : Tailles adaptatives (text-sm sm:text-base)
- **Tableaux** : Scroll horizontal + colonnes masquées sur mobile
- **Formulaires** : Inputs pleine largeur sur mobile
- **Navigation** : Menu burger responsive

**Breakpoint utilisé** : `sm:` (≥ 640px)

**Pages optimisées** :
1. MarquerPresence (boutons présent/absent en icônes)
2. ViewRapports (boutons consulter/export en icônes)
3. ManageApprenants (layout responsive)
4. ManageFormateurs (layout responsive)
5. ManageSessions (tableau scrollable)
6. Toutes les modales et formulaires

### Gestion de la base de données

**IndexedDB avec Dexie.js** :
- Stockage local persistant
- Performance optimale
- Requêtes indexées
- Transactions ACID

**Version 2 du schéma** :
- Index composés pour les requêtes de présence
- `[id_session+id_apprenant]` pour éviter les doublons
- `[id_session+id_formateur]` pour les formateurs
- Migration automatique depuis v1

**Seeding automatique** :
- Données de test créées au premier lancement
- Comptes superadmin et formateur
- Apprenants, formations et sessions d'exemple
- Initialisation via `AppInitializer.tsx`

**Réinitialisation** :
```javascript
// Console du navigateur
indexedDB.deleteDatabase('AttendanceDatabase')
// Puis recharger la page
```

### Stockage local (LocalStorage)

Utilisé pour les paramètres de configuration :

```javascript
// Paramètres de présence
{
  presenceStartTime: "07:30",
  presenceEndTime: "08:00"
}
```

**Avantages** :
- Persistance des paramètres
- Pas besoin de backend
- Configuration instantanée
- Synchronisation automatique

---

## Architecture et patterns

### Composants réutilisables

L'application utilise une bibliothèque de composants UI personnalisés :

**Composants de base** :
- `Button` : Bouton avec variantes (primary, secondary, success, danger, warning, outline)
- `Input` : Champ de saisie avec icône optionnelle
- `Modal` : Modale générique avec props personnalisables
- `Toast` : Notifications toast (largeur max-w-md)
- `Badge` : Badges colorés pour statuts
- `Loader` : Indicateurs de chargement
- `Skeleton` : Placeholders de chargement
- `DataTable` : Tableau de données avec tri et pagination
- `ConfirmationModal` : Modale de confirmation réutilisable

**Props communes** :
- `variant` : Style du composant
- `size` : Taille (sm, md, lg, icon)
- `isLoading` : État de chargement
- `disabled` : État désactivé

### Hooks personnalisés

**useAuth** :
- Gestion de l'authentification
- Contexte utilisateur
- Déconnexion

**usePresence** :
- Chargement des présences
- Marquage des présences
- Validation de la plage horaire
- Gestion des erreurs

**useConfirmation** :
- Gestion des modales de confirmation
- État de confirmation
- Callbacks

**useToast** :
- Affichage de notifications
- Types : success, error, warning, info
- Auto-dismiss

### Gestion de l'état

**React Context API** :
- `AuthContext` pour l'authentification globale
- `useState` et `useEffect` pour l'état local
- Pas de Redux (simplicité pour ce projet)

**Flow de données** :
1. Composant fait une action
2. Hook personnalisé traite la logique
3. storageUtils interagit avec IndexedDB
4. État mis à jour
5. UI re-render

---

## Déploiement

### Application en production

**L'application est déjà déployée sur Vercel** :
- URL de production : [https://presence-apprenant.vercel.app/](https://presence-apprenant.vercel.app/)
- Déploiement automatique sur chaque push vers `main`
- HTTPS activé par défaut
- CDN global pour performances optimales

### Configuration Vercel

Le projet est configuré avec les paramètres suivants :

**Build Settings** :
```
Framework Preset:  Vite
Build Command:     pnpm build
Output Directory:  dist
Install Command:   pnpm install
Node Version:      18.x
```

**Fichier vercel.json** :
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Ce fichier garantit que toutes les routes sont redirigées vers `index.html`, permettant à React Router de gérer la navigation dans cette SPA (Single Page Application).

### Déployer votre propre instance

#### Option 1 : Déploiement via Vercel Dashboard

1. **Connectez-vous à Vercel** : [https://vercel.com](https://vercel.com)
2. **Importez le projet** :
   - Cliquez sur "Add New..." → "Project"
   - Sélectionnez votre fork du dépôt GitHub
3. **Configuration automatique** :
   - Vercel détecte automatiquement Vite
   - Vérifiez les paramètres (Build Command: `pnpm build`, Output: `dist`)
4. **Déployez** :
   - Cliquez sur "Deploy"
   - Attendez 2-3 minutes
5. **URL unique** : Vercel génère une URL comme `votre-projet.vercel.app`

#### Option 2 : Déploiement via CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter à Vercel
vercel login

# Déployer en preview
vercel

# Déployer en production
vercel --prod
```

### Build local

Pour tester le build avant déploiement :

```bash
# Build de production
pnpm build

# Prévisualiser le build localement
pnpm preview
# Accessible sur http://localhost:4173
```

### Autres hébergeurs compatibles

L'application peut être déployée sur n'importe quel hébergeur de sites statiques :

**Netlify** :
```
Build command: pnpm build
Publish directory: dist
```

**GitHub Pages** :
```bash
pnpm build
# Copier le contenu de /dist vers gh-pages branch
```

**Firebase Hosting** :
```bash
pnpm build
firebase deploy
```

**Cloudflare Pages** :
- Build command: `pnpm build`
- Build output directory: `dist`

**Note importante** : 
- L'application fonctionne 100% côté client avec IndexedDB
- Aucun backend n'est nécessaire
- Toutes les données sont stockées localement dans le navigateur
- Le système de seeding s'exécute automatiquement au premier chargement

---

## Dépendances principales

```json
{
  "dependencies": {
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-router-dom": "^7.2.1",
    "dexie": "^4.0.16",
    "lucide-react": "^0.477.1"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "~5.9.3",
    "vite": "^7.1.7",
    "tailwindcss": "^3.4.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.51",
    "eslint": "^8.57.1"
  }
}
```

---

## Sécurité

**Authentification** :
- Mots de passe stockés en clair (DEMO UNIQUEMENT)
- En production : utiliser bcrypt ou argon2
- Validation côté client

**Données** :
- Stockage local IndexedDB
- Pas de transmission réseau
- Données isolées par domaine/origine

**Recommandations pour la production** :
1. Implémenter un vrai backend avec API
2. Hasher les mots de passe
3. Utiliser JWT pour l'authentification
4. Ajouter HTTPS obligatoire
5. Implémenter CORS et CSP
6. Ajouter la validation côté serveur
7. Logger toutes les actions sensibles

---

## Roadmap

### Version actuelle (2.0)
- [x] Gestion complète des utilisateurs
- [x] Système de présence avec contrôles temporels
- [x] Rapports avec données de présence automatiques
- [x] Export PDF des rapports
- [x] Interface responsive optimisée mobile
- [x] Index composés dans la base de données
- [x] Modales de confirmation élégantes
- [x] Configuration dynamique des horaires

### Version future (3.0)
- [ ] Interface apprenant complète
- [ ] Notifications push PWA
- [ ] Mode hors-ligne avec synchronisation
- [ ] Statistiques avancées avec graphiques
- [ ] Export Excel/CSV
- [ ] Mode sombre
- [ ] Multi-langue (i18n)
- [ ] Backend API (optionnel)
- [ ] Synchronisation multi-appareils
- [ ] Authentification biométrique
- [ ] Signature électronique des rapports
- [ ] Envoi automatique d'emails
- [ ] Génération automatique de certificats

---

## Contribution

Les contributions sont les bienvenues !

### Comment contribuer

1. Fork le projet
2. Créer une branche (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Utiliser TypeScript strict
- Suivre les conventions de nommage React
- Ajouter des commentaires pour le code complexe
- Tester sur mobile et desktop
- Mettre à jour la documentation si nécessaire

---

## Support

Pour toute question ou problème :

- **Email** : kouakanoumodeste88@gmail.com
- **GitHub Issues** : [https://github.com/Modestekkn/PresenceApprenant/issues](https://github.com/Modestekkn/PresenceApprenant/issues)

---

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

---

## Auteur

**Modeste KKN**
- GitHub: [@Modestekkn](https://github.com/Modestekkn)
- Email: kouakanoumodeste88@gmail.com

---

## Remerciements

- React Team pour React 19
- Evan You pour Vite
- L'équipe Dexie.js pour la bibliothèque IndexedDB
- Tailwind CSS pour le framework CSS
- Lucide pour les icônes
- La communauté open source

---

**Développé avec passion pour H4-SERVICES - Système de Gestion de Présence v2.0**
- Persistence des données en mode hors-ligne
- Initialisation automatique avec données de test (seeding)
- Synchronisation automatique lors de la reconnexion (future)

### Interface responsive

- Design adaptatif mobile-first
- Interface tactile optimisée
- Navigation intuitive avec sidebar
- Modales accessibles
- Formulaires ergonomiques
- Tableaux responsives

### Mode hors-ligne

- Fonctionnement complet sans connexion internet
- Cache intelligent des données
- Service Worker pour la mise en cache
- Icônes et ressources disponibles hors-ligne

---

## Qualité du code

- TypeScript strict activé
- ESLint avec règles strictes
- Architecture modulaire et maintenable
- Composants réutilisables
- Hooks personnalisés pour la logique métier
- Gestion d'état avec Context API
- Typage fort de toutes les données

---

## Déploiement

### Build de production
```bash
# Générer les fichiers optimisés
pnpm build

# Les fichiers sont générés dans le dossier dist/
# Vérifier le build
pnpm preview
```

### Hébergement recommandé
- **Vercel** (Déploiement automatique depuis GitHub)
- **Netlify** (PWA optimisé)
- **GitHub Pages** (Gratuit)
- **Firebase Hosting** (Intégration Google)

### Déploiement sur Vercel

1. Connecter le dépôt GitHub à Vercel
2. Configurer le projet :
   - Framework Preset: Vite
   - Build Command: `pnpm build`
   - Output Directory: `dist`
3. Déployer

Les mises à jour sont automatiquement déployées à chaque push sur la branche main.

---

## Roadmap et améliorations

### Version actuelle (1.0)
- [x] Authentification multi-rôles
- [x] Gestion complète des formateurs
- [x] Gestion complète des apprenants
- [x] Gestion complète des formations
- [x] Gestion complète des sessions
- [x] Configuration dynamique des horaires de présence
- [x] Prise de présence avec contrôle temporel
- [x] Soumission de rapports
- [x] Tableaux de bord interactifs
- [x] Base de données locale IndexedDB
- [x] Interface responsive
- [x] Mode PWA

### Version 1.1 (En cours)
- [ ] Interface Apprenant complète
- [ ] Notifications push pour les sessions
- [] Export PDF des rapports
- [ ] Graphiques et statistiques avancés
- [ ] Système de notifications internes

### Version 1.2 (Prévue)
- [ ] Intégration API backend
- [ ] Synchronisation serveur
- [ ] Mode multi-tenant
- [ ] Intégration calendrier externe
- [ ] Justification d'absences

### Version 2.0 (Future)
- [ ] Application mobile native (React Native)
- [ ] Intelligence artificielle pour prédictions
- [ ] Intégration systèmes RH
- [ ] Dashboard analytics avancé
- [ ] API REST complète et documentée

---

## Contribution

### Comment contribuer

1. Fork du projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### Standards de code

- Utiliser TypeScript strict
- Suivre les conventions de nommage React/TypeScript
- Commenter le code complexe
- Ajouter des types pour toutes les fonctions et composants
- Respecter l'architecture existante
- Tester localement avant de soumettre

---

## Support et contact

### Documentation
- Guide d'utilisation complet (ce fichier)
- Code source commenté
- Types TypeScript documentés

### Communauté
- [Discussions GitHub](https://github.com/Modestekkn/PresenceApprenant/discussions)
- [Signaler un Bug](https://github.com/Modestekkn/PresenceApprenant/issues)
- [Demander une Fonctionnalité](https://github.com/Modestekkn/PresenceApprenant/issues/new)

### Équipe de développement
- **Lead Developer**: [Modeste KKN](https://github.com/Modestekkn)
- **Email**: kouakanoumodeste88@gmail.com
- **Organisation**: H4-SERVICES

---

## Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2025 H4-SERVICES

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## Remerciements

- **React Team** pour l'excellente bibliothèque
- **Vite** pour l'outil de build ultra-rapide  
- **Dexie.js** pour la gestion IndexedDB simplifiée
- **Tailwind CSS** pour le système de design
- **Lucide React** pour les icônes modernes
- **TypeScript** pour la sécurité de type
- **Communauté Open Source** pour l'inspiration et le support

---

<div align="center">

**Donnez une étoile au projet si vous l'appréciez**

[Démo en Ligne](https://presence-apprenant.vercel.app) • [Documentation](./README.md) • [Signaler un Bug](https://github.com/Modestekkn/PresenceApprenant/issues)

*Développé avec soin par ModeDevIT de H4-SERVICES*

</div>

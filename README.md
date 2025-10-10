# PWA Gestion de Présence - Système de Suivi Intelligent

> Application Web Progressive moderne pour la gestion automatisée des présences en formation.

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-purple.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Aperçu du projet

**PWA Gestion de Présence** est une application web progressive conçue pour automatiser et optimiser le suivi des présences dans les formations professionnelles. Elle offre une interface intuitive, des contrôles temporels précis et une gestion multi-rôles complète.

### Fonctionnalités principales

- **Authentification Multi-Rôles** (Superadmin / Formateur)
- **Contrôles Temporels Configurables** pour la prise de présence
- **Gestion Complète des Utilisateurs** (Formateurs, Apprenants, Formations, Sessions)
- **Tableaux de Bord Interactifs** avec statistiques en temps réel
- **Système de Rapports** intégré avec soumission automatisée
- **Base de Données Locale** (IndexedDB) avec synchronisation
- **Interface Responsive** optimisée mobile et desktop
- **Mode Hors-ligne** avec synchronisation automatique
- **Design Moderne** avec Tailwind CSS

---

## Architecture technique

### Stack technologique
```
Frontend:    React 19 + TypeScript + Vite
Styling:     Tailwind CSS + CSS Variables
Database:    IndexedDB + Dexie.js
Routing:     React Router DOM v7
Icons:       Lucide React
PWA:         Vite PWA Plugin + Service Worker
Build:       Vite + ESBuild
Linting:     ESLint + TypeScript ESLint
```

### Structure du projet
```
presence-apprenant/
├── public/
│   ├── manifest.json          # Configuration PWA
│   └── icons/                 # Icônes d'application
├── src/
│   ├── components/            # Composants réutilisables
│   │   ├── Layout/           # Layout principal et navigation
│   │   ├── UI/               # Composants UI de base
│   │   └── PresenceTimeSettings.tsx  # Configuration horaires
│   ├── pages/                # Pages de l'application
│   │   ├── Login.tsx         # Page de connexion
│   │   └── Dashboard/        # Tableaux de bord
│   │       ├── Superadmin/   # Interface superadmin
│   │       │   ├── SuperadminHome.tsx
│   │       │   ├── ManageFormateurs.tsx
│   │       │   ├── ManageApprenants.tsx
│   │       │   ├── ManageFormations.tsx
│   │       │   ├── ManageSessions.tsx
│   │       │   └── ViewRapports.tsx
│   │       └── Formateur/    # Interface formateur
│   │           ├── FormateurHome.tsx
│   │           ├── MarquerPresence.tsx
│   │           └── SoumettreRapport.tsx
│   ├── contexts/             # Contexts React
│   │   └── AuthContext.tsx   # Gestion de l'authentification
│   ├── hooks/                # Hooks personnalisés
│   │   └── useAuth.ts        # Hook d'authentification
│   ├── utils/                # Utilitaires
│   │   ├── storageUtils.ts   # Gestion de la base de données
│   │   └── seed.ts           # Initialisation des données
│   ├── config/               # Configuration
│   │   ├── db.ts             # Configuration IndexedDB
│   │   └── constants.ts      # Constantes de l'application
│   └── routes/               # Configuration du routage
├── package.json              # Dépendances et scripts
├── tsconfig.json             # Configuration TypeScript
├── vite.config.ts            # Configuration Vite
└── README.md                 # Documentation
```

---

## Base de données

### Schéma des tables (IndexedDB)

| Table | Description | Champs Principaux |
|-------|-------------|-------------------|
| `superadmins` | Comptes administrateurs | `id`, `nom`, `prenom`, `email`, `mot_de_passe` |
| `formateurs` | Comptes formateurs | `id`, `nom`, `prenom`, `email`, `numero_telephone`, `mot_de_passe` |
| `apprenants` | Liste des apprenants | `id`, `nom`, `prenom`, `email`, `numero_telephone` |
| `formations` | Formations disponibles | `id`, `nom_formation`, `description`, `id_formateur` |
| `sessions` | Sessions de formation | `id`, `id_formation`, `id_formateur`, `date_session`, `heure_debut`, `heure_fin`, `statut` |
| `session_apprenants` | Apprenants assignés | `id`, `id_session`, `id_apprenant` |
| `presences` | Présences des apprenants | `id`, `id_session`, `id_apprenant`, `present`, `heure_enregistrement` |
| `presences_formateur` | Présences des formateurs | `id`, `id_session`, `id_formateur`, `present`, `heure_enregistrement` |
| `rapports` | Rapports de sessions | `id`, `id_session`, `id_formateur`, `type_rapport`, `contenu`, `date_soumission`, `statut` |

### Relations
- `sessions` → `formations` (Many-to-One)
- `sessions` → `formateurs` (Many-to-One)
- `session_apprenants` → `sessions` + `apprenants` (Many-to-Many)
- `presences` → `sessions` + `apprenants` (Many-to-Many)
- `rapports` → `sessions` (One-to-One)

---

## Gestion des rôles

### Superadmin
- Gestion complète des formateurs (Créer, Lire, Modifier, Supprimer)
- Gestion complète des apprenants (Créer, Lire, Modifier, Supprimer)
- Gestion des formations (Créer, Lire, Modifier, Supprimer)
- Gestion des sessions (Créer, Lire, Modifier, Supprimer)
  - Assigner un formateur à une session
  - Assigner des apprenants à une session
  - Définir date et horaires de la session
- Configuration de la plage horaire de prise de présence
- Consultation de tous les rapports
- Statistiques globales du système

### Formateur
- Marquage de sa propre présence pour ses sessions
- Prise de présence des apprenants assignés à ses sessions
  - Uniquement pendant la plage horaire configurée par le superadmin
  - Validation stricte de l'heure actuelle
- Soumission de rapports de fin de formation
  - Rapports texte ou fichiers joints
- Consultation de ses sessions planifiées
- Visualisation des statistiques personnelles
- Historique de ses présences et rapports

---

## Installation et configuration

### Prérequis
- Node.js (v18.0+)
- pnpm (v8.0+) ou npm (v9.0+)
- Navigateur moderne (Chrome 90+, Firefox 88+, Safari 14+)

### Installation
```bash
# Cloner le projet
git clone https://github.com/Modestekkn/PresenceApprenant.git
cd presence-apprenant

# Installer les dépendances
pnpm install

# Démarrer en mode développement
pnpm dev

# Build de production
pnpm build

# Aperçu de production
pnpm preview
```

### Scripts disponibles
```bash
pnpm dev       # Serveur de développement (localhost:5173)
pnpm build     # Build de production
pnpm preview   # Aperçu de production
pnpm lint      # Vérification ESLint
```

---

## Comptes de test

### Superadmin
```
Email:    admin@presence.app
Password: admin123
```

### Formateur
```
Email:    jean.dupont@formation.com
Password: formateur123
```

Les comptes de test sont automatiquement créés au premier lancement de l'application grâce au système de seeding.

---

## Utilisation

### 1. Configuration initiale (Superadmin)

#### a. Configurer la plage horaire de présence
1. Se connecter en tant que superadmin
2. Sur le tableau de bord, cliquer sur "Configurer les heures de présence"
3. Définir l'heure de début (ex: 07:30)
4. Définir l'heure de fin (ex: 08:00)
5. Enregistrer

#### b. Créer des formateurs
1. Aller dans "Gérer Formateurs"
2. Cliquer sur "Ajouter un formateur"
3. Remplir les informations (nom, prénom, email, téléphone, mot de passe)
4. Enregistrer

#### c. Créer des apprenants
1. Aller dans "Gérer Apprenants"
2. Cliquer sur "Ajouter un apprenant"
3. Remplir les informations (nom, prénom, email, téléphone)
4. Enregistrer

#### d. Créer des formations
1. Aller dans "Gérer Formations"
2. Cliquer sur "Ajouter une formation"
3. Remplir le nom, la description
4. Assigner un formateur responsable
5. Enregistrer

#### e. Créer une session
1. Aller dans "Gérer Sessions"
2. Cliquer sur "Créer une session"
3. Sélectionner une formation
4. Assigner un formateur
5. Définir la date et les horaires (début et fin)
6. Sélectionner les apprenants qui participent
7. Définir le statut (planifiée, en cours, terminée)
8. Enregistrer

### 2. Prise de présence (Formateur)

1. Se connecter en tant que formateur
2. Vérifier qu'une session est planifiée pour aujourd'hui
3. Aller dans "Marquer Présences"
4. **Important**: La prise de présence n'est autorisée que pendant la plage horaire configurée par le superadmin
5. Marquer sa propre présence en premier
6. Marquer la présence ou l'absence de chaque apprenant assigné à la session
7. Valider l'enregistrement

### 3. Soumission de rapports (Formateur)

1. Aller dans "Soumettre Rapport"
2. Sélectionner la session concernée
3. Choisir le type de rapport (texte ou fichier)
4. Rédiger le rapport ou joindre un fichier
5. Soumettre pour validation

### 4. Suivi et statistiques

#### Pour le Superadmin:
- Tableau de bord avec vue d'ensemble
- Nombre total de formateurs, apprenants, formations
- Sessions du jour
- Rapports récemment soumis
- Accès à tous les détails des sessions et rapports

#### Pour le Formateur:
- Sessions planifiées pour aujourd'hui
- Nombre de sessions ce mois
- Nombre de rapports soumis
- Taux de présence moyen
- Statut actuel (période de présence active ou non)

---

## Fonctionnalités détaillées

### Contrôles temporels configurables

Le superadmin peut définir dynamiquement la plage horaire pendant laquelle les formateurs peuvent marquer les présences :

- Configuration stockée localement dans le navigateur
- Mise à jour en temps réel de l'interface formateur
- Validation stricte côté client
- Horloge en temps réel affichée
- Alertes visuelles selon le statut (période active ou inactive)
- Blocage automatique hors période autorisée

### Gestion complète des sessions

Le superadmin peut créer des sessions complètes en une seule fois :

- Sélection de la formation
- Assignation du formateur qui donnera le cours
- Définition de la date et des horaires précis
- Sélection multiple des apprenants participants
- Gestion du statut de la session
- Modification ultérieure possible
- Suppression avec confirmation
- Vue tabulaire claire de toutes les sessions

### Stockage local

- Base de données IndexedDB avec Dexie.js
- Stockage automatique de tous les événements
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

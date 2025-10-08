# **PWA Gestion de Présence** - *Système de Suivi Intelligent*

> **Application Web Progressive moderne pour la gestion automatisée des présences en formation**

[![React](https://img.shields.io/badge/React-19.1.1-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.1.7-purple.svg)](https://vitejs.dev/)
[![PWA](https://img.shields.io/badge/PWA-Ready-green.svg)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## **Aperçu du Projet**

**PWA Gestion de Présence** est une application web progressive conçue pour automatiser et optimiser le suivi des présences dans les formations professionnelles. Elle offre une interface intuitive, des contrôles temporels précis et une gestion multi-rôles complète.

### **Fonctionnalités Principales**

- **Authentification Multi-Rôles** (Superadmin / Formateur)
- **Contrôles Temporels Stricts** (07:30-08:00 pour la prise de présence)
- **Gestion Complète des Utilisateurs** (Formateurs, Apprenants, Sessions)
- **Tableaux de Bord Interactifs** avec statistiques en temps réel
- **Système de Rapports** intégré avec soumission automatisée
- **Base de Données Locale** (IndexedDB) avec synchronisation
- **Interface Responsive** optimisée mobile et desktop
- **Mode Hors-ligne** avec synchronisation automatique
- **Design Moderne** avec Tailwind CSS

---

## **Architecture Technique**

### **Stack Technologique**
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

### **Structure du Projet**
```
presence-apprenant/
├── public/
│   ├── manifest.json          # Configuration PWA
│   └── icons/                 # Icônes d'application
├── src/
│   ├── components/            # Composants réutilisables
│   │   ├── Layout/           # Layout principal et navigation
│   │   ├── UI/               # Composants UI de base
│   │   ├── Presence/         # Composants de gestion des présences
│   │   └── Rapports/         # Composants de rapports
│   ├── pages/                # Pages de l'application
│   │   ├── Login.tsx         # Page de connexion
│   │   └── Dashboard/        # Tableaux de bord
│   │       ├── Superadmin/   # Interface superadmin
│   │       ├── Formateur/    # Interface formateur
│   │       └── Apprenant/    # Interface apprenant
│   ├── contexts/             # Contexts React
│   │   └── AuthContext.tsx   # Gestion de l'authentification
│   ├── hooks/                # Hooks personnalisés
│   │   ├── useAuth.ts        # Hook d'authentification
│   │   └── usePresence.ts    # Hook de gestion des présences
│   ├── utils/                # Utilitaires
│   │   ├── storageUtils.ts   # Gestion de la base de données
│   │   ├── dateUtils.ts      # Utilitaires de dates
│   │   └── syncUtils.ts      # Synchronisation des données
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

## **Base de Données**

### **Schéma des Tables (IndexedDB)**

| Table | Description | Champs Principaux |
|-------|-------------|-------------------|
| `superadmins` | Comptes administrateurs | `id`, `nom`, `prenom`, `email`, `password` |
| `formateurs` | Comptes formateurs | `id`, `nom`, `prenom`, `email`, `specialite` |
| `apprenants` | Liste des apprenants | `id`, `nom`, `prenom`, `email`, `telephone` |
| `formations` | Formations disponibles | `id`, `nom`, `description`, `duree` |
| `sessions` | Sessions de formation | `id`, `id_formation`, `id_formateur`, `date`, `horaires` |
| `presences` | Présences des apprenants | `id`, `id_session`, `id_apprenant`, `present`, `heure` |
| `presences_formateur` | Présences des formateurs | `id`, `id_session`, `id_formateur`, `heure` |
| `rapports` | Rapports de sessions | `id`, `id_session`, `contenu`, `date_soumission` |

### **Relations**
- `sessions` → `formations` (Many-to-One)
- `sessions` → `formateurs` (Many-to-One)
- `presences` → `sessions` + `apprenants` (Many-to-Many)
- `rapports` → `sessions` (One-to-One)

---

## **Gestion des Rôles**

### **Superadmin**
-  Gestion complète des formateurs (CRUD)
-  Gestion des formations et sessions
-  Consultation de tous les rapports
-  Statistiques globales
-  Configuration du système

### **Formateur**
-  Marquage de sa propre présence
-  Prise de présence des apprenants (07:30-08:00)
-  Soumission de rapports de session
-  Consultation de ses sessions
-  Historique des présences

### **Apprenant** (Futur)
- Consultation de ses présences
- Justification d'absences
- Planning des sessions

---

## **Installation & Configuration**

### **Prérequis**
- Node.js (v18.0+)
- pnpm (v8.0+)
- Navigateur moderne (Chrome 90+, Firefox 88+, Safari 14+)

### **Installation**
```bash
# Cloner le projet
git clone https://github.com/Modestekkn/RegistrePresence.git
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

### **Scripts Disponibles**
```bash
pnpm dev       # Serveur de développement (localhost:5173)
pnpm build     # Build de production
pnpm preview   # Aperçu de production
pnpm lint      # Vérification ESLint
```

---

## **Comptes de Test**

### **Superadmin**
```
Email:    admin@presence.app
Password: admin123
```

### **Formateur**
```
Email:    jean.dupont@formation.com
Password: formateur123
```

---

## **Utilisation**

### **1. Connexion**
1. Accéder à l'application via `http://localhost:5173`
2. Utiliser les comptes de test ci-dessus
3. Sélectionner le rôle approprié lors de la connexion

### **2. Prise de Présence (Formateur)**
1. Se connecter en tant que formateur
2. Aller dans "Marquer Présences"
3. **Important**: La prise de présence n'est autorisée qu'entre **07:30** et **08:00**
4. Marquer sa propre présence en premier
5. Marquer la présence/absence de chaque apprenant

### **3. Gestion Administrative (Superadmin)**
1. Dashboard avec statistiques globales
2. "Gérer Formateurs" : Ajouter/Modifier/Supprimer
3. "Gérer Sessions" : Planifier et organiser les sessions
4. "Voir Rapports" : Consulter tous les rapports

### **4. Soumission de Rapports (Formateur)**
1. Aller dans "Soumettre Rapport"
2. Sélectionner la session concernée
3. Rédiger le rapport de formation
4. Joindre des fichiers si nécessaire
5. Soumettre pour validation

---

## **Configuration Avancée**

### **Variables d'Environnement**
```env
# .env.local
VITE_APP_NAME=PWA Gestion de Présence
VITE_APP_VERSION=1.0.0
VITE_API_URL=http://localhost:3000/api
VITE_STORAGE_PREFIX=attendance_
```

### **Configuration PWA**
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}']
      },
      manifest: {
        name: 'PWA Gestion de Présence',
        short_name: 'Présences',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc'
      }
    })
  ]
})
```

---

## **Fonctionnalités Détaillées**

### **Contrôles Temporels**
- Validation stricte des heures de présence (07:30-08:00)
- Horloge en temps réel dans l'interface
- Blocage automatique hors période autorisée
- Timestamps précis pour toutes les actions

### **Stockage Local**
- Base de données IndexedDB avec Dexie.js
- Stockage automatique de tous les événements
- Persistence des données en mode hors-ligne
- Synchronisation automatique lors de la reconnexion

### **Interface Responsive**
- Design adaptatif mobile-first
- Interface tactile optimisée
- Navigation intuitive

### **Mode Hors-ligne**
- Fonctionnement complet sans connexion
- Cache intelligent des données
- Synchronisation différée
- Notifications de statut de connexion

---


### **Qualité du Code**
-  TypeScript strict activé
-  ESLint avec règles strictes
-  Prettier pour le formatage
-  Hooks de pre-commit
-  Architecture modulaire

---

## **Déploiement**

### **Build de Production**
```bash
# Générer les fichiers optimisés
pnpm build

# Vérifier le build
pnpm preview
```

### **Hébergement Recommandé**
- **Vercel** (Déploiement automatique)
- **Netlify** (PWA optimisé)
- **GitHub Pages** (Gratuit)
- **Firebase Hosting** (Intégration Google)

### **Configuration Serveur**
```nginx
# nginx.conf pour PWA
location / {
  try_files $uri $uri/ /index.html;
  add_header Cache-Control "no-cache, no-store, must-revalidate";
}

location /static {
  expires 1y;
  add_header Cache-Control "public, immutable";
}
```

---

## **Roadmap & Améliorations**

### **Version 1.1** (En cours)
- [ ] Interface Apprenant complète
- [ ] Notifications push
- [ ] Export PDF des rapports
- [ ] Intégration API backend

### **Version 1.2** (Prévue)
- [ ] Mode multi-tenant
- [ ] Intégration calendrier
- [ ] Rapports statistiques avancés
- [ ] Application mobile native

### **Version 2.0** (Future)
- [ ] Intelligence artificielle pour prédictions
- [ ] Intégration systèmes RH
- [ ] Dashboard analytics avancé
- [ ] API REST complète

---

## **Contribution**

### **Comment Contribuer**
1. Fork du projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit des changements (`git commit -m 'Ajout nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

### **Standards de Code**
- Utiliser TypeScript strict
- Suivre les conventions de nommage
- Commenter le code complexe
- Ajouter des tests pour les nouvelles fonctionnalités
- Respecter l'architecture existante

---

## **Support & Contact**

### **Documentation**
- [Documentation API](./docs/api.md)
- [Guide de Design](./docs/design-system.md)
- [Guide de Déploiement](./docs/deployment.md)

### **Communauté**
- [Discussions GitHub](https://github.com/Modestekkn/RegistrePresence/discussions)
- [Signaler un Bug](https://github.com/Modestekkn/RegistrePresence/issues)
- [Demander une Fonctionnalité](https://github.com/Modestekkn/RegistrePresence/issues/new)


### **Équipe de Développement**
- **Lead Developer**: [Modeste KKN](https://github.com/Modestekkn)
- **Project Manager**: H4-SERVICES
- **UI/UX Designer**: Équipe Design

---

## **Licence**

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

## **Remerciements**

- **React Team** pour l'excellente bibliothèque
- **Vite** pour l'outil de build ultra-rapide  
- **Dexie.js** pour la gestion IndexedDB simplifiée
- **Tailwind CSS** pour le système de design
- **Lucide React** pour les icônes modernes
- **TypeScript** pour la sécurité de type

---

<div align="center">

**⭐ N'oubliez pas de donner une étoile au projet si vous l'appréciez !**

[Démo en Ligne](https://presence-app-demo.vercel.app) • [Documentation](./docs) • [Signaler un Bug](https://github.com/Modestekkn/RegistrePresence/issues)

*Développé avec par ModeDevIT H4-SERVICES*

</div>

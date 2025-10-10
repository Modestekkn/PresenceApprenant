# Quick Start - Application en Production

## Accès Rapide

**URL de Production** : [https://presence-apprenant.vercel.app/](https://presence-apprenant.vercel.app/)

**GitHub** : [https://github.com/Modestekkn/PresenceApprenant](https://github.com/Modestekkn/PresenceApprenant)

---

## Comptes de Test

### Superadmin
```
Email:    admin@presence.app
Password: admin123
```

**Fonctionnalités** :
- Gestion des formateurs et apprenants
- Gestion des formations et sessions
- Configuration des heures de présence
- Consultation et export des rapports (PDF)
- Statistiques globales

---

### Formateur
```
Email:    jean.dupont@formation.com
Password: formateur123
```

**Fonctionnalités** :
- Marquage de présence (formateur + apprenants)
- Soumission de rapports avec données de présence
- Consultation de ses sessions
- Dashboard personnalisé

---

## Premier Lancement

L'application s'initialise automatiquement au premier chargement :

1. **Ouvrir** : https://presence-apprenant.vercel.app/
2. **Attendre** : Un spinner s'affiche pendant 2-3 secondes
3. **Console** : Ouvrir F12 pour voir les logs de seeding
4. **Connexion** : Utiliser un compte de test ci-dessus

**Logs attendus dans la console** :
```
🚀 Initialisation de l'application...
🌱 Démarrage du seeding de la base de données...
✅ Base de données ouverte avec succès
📊 Nombre de superadmins existants: 0
🔄 Base de données vide, initialisation des données par défaut...
✅ Superadmin par défaut créé: {...}
✅ Formateur par défaut créé: {...}
🎉 Initialisation de la base de données terminée avec succès!
✅ Application initialisée avec succès
```

---

## Vérification

### Console du Navigateur (Recommandé)

1. Appuyer sur **F12**
2. Aller dans l'onglet **Console**
3. Recharger la page (**Ctrl + F5**)
4. Vérifier les messages avec emojis (🌱, ✅, etc.)

### IndexedDB (Avancé)

1. Appuyer sur **F12**
2. Aller dans l'onglet **Application** (ou **Storage**)
3. Menu gauche : **IndexedDB** → **PresenceDB**
4. Cliquer sur **superadmins**
5. Vérifier la présence des données

---

## Réinitialisation

Si vous voulez repartir de zéro :

```javascript
// Dans la Console (F12), exécuter :
indexedDB.deleteDatabase('PresenceDB')

// Puis recharger la page (Ctrl + F5)
```

---

## Fonctionnalités Principales

### Configuration (Superadmin)
1. Se connecter avec le compte superadmin
2. Aller dans **"Paramètres de présence"**
3. Définir les heures de marquage (ex: 07:30 - 08:00)
4. Créer des formateurs, apprenants, formations
5. Planifier des sessions

### Marquage de Présence (Formateur)
1. Se connecter avec le compte formateur
2. Aller dans **"Marquer les présences"**
3. Vérifier la plage horaire configurée
4. Marquer sa présence et celle des apprenants
5. Les présences s'enregistrent instantanément

### Soumettre un Rapport (Formateur)
1. Aller dans **"Soumettre un rapport"**
2. Sélectionner une session terminée
3. **Consulter le résumé** :
   - Statistiques visuelles
   - Liste des apprenants avec statut
4. Rédiger le rapport
5. Soumettre (les données de présence sont incluses automatiquement)

### Consulter les Rapports (Superadmin)
1. Aller dans **"Consulter les rapports"**
2. **Export individuel** : Cliquer sur l'icône PDF
3. **Export en masse** : Bouton "Exporter tous en PDF"
4. Les PDF sont générés et téléchargés automatiquement

---

## Responsive Design

L'application s'adapte automatiquement :

**Desktop** :
- Boutons avec texte + icône
- Tableaux larges avec toutes les colonnes
- Sidebar toujours visible

**Mobile** :
- Boutons icônes seulement (pour économiser l'espace)
- Tableaux scrollables horizontalement
- Sidebar repliable avec hamburger menu

---

## PWA (Progressive Web App)

L'application peut être **installée** :

**Sur Desktop** :
- Chrome : Icône d'installation dans la barre d'adresse
- Edge : Menu → Apps → Installer

**Sur Mobile** :
- Chrome/Safari : Menu → Ajouter à l'écran d'accueil
- Fonctionne hors-ligne après installation

---

## Support

**Problèmes ?**
- Documentation complète : [README.md](README.md)
- Guide de déploiement : [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)
- Historique des versions : [CHANGELOG.md](CHANGELOG.md)

**Bugs ou Suggestions ?**
- GitHub Issues : [https://github.com/Modestekkn/PresenceApprenant/issues](https://github.com/Modestekkn/PresenceApprenant/issues)

---

## Statistiques

**Version** : 2.0.0  
**Build Size** : 497 KB (136 KB gzippé)  
**Technologies** : React 19 + TypeScript + Vite  
**Database** : IndexedDB (100% client-side)  
**Hosting** : Vercel (CDN global)  
**Status** : ✅ Production

---

**Dernière mise à jour** : 10 octobre 2025

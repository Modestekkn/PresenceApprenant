# 🎨 Design System – PWA Gestion de Présence

> Version 1.0 – Base unifiée pour un UI moderne, cohérent, accessible et évolutif.

---
## 1. Vision & Principes

| Principe | Description | Impact UI |
|----------|-------------|-----------|
| Clarté | Chaque écran a un objectif visuel principal clair | Hiérarchie typographique & contraste |
| Rapidité | Feedback immédiat aux actions | Toasts, skeletons, loaders contextualisés |
| Cohérence | Mêmes patterns réutilisés | Composants normalisés (`Button`, `Input`, `Modal`, `Toast`) |
| Accessibilité | Compatible clavier / lecteurs d'écran | Focus visible, aria-labels, contrastes conformes |
| Progressivité | Fonctionne offline / latences | États de synchronisation & fallback offline |
| Scalabilité | Ajout de nouveaux rôles & modules facile | Tokens, thèmes, structure modulaire |

---
## 2. Design Tokens

### 2.1. Couleurs Sémantiques
```
--color-bg: #ffffff;
--color-bg-alt: #f8fafc;
--color-surface: #ffffff;
--color-border: #e2e8f0;
--color-overlay: rgba(15,23,42,0.55);

--color-text-primary: #0f172a;
--color-text-secondary: #475569;
--color-text-muted: #64748b;
--color-text-invert: #ffffff;

--color-primary-50: #eff6ff;
--color-primary-100: #dbeafe;
--color-primary-200: #bfdbfe;
--color-primary-300: #93c5fd;
--color-primary-400: #60a5fa;
--color-primary-500: #3b82f6;
--color-primary-600: #2563eb;
--color-primary-700: #1d4ed8;
--color-primary-800: #1e40af;
--color-primary-900: #1e3a8a;

--color-success-500: #10b981;
--color-warning-500: #f59e0b;
--color-danger-500: #ef4444;
--color-info-500: #3b82f6;
```

### 2.2. Ombres & Élévations
| Niveau | Usage | Exemple |
|--------|-------|---------|
| Elevation 0 | Surfaces plates | none |
| Elevation 1 | Cards, panels | 0 1px 2px rgba(0,0,0,0.04) |
| Elevation 2 | Dropdowns, menus | 0 4px 10px -2px rgba(0,0,0,.08) |
| Elevation 3 | Modals, toasts | 0 10px 18px -4px rgba(0,0,0,.15) |

### 2.3. Rayons
```
--radius-xs: 3px;
--radius-sm: 6px;
--radius-md: 10px;
--radius-lg: 14px;
--radius-full: 999px;
```

### 2.4. Espacements (Scale factor 1.25)
```
4 - 8 - 12 - 16 - 20 - 24 - 32 - 40 - 56 - 72
```

---
## 3. Typographie
| Élément | Style | Classe Tailwind |
|---------|-------|----------------|
| Titre H1 | 32 / 40 bold | text-4xl font-bold |
| Titre H2 | 24 / 32 semibold | text-2xl font-semibold |
| Titre H3 | 20 / 28 semibold | text-xl font-semibold |
| Paragraphe | 16 / 24 normal | text-base leading-relaxed |
| Caption | 12 / 16 medium | text-xs font-medium text-gray-500 |
| Code | Mono | font-mono text-sm |

Font stack : `Inter, Roboto, system-ui`

---
## 4. Grille & Layout

### 4.1. Structure Principale
- Navbar fixe hauteur 64px
- Sidebar fixe largeur 256px (collapse future: 72px)
- Contenu scrollable indépendant

### 4.2. Grille Responsive
| Breakpoint | Largeur max | Usage |
|------------|-------------|-------|
| <640 (sm) | 100% | Stacking vertical |
| 640–1024 | max-w-2xl | Sections principales |
| 1024–1280 | max-w-5xl | Dashboard multi-colonnes |
| 1280+ | max-w-7xl | Dense analytics |

### 4.3. Patterns
- Cards organisées en Masonry adaptative (future)
- Sections sur 12 colonnes virtuelles (mental model)

---
## 5. Composants (Inventaire + Guidelines)

### 5.1. Bouton (`Button`)
Props: `variant` (primary, secondary, success, warning, danger, outline) – `size` (sm, md, lg) – `isLoading`.
Bonnes pratiques:
- Une seule action primaire par surface
- Préserver largeur stable si loading

### 5.2. Champ (`Input`)
- États : normal / focus / erreur / disabled
- Accessibilité : associer `<label>` + id généré
- Ajouter helper ou message d’erreur (mutuellement exclusifs)

### 5.3. Modale (`Modal` / `ConfirmationModal`)
- Focus trap (à implémenter V1.1) 
- Fermeture: bouton X + clic overlay + ESC (ESC à ajouter)
- Types : warning / danger / success / info

### 5.4. Toasts (`ToastProvider`)
- Position: top-right empilé avec spacing de 8px
- Durée par défaut: 5000ms
- Animations: slide + fade + barre de progression

### 5.5. Alertes (`Alert`, `TemporaryAlert`)
- Usage inline (validation, info contextualisée)
- Temporaire pour feedback non bloquant

### 5.6. Navigation (`Navbar`, `Sidebar`)
- Highlight route active (fond + accent bordure)
- Future: Collapse + badges + sous-menus accordéon

### 5.7. Loader
- Indicateurs centrés ou inline (dans boutons ou sections)
- Future: Skeleton components standardisés

---
## 6. États & Feedback
| Type | Pattern | Exemple |
|------|---------|---------|
| Succès | Toast vert + icône | Création formateur |
| Erreur | Toast rouge + réessayer | Échec sauvegarde |
| Avertissement | ConfirmationModal warning | Suppression |
| Info | Alert bleue | Mode offline |
| Chargement | Spinner / skeleton | Récupération sessions |
| Vide | Illustration + CTA | Aucun apprenant |
| Offline | Bannière persistante | Perte connexion |

---
## 7. Accessibilité (A11y)
- Contrastes > 4.5:1 pour texte normal
- Focus visible: anneau focus primaires (ring 2 + offset)
- ARIA:
  - Toast: role="status" / aria-live="polite"
  - Modale: role="dialog" + aria-modal="true" + aria-labelledby
  - Boutons d’icône: aria-label obligatoire
- Navigation clavier : tab ordre logique, ESC pour fermer modales (à ajouter)

---
## 8. Dark Mode (Plan V1.1)
Stratégie: `class="dark"` sur `<html>` + variantes.
Tokens alternatifs:
```
--color-bg: #0f172a;
--color-bg-alt: #1e293b;
--color-surface: #1e293b;
--color-border: #334155;
--color-text-primary: #f1f5f9;
--color-text-secondary: #cbd5e1;
```
Graduel: commencer par surfaces + textes + boutons + toasts.

---
## 9. Thématisation & Extension
Approche: design tokens CSS + mapping Tailwind.
Étapes:
1. Créer `src/styles/tokens.css`
2. Injecter via `@layer base` dans Tailwind
3. Export potentiel future figma plugin

---
## 10. Performances UI
- Limiter re-renders context (split providers)
- Virtualiser listes > 200 lignes (future: react-virtual)
- Lazy import pages lourdes (rapports, analytics)
- Préchargement roles après login

---
## 11. Sécurité UX
- Confirmation actions destructives
- Masquage emails partiels (future RGPD)
- Timeout session inactif (bannière warning)

---
## 12. Roadmap UI
| Version | Items |
|---------|-------|
| 1.1 | Dark mode, focus trap, ESC close, Skeletons |
| 1.2 | Data grid avancée, thème secondaire, Charts unifiés |
| 1.3 | Internationalisation (i18n), animations réduites option |
| 2.0 | Micro-frontends UI pack, theming dynamique multi-tenant |

---
## 13. Exemples de Code à Ajouter
### tokens.css (exemple initial)
```css
:root {
  --radius-sm: 6px;
  --transition-fast: 120ms;
}

.button-base {
  @apply inline-flex items-center font-medium rounded-lg transition;
}
```

### Hook Dark Mode
```ts
export function useDarkMode() {
  const [enabled, setEnabled] = React.useState<boolean>(() =>
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );
  React.useEffect(() => {
    const root = document.documentElement;
    if (enabled) root.classList.add('dark'); else root.classList.remove('dark');
  }, [enabled]);
  return { enabled, toggle: () => setEnabled(e => !e) };
}
```

---
## 14. Checklist Qualité UI
- [ ] Contrastes vérifiés
- [ ] Focus visible partout
- [ ] Aucun `alert()` ou `confirm()` natif
- [ ] Variantes boutons cohérentes
- [ ] Feedback pour chaque action utilisateur
- [ ] Responsive sous 360px OK
- [ ] Composants testables isolément

---
## 15. Contribution UI
Règles:
- Nouveau composant = dossier + story future + doc courte
- Pas d’inlines styles sauf animations calculées
- Préfixer classes utilitaires custom `ui-`

---
## 16. Résumé
Ce design system établit une base professionnelle modulaire. Les prochaines itérations renforceront accessibilité, dark mode, performance et extensibilité multi-tenant.

> Mainteneur: UI/UX & Frontend Lead – H4-SERVICES

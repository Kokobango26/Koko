# Tamoto – refonte du site (Jodoigne)

Refonte « scroll storytelling » du site [tamoto.be](https://www.tamoto.be), construite selon le guide de style de [`CLAUDE.md`](CLAUDE.md) (variante sombre, orange de marque `#f14b03`).

- **Smooth scroll** : Lenis
- **Animations liées au scroll** : GSAP + ScrollTrigger (sections épinglées, titres mot par mot, parallaxe, défilement horizontal des véhicules)
- **Objet 3D du hero** : pneu cranté en Three.js qui tourne avec le scroll puis « avale » la caméra
- **Accessibilité** : `prefers-reduced-motion` → version calme (pas de Lenis, pas de pin, image 3D fixe)
- **Responsive** : pin horizontal desktop, scroll natif (snap) sur mobile/tablette

## Lancer

Le bundle JS est déjà compilé (`assets/js/app.js`), il suffit de servir le dossier :

```bash
npm install
npm run serve      # http://localhost:8080
```

Après modification de `src/` :

```bash
npm run build      # ou `npm run dev` pour le mode watch
```

## Structure

```
index.html            page d'accueil (textes, logo et coordonnées d'origine)
assets/css/style.css  styles (tokens de marque en tête de fichier)
src/main.js           animations (Lenis, GSAP, ScrollTrigger)
src/scene.js          scène Three.js (pneu, particules, fibres de lumière)
assets/js/app.js      bundle généré par esbuild (build.mjs)
assets/img/           logo, marques, véhicules détourés
```

## À savoir

- Les visuels (logo, véhicules, logos de marques) proviennent de captures d'écran du site actuel : remplacer par les fichiers sources haute définition pour un rendu net sur écrans Retina.
- Les boutons « Voir les détails » / « Voir tout » pointent vers le site actuel ; le formulaire newsletter n'est pas relié à un service d'envoi.
- Les accessoires n'ont pas de photo sur le site d'origine : des pictogrammes les remplacent.

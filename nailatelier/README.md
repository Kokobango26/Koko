# The Nail Atelier – site de la nail artist (Jodoigne)

Site statique en français (vouvoiement), généré par `node nailatelier/build.mjs`, sans dépendance.
Style : crème chaud, vert sauge et rose poudré de l'Instagram, fines lignes hexagonales dorées (le logo), photos en arches.
Titres Cormorant Garamond, texte DM Sans (hébergés sur le site). Animations discrètes, `prefers-reduced-motion` respecté.

```bash
node nailatelier/build.mjs                 # aperçu (noindex)
node nailatelier/build.mjs --production    # version à publier : indexable, canonical, sitemap.xml, robots.txt
node nailatelier/build.mjs --production --clean-urls
```

Tout le contenu est dans `content/data.mjs`.

## À compléter (champs surlignés en jaune sur le site)
- Nom de famille de Manon (responsable de publication), adresse (rue, code postal), téléphone, e-mail, horaires d’ouverture.
- Mentions légales : raison sociale, forme juridique, n° BCE, n° TVA, hébergeur.
- Nom de domaine : `site.url` (thenailatelier.be est un nom inventé pour la maquette).

## À valider
- Délai d'annulation : 48 h (proposition), et règle sur l'acompte de 20 € (report si prévenu à temps, sinon acquis).
- La page « L’atelier » reprend la publication de présentation de Manon (Instagram, 20 novembre 2025), passée au vouvoiement. Les autres textes d’introduction sont rédigés d’après la bio et les stories.
- Tarifs : relevés sur la story du 20 juillet, à confirmer.

## Images
Toutes les photos viennent de captures d'écran de l'Instagram : qualité moyenne (les miniatures de galerie sont petites).
À remplacer par les fichiers d'origine dans `assets/img/` (mêmes noms). Le logo est l'avatar du compte, à remplacer par le fichier officiel.

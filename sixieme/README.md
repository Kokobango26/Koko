# Le Sixième – site du restaurant (Jodoigne)

Site statique en trois langues (français à la racine, `/nl/`, `/en/`), sans framework ni dépendance au moment de l'exécution.
Style : clair et épuré, assiettes en cercles, titres Bodoni Moda + texte Jost (polices hébergées), animations discrètes
(apparitions, légère rotation des assiettes, changement d'assiette sur la carte), `prefers-reduced-motion` respecté.

## Générer le site

```bash
node sixieme/build.mjs                  # aperçu : pages en noindex, liens « …/index.html » (s'ouvre aussi depuis un dossier)
node sixieme/build.mjs --production     # version à publier : indexable, canonical, hreflang, sitemap.xml, robots.txt
node sixieme/build.mjs --production --clean-urls   # idem avec des URL sans « index.html » (hébergement web classique)
```

Les pages sont générées à partir de `content/` : `data.mjs` (coordonnées, horaires, carte, avis) et `fr.mjs` / `nl.mjs` / `en.mjs` (textes).
Après modification, relancer la commande ci-dessus.

## À compléter avant la mise en ligne

- **Mentions légales** (`content/data.mjs`, bloc `site.legal`) : raison sociale, forme juridique, n° BCE, n° TVA, responsable de publication, hébergeur. Tant que ces champs sont vides, ils apparaissent en surbrillance jaune sur les pages légales.
- **Réseaux sociaux** (`site.social`) : URL Facebook et Instagram. Les icônes n'apparaissent que si l'URL est renseignée.
- **Réservation en ligne** (`site.reservationEndpoint`) : sans service configuré, le formulaire ouvre un courriel pré-rempli vers le restaurant. Pour une vraie confirmation automatique, brancher Zenchef, TheFork, Formspree, etc. : le formulaire envoie alors les champs en JSON à cette URL.
- **Nom de domaine** (`site.url`) : utilisé pour canonical, hreflang, sitemap et l'image de partage.
- **Durée de conservation des données** : fixée à 3 mois dans la page de confidentialité ; à valider par le restaurant.
- **Traductions NL / EN** : à faire relire par un locuteur natif (la carte garde les noms de plats en français, avec une traduction en italique).
- **Photos** : voir ci-dessous.

## Images

Les photos viennent de captures d'écran de l'ancien site, de Tripadvisor et de Google (photos de clients). Elles servent de maquette :
remplacer par des photos du restaurant en haute définition (shooting ou fichiers d'origine) dans `assets/img/`, mêmes noms de fichiers.
Les photos d'avis appartiennent à leurs auteurs : ne pas les conserver en production sans autorisation.
Le logo est reconstitué en typographie (`.wordmark`) : le remplacer par le fichier officiel.

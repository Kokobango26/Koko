# Style de design préféré (sites premium, animés au scroll)

Références analysées : NebulaX, Pegasus, Campty, DJI (vidéo TikTok « web designers »).

## Règle n°1 : le scroll raconte une histoire
Chaque scroll doit déclencher du mouvement, comme un motion design. Le site ne doit jamais sembler fait de blocs statiques empilés.

- Défilement fluide (smooth scroll) sur toute la page, avec Lenis.
- Animations liées au scroll (scrub) avec GSAP + ScrollTrigger : l'élément progresse en fonction de la position du scroll.
- Sections épinglées (pin) : le décor reste fixe pendant que le contenu change.
- Apparition des titres mot par mot ou ligne par ligne (masque + translation + fondu).
- Parallaxe à plusieurs vitesses (fond, texte, objet 3D).
- Transitions de section fluides : pas de coupure nette, enchaînements par fondu, zoom ou glissement.
- Easing doux (power3.out, expo.out). Jamais d'animation linéaire ni saccadée.
- Respecter `prefers-reduced-motion` (version calme sans mouvement).

## Hero (première section)
- Un objet visuel fort dominant l'écran : forme 3D en verre/métal, objet produit, fibres de lumière, particules.
- Cet objet réagit au scroll (rotation, éclatement des pièces comme sur DJI, déformation, zoom).
- Gros titre court et percutant (4 à 6 mots), police sans-serif épurée, très grande.
- Sous-titre petit, discret, en retrait.
- Boutons d'action en forme de pilule (coins totalement arrondis), avec une petite icône flèche dans un rond.
- Petit badge pilule au-dessus du titre (ex. « We're building… »).
- Indice de scroll discret (« Discover how it works ↘ », « EXPLORE »).

## Variante sombre (tech, produit, SaaS, web3)
- Fond noir ou quasi noir, avec lueur colorée en dégradé : rouge/blanc (NebulaX), violet/bleu (Pegasus).
- Texte blanc, contrastes forts, détails en gris clair.
- Éléments de profondeur : lignes verticales, flou, grain léger, reflets.
- Chiffres clés en grand à côté du hero (200+, 500K+, 1.2M+) avec légendes minuscules.
- Navigation minimale (logo, 3 à 4 liens, bouton « Order now » en contour).

## Variante claire (lifestyle, app, communauté)
- Fond blanc ou bleu-gris très pâle, texte noir.
- Police géométrique ronde, très grasse pour les titres (style Campty).
- Détails dessinés à la main : soulignement orange, petits traits/gribouillis qui s'animent.
- Mockup de téléphone tenu en main ou flottant, qui bouge au scroll.
- Boutons pilule noirs, navigation simple avec lien actif souligné en bleu.

## Typographie
- Titres : très grands, interlignage serré, graisse régulière (sombre/tech) ou grasse (clair/lifestyle).
- Texte courant : petit, aéré, contraste doux.
- Une seule famille de police sans-serif (2 maximum).

## Technique recommandée
- HTML/CSS/JS ou Next.js + Tailwind.
- GSAP + ScrollTrigger, Lenis, Three.js (ou react-three-fiber) pour la 3D.
- Pour des visuels très réalistes (objet produit éclaté, verre) : utiliser des modèles 3D (.glb) ou une séquence d'images/vidéo pilotée par le scroll, car on ne peut pas tout générer en code.
- Performance : images/vidéos compressées, animations sur `transform` et `opacity` uniquement, 60 fps visés.
- Responsive : l'expérience doit rester fluide sur mobile (animations simplifiées si besoin).

## À éviter
- Sections statiques sans mouvement.
- Animations qui se déclenchent d'un coup au lieu de suivre le scroll.
- Dégradés violet/rose génériques « IA » sans identité.
- Emojis comme icônes (préférer des icônes SVG).
- Plus de 2 polices ou trop de couleurs.

## Niveau supérieur : sites « expérience » (références vidéos : Pulpa, Bordeaux Nail Studio, Marcelo Design X)

Analysé à partir de 3 enregistrements. Un premier jet correct ne suffit pas : viser ce niveau. Le site doit se vivre comme un court-métrage piloté par le scroll, pas comme une page de sections.

### 1. Un seul sujet héros, ultra-travaillé
- Chaque site a UN visuel star plein écran (produit, portrait, objet, scène), photoréaliste ou rendu 3D, éclairé comme une pub. Exemples : bague dorée dans un ciel de nuages, gobelet de smoothie, mannequin sur fond magenta, carte bancaire devant un coucher de soleil.
- Univers monochrome saturé par site (rose, bleu nuit, jaune, bordeaux), avec une palette réduite à 2–3 couleurs maximum.
- Les captures d'écran de l'ancien site ne suffisent pas pour ce niveau : demander (ou proposer de générer) des images haute définition du sujet, idéalement des détourages en calques séparés (sujet, mains, ombres, accessoires) ou un modèle 3D `.glb`.

### 2. Une scène continue, pas des sections empilées
- Le sujet persiste d'une section à l'autre (il change de saveur, de pose ou de cadrage) pendant que le fond change de couleur avec un fondu, un rideau ou une explosion de matière. Ex. : le gobelet reste au centre, le fond passe violet → jaune → bleu → orange.
- Entrées de scène par traversée : zoom à travers une porte, un anneau, un globe. Le changement de section est un mouvement de caméra, jamais une coupure.
- Écran d'intro (loader) soigné : un petit objet animé (globe, porte qui s'ouvre) qui annonce l'univers avant le hero.

### 3. La typographie comme décor
- Mots géants (FRUIT, MANGO ✦ STRAWBERRY, bordeaux.) qui servent de scène : placés derrière le sujet, coupés par lui, ou défilant en bandeau infini au rythme du scroll.
- Mélange d'une grotesque très grasse ou condensée et d'une serif italique élégante pour les phrases d'accroche courtes (« Not a salon. A ritual. »). Pas plus de 2 familles.
- Phrases d'accroche de 3 à 8 mots, une idée par écran, révélées mot par mot, parfois partiellement masquées par le sujet.

### 4. Profondeur et matière
- Calques à vitesses de parallaxe différentes : arrière-plan, texte, sujet, éléments flottants (fruits, mains, éclats) devant le texte.
- Éléments flottants : pastilles/étiquettes (« Nail Extensions », « 100 % fruit »), autocollants, bulles, particules, qui bougent à contre-sens du sujet.
- Fonds en matière vivante plutôt qu'en aplat : nuages, fumée, brume colorée ou bulles, via un shader WebGL (bruit fractal) ou une vidéo compressée, avec grain léger et flou de profondeur sur les calques éloignés.
- Masques et formes : images dans des cercles ou des arches, grandes courbes noires qui glissent, reflet du produit au sol.

### 5. Rythme entre les sections
- Alterner mondes sombres et saturés avec une respiration claire (fond blanc cassé, texte serif, listes épurées) pour les infos pratiques : services, tarifs, contact.
- Navigation minuscule, presque invisible ; pas de blocs de texte à lire dans les écrans « spectacle ».
- Le dernier écran reprend le sujet et le mot-marque géant (signature), avec un seul appel à l'action.

### 6. Méthode de travail pour un nouveau site
1. Définir le sujet héros, l'univers de couleurs et la phrase signature avant tout code.
2. Lister les visuels nécessaires (calques, modèle 3D, textures) et les demander si absents. Ne pas se contenter de recadrer des captures d'écran.
3. Construire la scène continue (une timeline globale GSAP + scène Three.js persistante), puis les sections qui s'y accrochent.
4. Tester au scroll à plusieurs positions (captures Playwright), sur mobile et en `prefers-reduced-motion`.

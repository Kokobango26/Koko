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

# Tableau

Tableau blanc numérique open source conçu pour l'enseignement.

Inspiré de Google Jamboard — simple, rapide, respectueux de la vie privée.

## Fonctionnalités

- ✏️ Dessin au crayon et au stylet (Pointer Events)
- 🖍️ Surligneur semi-transparent
- 🧽 Gomme
- 📐 Formes : ligne, flèche, rectangle, cercle
- 📝 Texte éditable
- 📌 Notes autocollantes (4 couleurs)
- 🖼️ Import d'images (PNG, JPEG, WebP)
- 🔴 Pointeur laser pour présentation
- 📄 Multi-pages avec miniatures
- ↩️ Undo / Redo (Ctrl+Z / Ctrl+Y)
- 💾 Sauvegarde locale (.jam)
- 📂 Ouverture de fichiers sauvegardés
- 📑 Export PDF (toutes les pages)
- 🖼️ Export PNG (page courante)

## Vie privée

> Cette application ne nécessite aucun compte et n'envoie ni ne stocke le contenu des tableaux sur un serveur. Les sessions sont sauvegardées uniquement lorsque l'utilisateur choisit explicitement de télécharger un fichier.

- Aucun compte utilisateur
- Aucune base de données
- Aucun cookie de suivi
- Aucun analytics ou télémétrie
- Données en mémoire uniquement

## Choix technique : Fabric.js

Fabric.js v6 a été choisi pour le canvas car il offre :
- Dessin libre fluide (PencilBrush) avec support natif Pointer Events
- Modèle objet complet (sélection, déplacement, redimensionnement)
- Sérialisation JSON native (`toJSON` / `loadFromJSON`)
- Support tactile et stylet intégré
- Licence MIT, aucune API externe

## Installation

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm start
```

## Déploiement Vercel

1. Forker le repo sur GitHub
2. Connecter à Vercel
3. Déployer — aucune variable d'environnement nécessaire

## Auto-hébergement

```bash
npm run build
npm start
# ou avec Docker / PM2 / n'importe quel serveur Node.js
```

Aucune base de données, aucun service externe requis.

## Licence

MIT
# whiteboards

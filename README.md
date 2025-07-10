# PokeScope - Votre Pokédex Personnel

<p align="center">
  <a href="https://pokeapi.co/">
    <img src="https://img.shields.io/badge/Données%20fournies%20par-PokéAPI-f95454?logo=pokemon&logoColor=white" alt="PokéAPI Badge"/>
  </a>
</p>

## 🚀 Fonctionnalités

- 🔍 **Recherche avancée** de Pokémon par nom, type ou numéro
- ⭐ **Favoris** - Sauvegardez vos Pokémon préférés
- 📱 **Responsive** - Conçu pour fonctionner sur tous les appareils
- 🎨 **Thème sombre/clair** - Pour un confort visuel optimal
- ⚡ **Performances optimisées** avec Vite et TanStack Query

## 🛠️ Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le build et le développement
- **TanStack Query** pour la gestion des données
- **Tailwind CSS** pour le style
- **Shadcn/ui** pour les composants d'interface

### Backend
- **Node.js** avec **Express**
- **PostgreSQL** comme base de données
- **Drizzle ORM** pour les opérations base de données
- **Replit Auth** pour l'authentification

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+
- PostgreSQL 14+
- PNPM (recommandé) ou NPM/Yarn

### Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/VSayann/PokeScope_v2.git
   cd PokeScope_v2
   ```

2. **Installer les dépendances**
   ```bash
   pnpm install
   ```

3. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   # Modifier les variables selon votre configuration
   ```

4. **Démarrer la base de données**
   ```bash
   docker compose up -d db
   ```

5. **Lancer l'application en mode développement**
   ```bash
   pnpm dev
   ```

L'application sera disponible sur `http://localhost:5173`

## 🧪 Tests

Pour exécuter les tests :

```bash
pnpm test
```

## 📦 Déploiement

### Avec Docker (recommandé)

```bash
docker compose up --build
```

### Manuellement

1. Construire l'application :
   ```bash
   pnpm build
   ```

2. Démarrer le serveur de production :
   ```bash
   pnpm start
   ```

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment procéder :

1. Forkez le projet
2. Créez votre branche de fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Ajouter une fonctionnalité incroyable'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 🙏 Remerciements

- [PokéAPI](https://pokeapi.co/) pour les données Pokémon
- La communauté open source pour les nombreuses bibliothèques utilisées
- **Replit Auth**: Authentication service provider

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Vite HMR for frontend, tsx for backend development
- **Environment Variables**: DATABASE_URL, SESSION_SECRET, REPLIT_DOMAINS

### Production Build
- **Frontend**: Vite production build with code splitting and optimization
- **Backend**: ESBuild compilation to single JavaScript bundle
- **Asset Serving**: Express serves static frontend assets in production
- **Process Management**: Single Node.js process serving both frontend and API

### Database Setup
- **Schema Management**: Drizzle migrations for database schema
- **Connection Pooling**: Neon serverless PostgreSQL with connection pooling
- **Session Storage**: Dedicated sessions table for Express session management

## Changelog

Changelog:
- July 08, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.

# Étape 1 : base Node.js avec pnpm ou npm
FROM node:20.14.0-slim

# Étape 2 : créer dossier app
WORKDIR /app

# Étape 3 : copier les fichiers nécessaires
COPY package.json package-lock.json ./
COPY tsconfig.json ./

# Étape 4 : installer les dépendances
RUN npm install

# Étape 5 : copier le reste du code
COPY . .

# Port utilisé par le serveur Express
EXPOSE 5500

# Commande de démarrage par défaut (écrasée par docker-compose)
CMD ["npm", "run", "dev"]

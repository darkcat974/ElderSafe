FROM node:20-alpine

WORKDIR /app

# Copier uniquement les fichiers de dépendances en premier pour optimiser le cache Docker
COPY package.json package-lock.json ./

RUN npm install

# Copier le reste du code source
COPY . .

# Exposer le port de Vite
EXPOSE 5173

# Démarrer le serveur de développement
CMD ["npm", "run", "dev"]

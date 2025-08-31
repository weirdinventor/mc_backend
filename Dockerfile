# Utilisation de l'image Node.js officielle
FROM node:20-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production

# Copier le code source
COPY . .

# Construire l'application TypeScript
RUN npm install
RUN npm run build

# Exposer le port
EXPOSE 3000

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001
USER backend

# Commande de démarrage
CMD ["npm", "start"]

# ---- Étape 1 : build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
ARG VITE_API_URL=/api
ARG VITE_SECRETBOX_KEY_B64        # ← ajoute ça
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SECRETBOX_KEY_B64=$VITE_SECRETBOX_KEY_B64
RUN npm run build
# Génère le dossier /app/dist avec les fichiers statiques optimisés

# ---- Étape 2 : servir avec Nginx ----
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# nginx démarre automatiquement

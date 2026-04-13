# ===== BUILD STAGE =====
FROM node:20-alpine AS build
WORKDIR /app

# Copier les fichiers racine du workspace Angular
COPY frontend/package*.json ./
COPY frontend/angular.json ./
COPY frontend/tsconfig.base.json ./

# Copier seulement les projets nécessaires
COPY frontend/client-app ./client-app
COPY frontend/shared ./shared

RUN npm ci

# Build de l'application client
RUN npx ng build client-app --configuration production

# ===== RUNTIME STAGE =====
FROM nginx:alpine

COPY frontend/client-app/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/client-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

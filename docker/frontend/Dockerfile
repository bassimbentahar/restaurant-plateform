# ===== BUILD STAGE =====
FROM node:20-alpine AS build
WORKDIR /app

# Copier uniquement le workspace Angular
COPY frontend/package*.json ./
COPY frontend/angular.json ./
COPY frontend/client-app ./client-app

RUN npm ci

# Build explicite de l'app
RUN npx ng build client-app --configuration production


# ===== RUNTIME STAGE =====
FROM nginx:alpine
COPY frontend/client-app/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/client-app /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

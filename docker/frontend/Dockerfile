# ===== BUILD STAGE =====
FROM node:20-alpine AS build
WORKDIR /app

# Copier tout le workspace frontend
COPY frontend/ ./frontend/

WORKDIR /app/frontend

RUN npm ci
RUN npx ng build client-app --configuration=$BUILD_CONFIG \
# ===== RUNTIME STAGE =====
FROM nginx:alpine

COPY frontend/client-app/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/frontend/dist/client-app/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

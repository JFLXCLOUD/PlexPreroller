# Backend
FROM --platform=$BUILDPLATFORM node:18-alpine AS backend
WORKDIR /app
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci --only=production
COPY backend .
EXPOSE 8080
CMD ["node", "src/server.js"]

# Frontend
FROM nginx:alpine AS frontend
COPY frontend /usr/share/nginx/html
EXPOSE 80



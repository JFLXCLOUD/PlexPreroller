FROM node:20-alpine AS deps
WORKDIR /app
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install --omit=dev

FROM node:20-alpine
WORKDIR /app
COPY --from=deps /app/backend/node_modules ./backend/node_modules
COPY backend ./backend
COPY frontend ./frontend
RUN mkdir -p /app/prerolls
EXPOSE 8088
WORKDIR /app/backend
CMD ["npm","start"]

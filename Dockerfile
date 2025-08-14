# ---- build (not strictly needed, but good hygiene) ----
FROM node:18-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# ---- runtime ----
FROM node:18-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app /app
EXPOSE 3000
CMD ["node", "index.js"]

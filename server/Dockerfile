FROM node:22.20.0-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
RUN npm ci --workspace @set-forge/server --include-workspace-root

FROM deps AS build
WORKDIR /app
COPY server ./server
RUN npm run build -w @set-forge/server

FROM node:22.20.0-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV HUSKY=0
# Hoisted deps live in /app/node_modules; WORKDIR /app lets Node resolve them.
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspace @set-forge/server --omit=dev
COPY --from=build /app/server/dist ./dist
CMD ["node", "dist/src/main"]

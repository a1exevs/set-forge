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
RUN npm run build -w @set-forge/server \
  && node -e "const fs=require('fs');const p=require('./server/package.json');const r={name:p.name,version:p.version,private:true,_moduleAliases:p._moduleAliases};fs.writeFileSync('package.runtime.json',JSON.stringify(r,null,2));"

FROM node:22.20.0-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV HUSKY=0
# `npm ci -w @set-forge/server` hoists most runtime deps to /app/node_modules; Node
# resolves them from there with WORKDIR /app (no NODE_PATH needed).
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
RUN npm ci --workspace @set-forge/server --omit=dev \
  && rm -f package-lock.json
# module-alias maps @root to "dist" relative to the runtime package.json location;
# placing compiled output at /app/dist matches those mappings.
COPY --from=build /app/server/dist ./dist
# Minimal manifest for module-alias only (generated in build from server/package.json).
COPY --from=build /app/package.runtime.json ./package.json
CMD ["node", "dist/src/main"]

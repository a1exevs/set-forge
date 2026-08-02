# Install workspace deps from the repo root lockfile (client + root dev tooling only).
FROM node:22.23.2-alpine AS deps
WORKDIR /app
ENV HUSKY=0
COPY package.json package-lock.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json
RUN npm ci --workspace @set-forge/client --include-workspace-root

# Produce static assets under client/dist.
FROM deps AS build
WORKDIR /app
ARG VITE_PUBLIC_ORIGIN
ENV VITE_PUBLIC_ORIGIN=$VITE_PUBLIC_ORIGIN
ARG VITE_PRIVACY_OPERATOR_NAME
ENV VITE_PRIVACY_OPERATOR_NAME=$VITE_PRIVACY_OPERATOR_NAME
ARG VITE_PRIVACY_OPERATOR_NAME_RU
ENV VITE_PRIVACY_OPERATOR_NAME_RU=$VITE_PRIVACY_OPERATOR_NAME_RU
ARG VITE_PRIVACY_OPERATOR_NAME_EN
ENV VITE_PRIVACY_OPERATOR_NAME_EN=$VITE_PRIVACY_OPERATOR_NAME_EN
ARG VITE_PRIVACY_CONTACT_EMAIL
ENV VITE_PRIVACY_CONTACT_EMAIL=$VITE_PRIVACY_CONTACT_EMAIL
COPY client ./client
RUN npm run build -w @set-forge/client

# Serve SPA + reverse-proxy /api to server-prod (see client/nginx.conf).
FROM nginx:1.31-alpine AS production
COPY --from=build /app/client/dist /usr/share/nginx/html
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

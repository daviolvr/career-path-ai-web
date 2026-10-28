# Estágio 1: build estático com Node 22 (mesma versão do CI).
FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# VITE_API_URL é embutida no bundle durante o build (é pública): troque-a com
# `--build-arg VITE_API_URL=https://api.exemplo.com`.
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Estágio 2: só os arquivos estáticos, servidos por nginx sem privilégios (usuário nginx,
# porta 8080). Nenhum código-fonte nem node_modules vai para a imagem final.
FROM nginxinc/nginx-unprivileged:1.30-alpine

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1

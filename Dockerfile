# ---- Dependencies ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ---- Build ----
FROM node:20-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Only used by the client-side auth calls (login/register/getMe) — must be
# a URL the browser can reach. Baked into the JS bundle at build time, so
# changing it requires rebuilding this image, unlike the server-only
# API_URL env var set at runtime in docker-compose.yml.
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN npm run build

# ---- Production ----
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

# `output: "standalone"` in next.config.mjs produces a minimal server
# bundle with only the files needed to run `node server.js`.
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]

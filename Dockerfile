# Development stage with hot-reload (Next.js dev server)
FROM oven/bun:1 AS development

WORKDIR /app

# Copy only the files needed to resolve dependencies first, so this layer is
# cached and reused unless package.json/bun.lock actually change.
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy source code (in docker compose, a bind mount shadows this at runtime)
COPY . .

EXPOSE 3000

CMD ["bun", "run", "dev"]

# Production build stage
FROM oven/bun:1 AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .

ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL} \
    NEXTAUTH_URL=${NEXTAUTH_URL} \
    NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

RUN bun run build

# Production final stage
FROM oven/bun:1-slim AS production

WORKDIR /app

# `output: "standalone"` traces only the files next start actually needs, so
# the final image doesn't carry the full node_modules tree.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT=3000 \
    HOSTNAME=0.0.0.0

CMD ["bun", "server.js"]

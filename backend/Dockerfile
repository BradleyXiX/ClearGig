FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
# We need to copy prisma directory to run prisma generate
COPY prisma ./prisma/
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs

COPY --from=builder --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=expressjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=expressjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=expressjs:nodejs /app/server.js ./server.js
COPY --from=builder --chown=expressjs:nodejs /app/routes ./routes
COPY --from=builder --chown=expressjs:nodejs /app/controllers ./controllers
COPY --from=builder --chown=expressjs:nodejs /app/prismaClient.js ./prismaClient.js
COPY --from=builder --chown=expressjs:nodejs /app/prisma.config.ts ./prisma.config.ts

USER expressjs

EXPOSE 5000

ENV PORT 5000

CMD ["npm", "start"]

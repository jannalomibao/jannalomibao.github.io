# Multi-stage: build → slim runtime image (docs/06-architecture-infrastructure.md §7).

FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY prisma ./prisma
RUN npx prisma generate
COPY --from=builder /app/dist ./dist

EXPOSE 3000
# nest build preserves the src/ nesting inside dist/ (dist/src/main.js, not
# dist/main.js) — confirmed by actually running the built image, not assumed.
CMD ["node", "dist/src/main.js"]

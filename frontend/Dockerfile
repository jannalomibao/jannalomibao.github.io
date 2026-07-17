# Local-dev only (docs/06-architecture-infrastructure.md §7). Production
# deploy stays on GitHub Pages (see devops/) — this exists for Docker-Compose
# parity with the backend, not as a production build target.

FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

EXPOSE 5173
# --host so the Vite dev server is reachable from outside the container.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

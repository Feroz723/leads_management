FROM node:18-alpine AS builder

WORKDIR /app

ARG VITE_API_BASE_URL=http://localhost:5000/api
ARG VITE_API_TIMEOUT=30000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT=$VITE_API_TIMEOUT

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npx", "serve", "-l", "3000", "--no-clipboard", "dist"]

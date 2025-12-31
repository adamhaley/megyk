# Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

# Build Next.js
RUN yarn build

ENV NODE_ENV=production
ENV PORT=3100
EXPOSE 3100

CMD ["yarn", "start"]


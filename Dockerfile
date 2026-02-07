# Dockerfile
FROM node:22-alpine

WORKDIR /app

# Install dependencies (cached layer)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 100000 || \
    (sleep 5 && yarn install --frozen-lockfile --network-timeout 100000) || \
    (sleep 10 && yarn install --frozen-lockfile --network-timeout 100000)

# Copy source
COPY . .

# Build args for Next.js public env vars (inlined at build time)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Build Next.js
RUN yarn build

ENV NODE_ENV=production
ENV PORT=3100
EXPOSE 3100

CMD ["yarn", "start"]


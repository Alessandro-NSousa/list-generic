FROM node:22-alpine

WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG DATABASE_URL=postgresql://quarteto:quarteto@postgres:5432/quarteto_list
ARG AUTH_SECRET=build-only-secret
ARG CRON_SECRET=build-only-secret

ENV DATABASE_URL=${DATABASE_URL}
ENV AUTH_SECRET=${AUTH_SECRET}
ENV CRON_SECRET=${CRON_SECRET}

RUN npm run db:generate && npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
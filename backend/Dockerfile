FROM oven/bun:1.1

WORKDIR /app

COPY package.json bun.lock ./

RUN bun install

COPY . .

RUN bunx prisma generate

EXPOSE 3000

CMD ["sh", "-c", "sleep 15 && bunx prisma migrate deploy && bunx prisma generate && sleep 2 && bun run prisma/seed.ts && bun run dev"]
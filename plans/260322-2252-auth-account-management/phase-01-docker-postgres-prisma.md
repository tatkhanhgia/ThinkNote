---
phase: 1
title: "Docker + PostgreSQL + Prisma Setup"
status: completed
priority: P1
effort: 1h
---

# Phase 1: Docker + PostgreSQL + Prisma Setup

## Context Links

- [Better Auth Database Docs](https://www.better-auth.com/docs/concepts/database)
- [Prisma Getting Started](https://www.prisma.io/docs/getting-started)
- [Brainstorm Report](../reports/brainstormer-260322-2026-auth-account-management.md)

## Overview

Set up PostgreSQL via Docker Compose and initialize Prisma ORM. This is the foundation for all auth tables.

## Key Insights

- Better Auth CLI (`npx @better-auth/cli generate`) auto-generates Prisma schema for auth tables
- Prisma adapter is first-class in Better Auth
- Docker Compose simplifies local PostgreSQL; no native install needed
- Use `prisma db push` for dev (faster than migrations for initial setup)

## Requirements

**Functional:**
- PostgreSQL running locally via Docker
- Prisma configured with PostgreSQL adapter
- Database schema ready for Better Auth tables

**Non-functional:**
- Docker Compose for one-command DB startup
- Environment variables in `.env.local` (not committed)

## Architecture

```
docker-compose.yml -> PostgreSQL:5432
prisma/schema.prisma -> @prisma/client -> src/lib/prisma.ts
.env.local -> DATABASE_URL
```

## Related Code Files

**Create:**
- `docker-compose.yml` - PostgreSQL service
- `prisma/schema.prisma` - Database schema
- `src/lib/prisma.ts` - Prisma client singleton
- `.env.local` - Database connection string + auth secrets

**Modify:**
- `package.json` - Add prisma scripts
- `.gitignore` - Ensure `.env.local` is ignored

## Implementation Steps

### Step 1: Install dependencies

```bash
npm install @prisma/client
npm install -D prisma
```

### Step 2: Create `docker-compose.yml` (project root)

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    container_name: thinknote-db
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: thinknote
      POSTGRES_PASSWORD: thinknote_dev
      POSTGRES_DB: thinknote
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Step 3: Create `.env.local`

```env
# Database
DATABASE_URL="postgresql://thinknote:thinknote_dev@localhost:5432/thinknote"

# Better Auth (generate: openssl rand -base64 32)
BETTER_AUTH_SECRET="generate-a-random-secret-here"
BETTER_AUTH_URL="http://localhost:3000"

# Gmail SMTP (Phase 5)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="ThinkNote <your-email@gmail.com>"
```

### Step 4: Initialize Prisma

```bash
npx prisma init --datasource-provider postgresql
```

This creates `prisma/schema.prisma`. Overwrite with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String
  email         String    @unique
  emailVerified Boolean   @default(false)
  image         String?
  role          String    @default("user")
  banned        Boolean   @default(false)
  banReason     String?
  banExpires    DateTime?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  sessions      Session[]
  accounts      Account[]
}

model Session {
  id             String   @id @default(cuid())
  userId         String
  token          String   @unique
  expiresAt      DateTime
  ipAddress      String?
  userAgent      String?
  impersonatedBy String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  user           User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Account {
  id           String    @id @default(cuid())
  userId       String
  accountId    String
  providerId   String
  accessToken  String?
  refreshToken String?
  idToken      String?
  expiresAt    DateTime?
  password     String?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  user         User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Verification {
  id         String   @id @default(cuid())
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

### Step 5: Create Prisma client singleton `src/lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

### Step 6: Add npm scripts to `package.json`

```json
{
  "scripts": {
    "db:up": "docker compose up -d",
    "db:down": "docker compose down",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "db:generate": "prisma generate"
  }
}
```

### Step 7: Start database and push schema

```bash
npm run db:up
npm run db:push
npm run db:generate
```

### Step 8: Verify `.gitignore` includes

```
.env.local
.env*.local
```

## Todo List

- [x] Install @prisma/client and prisma
- [x] Create docker-compose.yml
- [x] Create .env.local with all required vars
- [x] Initialize Prisma schema with Better Auth tables
- [x] Create Prisma client singleton (with @prisma/adapter-pg for Prisma v7)
- [x] Add DB npm scripts
- [ ] Start Docker, push schema, verify connection (requires Docker running)
- [x] Verify .env.local in .gitignore

## Success Criteria

- `docker compose up -d` starts PostgreSQL
- `npx prisma studio` opens and shows 4 empty tables
- `prisma generate` succeeds without errors
- `.env.local` not tracked by git

## Risk Assessment

| Risk | Severity | Mitigation |
|------|----------|------------|
| Docker not installed | Low | User has Docker Desktop on Windows 11 |
| Port 5432 conflict | Low | Change port in docker-compose.yml |
| Prisma schema mismatch with Better Auth | Medium | Use `npx @better-auth/cli generate` to verify schema |

## Security Considerations

- Database credentials only in `.env.local`
- Docker volume persists data locally only
- No remote database access in dev

## Next Steps

- Phase 2: Configure Better Auth server/client using this Prisma setup

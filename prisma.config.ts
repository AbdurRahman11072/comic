import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || 'postgresql://neondb_owner:npg_Jmd8GQbw3yMI@ep-winter-fog-ay1xnbsy.c-5.us-east-2.aws.neon.tech/neondb?sslmode=require',
  },
});


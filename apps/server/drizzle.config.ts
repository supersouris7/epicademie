import { defineConfig } from 'drizzle-kit';

/** Génère les migrations SQL à partir de src/db/schema.ts : `pnpm --filter @questeo/server db:generate`. */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
});

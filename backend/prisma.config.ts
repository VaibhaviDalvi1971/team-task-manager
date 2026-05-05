import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  migrate: {
    connectionString: "postgresql://postgres:dfInGJuByQuevYJoxpBVNAXoIMoLSAzL@postgres.railway.internal:5432/railway",
  },
})
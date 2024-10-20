import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: '.env' });


export default defineConfig({
    schema: "./utils/schema.js",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: "postgresql://neondb_owner:Gp9bH2UayfMV@ep-lingering-hat-a5xa0pex.us-east-2.aws.neon.tech/AI%20Mock%20Interview?sslmode=require",
    },
});
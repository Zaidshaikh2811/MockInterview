import { config } from 'dotenv';
import { defineConfig } from "drizzle-kit";

config({ path: '.env' });


export default defineConfig({
    schema: "./utils/schema.js",
    out: "./migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.NEXT_PUBLIC_DRIZZLE_DB_URL,
    },
});
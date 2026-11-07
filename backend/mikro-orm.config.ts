import "dotenv/config";
import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { Migrator } from "@mikro-orm/migrations";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    throw new Error("DATABASE_URL não configurada.");
}

export default defineConfig({
    entities: ["./dist/**/*.entity.js"],
    entitiesTs: ["./src/**/*.entity.ts"],
    driver: PostgreSqlDriver,
    clientUrl: databaseUrl,
    driverOptions: { ssl: true },
    metadataProvider: ReflectMetadataProvider,
    extensions: [Migrator],
    migrations: {
        path: "./dist/migrations",
        pathTs: "./src/migrations",
    },
});

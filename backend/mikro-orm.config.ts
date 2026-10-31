import { defineConfig, PostgreSqlDriver } from "@mikro-orm/postgresql";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { Migrator } from "@mikro-orm/migrations";

export default defineConfig({
    entities: ["./dist/**/*.entity.js"],
    entitiesTs: ["./src/**/*.entity.ts"],
    driver: PostgreSqlDriver,
    clientUrl: "postgresql://postgres:joao2904@localhost:5432/leadevent",
    metadataProvider: ReflectMetadataProvider,
    extensions: [Migrator],
    migrations: {
        path: "./dist/migrations",
        pathTs: "./src/migrations",
    },
});

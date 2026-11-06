import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";
import { mkdirSync } from "node:fs";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(helmet());
    app.enableShutdownHooks();
    mkdirSync("tmp", { recursive: true });
    app.enableCors({
        origin: (process.env.FRONTEND_URL ?? "http://localhost:3000,http://127.0.0.1:3000")
            .split(",")
            .map(origin => origin.trim())
            .filter(Boolean),
        methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    });

    const config = new DocumentBuilder()
        .setTitle("LeadEvent Backend")
        .setVersion("1.0")
        .addBearerAuth({ type: "http" }, "accessToken")
        .addSecurityRequirements("accessToken")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, document);

    await app.listen(process.env.PORT ?? 5050);
}
await bootstrap();

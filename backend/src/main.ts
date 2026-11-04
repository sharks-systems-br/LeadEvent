import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(helmet());
    app.enableShutdownHooks();

    const config = new DocumentBuilder().setTitle("LeadEvent Backend").setVersion("1.0").build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api-docs", app, document);

    await app.listen(process.env.PORT ?? 5050);
}
await bootstrap();

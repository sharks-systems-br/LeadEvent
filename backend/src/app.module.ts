import { Module, UnprocessableEntityException, ValidationPipe } from "@nestjs/common";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { InfluencerModule } from "./modules/influencer/influencer.module.js";
import { ReflectMetadataProvider } from "@mikro-orm/decorators/legacy";
import { ConfigModule, ConfigType } from "@nestjs/config";
import appConfig from "./config/app.config.js";
import { APP_GUARD, APP_PIPE } from "@nestjs/core";
import { StorageModule } from "./infra/storage/storage.module.js";
import { FilesModule } from "./modules/files/files.module.js";
import { seconds, ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { CompanyModule } from "./modules/company/company.module.js";

@Module({
    imports: [
        ConfigModule.forRoot({ load: [appConfig], isGlobal: true }),
        MikroOrmModule.forRootAsync({
            driver: PostgreSqlDriver,
            imports: [ConfigModule.forFeature(appConfig)],
            inject: [appConfig.KEY],
            useFactory: (config: ConfigType<typeof appConfig>) => ({
                autoLoadEntities: true,
                clientUrl: config.database.url,
                metadataProvider: ReflectMetadataProvider,
                // debug: true,
            }),
        }),
        InfluencerModule,
        StorageModule,
        FilesModule,
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    name: "short",
                    ttl: seconds(1),
                    limit: 2,
                },
                {
                    name: "long",
                    ttl: seconds(60),
                    limit: 50,
                },
            ],
            errorMessage: "Too Many Requests.",
        }),
        CompanyModule,
    ],
    controllers: [AppController],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
        {
            provide: APP_PIPE,
            useValue: new ValidationPipe({
                transform: true,
                forbidNonWhitelisted: true,
                whitelist: true,
                exceptionFactory: errors => new UnprocessableEntityException(errors),
            }),
        },
        AppService,
    ],
})
export class AppModule {}

import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { AuthController } from "./auth.controller.js";
import { ConfigModule, ConfigType } from "@nestjs/config";
import jwtConfig from "./configs/jwt.config.js";
import { JwtModule } from "@nestjs/jwt";
import { HashingService } from "./hashing/hashing.service.js";
import { Argon2Service } from "./hashing/argon2.service.js";
import authConfig from "./configs/auth.config.js";

@Module({
    imports: [
        ConfigModule.forFeature(jwtConfig),
        ConfigModule.forFeature(authConfig),
        JwtModule.registerAsync({
            imports: [ConfigModule.forFeature(jwtConfig)],
            inject: [jwtConfig.KEY],
            useFactory: (config: ConfigType<typeof jwtConfig>) => ({
                secret: config.secret,
                signOptions: { expiresIn: "15min" },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, { provide: HashingService, useClass: Argon2Service }],
    exports: [JwtModule, AuthService],
})
export class AuthModule {}

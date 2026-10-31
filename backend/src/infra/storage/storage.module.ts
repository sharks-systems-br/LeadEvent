import { Module } from "@nestjs/common";
import { StorageService } from "./storage.service.js";
import { DriveService } from "./drive.service.js";
import { ConfigModule } from "@nestjs/config";
import driveConfig from "./config/drive.config.js";

@Module({
    imports: [ConfigModule.forFeature(driveConfig)],
    providers: [{ provide: StorageService, useClass: DriveService }],
    exports: [StorageService],
})
export class StorageModule {}

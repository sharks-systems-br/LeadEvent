import { Module } from "@nestjs/common";
import { InfluencerService } from "./influencer.service.js";
import { InfluencerController } from "./influencer.controller.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Influencer } from "./entities/influencer.entity.js";
import { StorageModule } from "../../infra/storage/storage.module.js";
import { FilesModule } from "../files/files.module.js";
import { TurnstileGuard } from "../../common/guards/turnstile.guard.js";

@Module({
    imports: [MikroOrmModule.forFeature([Influencer]), StorageModule, FilesModule],
    controllers: [InfluencerController],
    providers: [InfluencerService, TurnstileGuard],
})
export class InfluencerModule {}

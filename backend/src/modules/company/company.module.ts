import { Module } from "@nestjs/common";
import { CompanyService } from "./company.service.js";
import { CompanyController } from "./company.controller.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Company } from "./entities/company.entity.js";
import { TurnstileGuard } from "../../common/guards/turnstile.guard.js";

@Module({
    imports: [MikroOrmModule.forFeature([Company])],
    controllers: [CompanyController],
    providers: [CompanyService, TurnstileGuard],
})
export class CompanyModule {}

import { Module } from "@nestjs/common";
import { CompanyService } from "./company.service.js";
import { CompanyController } from "./company.controller.js";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { Company } from "./entities/company.entity.js";

@Module({
    imports: [MikroOrmModule.forFeature([Company])],
    controllers: [CompanyController],
    providers: [CompanyService],
})
export class CompanyModule {}

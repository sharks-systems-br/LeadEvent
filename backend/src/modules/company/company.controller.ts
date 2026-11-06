import { Controller, Get, Post, Body, Patch, Param, Delete } from "@nestjs/common";
import { CompanyService } from "./company.service.js";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { UpdateCompanyDto } from "./dto/update-company.dto.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Throttle, seconds, minutes } from "@nestjs/throttler";

@Controller("companies")
export class CompanyController {
    constructor(private readonly companyService: CompanyService) {}

    @Public()
    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 5, ttl: minutes(5) },
    })
    @Post()
    create(@Body() createCompanyDto: CreateCompanyDto) {
        return this.companyService.create(createCompanyDto);
    }

    @Get()
    findAll() {
        return this.companyService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.companyService.findOne(+id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateCompanyDto: UpdateCompanyDto) {
        return this.companyService.update(+id, updateCompanyDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.companyService.remove(+id);
    }
}

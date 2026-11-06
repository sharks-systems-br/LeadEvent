import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseUUIDPipe,
    HttpCode,
    HttpStatus,
    Put,
    Query,
} from "@nestjs/common";
import { CompanyService } from "./company.service.js";
import { CreateCompanyDto } from "./dto/create-company.dto.js";
import { Public } from "../../common/decorators/public.decorator.js";
import { Throttle, seconds, minutes } from "@nestjs/throttler";
import { Company } from "./entities/company.entity.js";
import { UpdateApprovalStatusDto } from "../../common/dto/update-approval-status.dto.js";
import { SearchCompanyQueryDto } from "./dto/search-company-query.dto.js";
import { CountsResponseDto } from "../../common/dto/counts-response.dto.js";

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
    findAll(@Query() query: SearchCompanyQueryDto) {
        return this.companyService.findAll(query);
    }

    @Get("counts")
    getCounts(): Promise<CountsResponseDto> {
        return this.companyService.getCounts();
    }

    @Get(":id")
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Company> {
        return this.companyService.findOne(id);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
        return this.companyService.remove(id);
    }

    @Post(":id/recover")
    @HttpCode(HttpStatus.NO_CONTENT)
    recover(@Param("id", ParseUUIDPipe) id: string): Promise<void> {
        return this.companyService.recover(id);
    }

    @Put(":id/status")
    updateStatus(@Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateApprovalStatusDto): Promise<Company> {
        return this.companyService.updateStatus(id, dto);
    }
}

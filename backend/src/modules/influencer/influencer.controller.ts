import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    ParseUUIDPipe,
    Query,
    HttpCode,
    HttpStatus,
    Put,
    Req,
} from "@nestjs/common";
import type { Request } from "express";
import { InfluencerService } from "./influencer.service.js";
import { CreateInfluencerDto } from "./dto/create-influencer.dto.js";
import { minutes, seconds, Throttle } from "@nestjs/throttler";
import { Public } from "../../common/decorators/public.decorator.js";
import { CurrentTokenPayload } from "../../common/decorators/current-token-payload.decorator.js";
import type { TokenPayload } from "../../common/interfaces/token-payload.interface.js";
import { SearchInfluencerQueryDto } from "./dto/search-influencer-query.dto.js";
import { Influencer } from "./entities/influencer.entity.js";
import { CountsResponseDto } from "../../common/dto/counts-response.dto.js";
import { UpdateApprovalStatusDto } from "../../common/dto/update-approval-status.dto.js";

@Controller("influencers")
export class InfluencerController {
    constructor(private readonly influencerService: InfluencerService) {}

    @Public()
    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 5, ttl: minutes(5) },
    })
    @Post()
    create(@Body() createInfluencerDto: CreateInfluencerDto, @Req() req: Request): Promise<void> {
        return this.influencerService.create(createInfluencerDto, req.ip ?? null);
    }

    @Get()
    findAll(@Query() query: SearchInfluencerQueryDto) {
        return this.influencerService.findAll(query);
    }

    @Get("counts")
    getCounts(): Promise<CountsResponseDto> {
        return this.influencerService.getCounts();
    }

    @Get(":id")
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Influencer> {
        return this.influencerService.findOne(id);
    }

    @Delete(":id")
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentTokenPayload() payload: TokenPayload,
    ): Promise<void> {
        return this.influencerService.remove(id, payload.sub);
    }

    @Post(":id/recover")
    @HttpCode(HttpStatus.NO_CONTENT)
    recover(
        @Param("id", ParseUUIDPipe) id: string,
        @CurrentTokenPayload() payload: TokenPayload,
    ): Promise<void> {
        return this.influencerService.recover(id, payload.sub);
    }

    @Put(":id/status")
    updateStatus(
        @Param("id", ParseUUIDPipe) id: string,
        @Body() dto: UpdateApprovalStatusDto,
        @CurrentTokenPayload() payload: TokenPayload,
    ): Promise<Influencer> {
        return this.influencerService.updateStatus(id, dto, payload.sub);
    }
}

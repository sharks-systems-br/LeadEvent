import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from "@nestjs/common";
import { InfluencerService } from "./influencer.service.js";
import { CreateInfluencerDto } from "./dto/create-influencer.dto.js";
import { UpdateInfluencerDto } from "./dto/update-influencer.dto.js";
import { minutes, seconds, Throttle } from "@nestjs/throttler";
import { TurnstileGuard } from "../../common/guards/turnstile.guard.js";

@Controller("influencers")
export class InfluencerController {
    constructor(private readonly influencerService: InfluencerService) {}

    @Throttle({
        short: { limit: 1, ttl: seconds(1) },
        long: { limit: 5, ttl: minutes(5) },
    })
    @UseGuards(TurnstileGuard)
    @Post()
    create(@Body() createInfluencerDto: CreateInfluencerDto): Promise<void> {
        return this.influencerService.create(createInfluencerDto);
    }

    @Get()
    findAll() {
        return this.influencerService.findAll();
    }

    @Get(":id")
    findOne(@Param("id") id: string) {
        return this.influencerService.findOne(+id);
    }

    @Patch(":id")
    update(@Param("id") id: string, @Body() updateInfluencerDto: UpdateInfluencerDto) {
        return this.influencerService.update(+id, updateInfluencerDto);
    }

    @Delete(":id")
    remove(@Param("id") id: string) {
        return this.influencerService.remove(+id);
    }
}

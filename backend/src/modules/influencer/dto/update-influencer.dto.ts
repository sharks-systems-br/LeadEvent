import { PartialType } from "@nestjs/swagger";
import { CreateInfluencerDto } from "./create-influencer.dto.js";

export class UpdateInfluencerDto extends PartialType(CreateInfluencerDto) {}

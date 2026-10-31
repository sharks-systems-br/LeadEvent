import {
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
} from "class-validator";
import { NormalizePhone } from "../../../common/decorators/normalize-phone.decorator.js";
import { FollowerRange } from "../enums/follower-range.enum.js";

export class CreateInfluencerDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    instagram: string;

    @IsPhoneNumber("BR")
    @NormalizePhone("BR")
    phone: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(600)
    reason: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    niche: string;

    @IsOptional()
    @IsUrl({ max_allowed_length: 255 })
    fileUrl?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    filePath?: string;

    @IsString()
    @MinLength(2)
    @MaxLength(2)
    state: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    city: string;

    @IsEnum(FollowerRange)
    followerRange: FollowerRange;

    @IsBoolean()
    confirmContact: boolean;
}

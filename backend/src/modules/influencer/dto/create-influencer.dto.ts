import {
    ArrayMaxSize,
    Equals,
    IsArray,
    IsBoolean,
    IsEnum,
    IsNotEmpty,
    IsOptional,
    IsPhoneNumber,
    IsString,
    IsUrl,
    MaxLength,
    MinLength,
    ValidateNested,
} from "class-validator";
import { NormalizePhone } from "../../../common/decorators/normalize-phone.decorator.js";
import { FollowerRange } from "../enums/follower-range.enum.js";
import { Type } from "class-transformer";
import { CreateInfluencerSocialMediaDto } from "./create-influencer-social-media.dto.js";

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
    @Equals(true)
    confirmContact: true;

    @IsOptional()
    @IsArray()
    @ArrayMaxSize(10)
    @ValidateNested({ each: true })
    @Type(() => CreateInfluencerSocialMediaDto)
    socialMedias?: CreateInfluencerSocialMediaDto[];
}

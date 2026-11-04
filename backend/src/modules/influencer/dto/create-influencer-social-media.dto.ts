import { IsEnum, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { SocialMedia } from "../enums/social-media.enum.js";

export class CreateInfluencerSocialMediaDto {
    @IsEnum(SocialMedia)
    socialMedia: SocialMedia;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    link: string;
}

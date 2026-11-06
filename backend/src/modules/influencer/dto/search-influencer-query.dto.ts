import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { ApprovalStatus } from "../../../common/enums/approval-status.enum.js";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
import { FollowerRange } from "../enums/follower-range.enum.js";

export class SearchInfluencerQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(ApprovalStatus)
    approvalStatus?: ApprovalStatus;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    text?: string;

    @IsOptional()
    @IsString()
    @MinLength(2)
    @MaxLength(2)
    state?: string;

    @IsOptional()
    @IsEnum(FollowerRange)
    followerRange?: FollowerRange;

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    niche?: string;
}

import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto.js";
import { Disponibility } from "../enums/disponibility.enum.js";
import { ApprovalStatus } from "../../../common/enums/approval-status.enum.js";

export class SearchCompanyQueryDto extends PaginationQueryDto {
    @IsOptional()
    @IsEnum(Disponibility)
    disponibility?: Disponibility;

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
    @IsNotEmpty()
    @MaxLength(30)
    partnershipFormat?: string;
}

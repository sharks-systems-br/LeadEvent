import { IsEnum } from "class-validator";
import { ApprovalStatus } from "../enums/approval-status.enum.js";

export class UpdateApprovalStatusDto {
    @IsEnum(ApprovalStatus)
    approvalStatus: ApprovalStatus;
}

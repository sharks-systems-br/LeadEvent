import { IsNotEmpty, IsString, IsStrongPassword } from "class-validator";

export class ForceChangePasswordDto {
    @IsString()
    @IsNotEmpty()
    token: string;

    @IsString()
    @IsNotEmpty()
    username: string;

    @IsStrongPassword()
    newPassword: string;
}

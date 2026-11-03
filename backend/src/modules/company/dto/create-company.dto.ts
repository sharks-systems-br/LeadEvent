import { Transform } from "class-transformer";
import { IsString, IsNotEmpty, MaxLength, IsEmail, IsArray, ArrayMaxSize, IsBoolean, Equals } from "class-validator";
import { IsCNPJ } from "cpf-cnpj-validator/class-validator";

export class CreateCompanyDto {
    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    tradeName: string;

    @IsNotEmpty()
    @Transform(({ value }) => (typeof value === "string" ? value.replace(/[^a-zA-Z0-9]/g, "") : value))
    @IsCNPJ()
    cnpj: string;

    @IsEmail()
    contactEmail: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(150)
    personName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(255)
    socialMedia: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(700)
    reason: string;

    @Transform(({ value }) => (Array.isArray(value) ? [...new Set(value)] : value))
    @IsArray()
    @ArrayMaxSize(6)
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    @MaxLength(30, { each: true })
    partnershipFormats: string[];

    @IsBoolean()
    @Equals(true)
    confirmContact: true;
}

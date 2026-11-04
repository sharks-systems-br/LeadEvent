import { Transform, TransformOptions } from "class-transformer";
import { parsePhoneNumberFromString, CountryCode } from "libphonenumber-js";

export function NormalizePhone(region?: CountryCode, options?: TransformOptions) {
    return Transform(({ value }: { value: unknown }) => {
        if (typeof value !== "string") return value;

        const phoneNumber = parsePhoneNumberFromString(value, region);

        return phoneNumber ? phoneNumber.format("E.164") : value;
    }, options);
}

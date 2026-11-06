import { registerAs } from "@nestjs/config";

export default registerAs("auth", () => ({
    adminUsersString: process.env.ADMIN_USERS!,
    emergencyToken: process.env.EMERGENCY_TOKEN!,
}));

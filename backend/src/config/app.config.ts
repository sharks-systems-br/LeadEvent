import { registerAs } from "@nestjs/config";

export default registerAs("app", () => ({
    enviroment: process.env.NODE_ENV?.toLowerCase() ?? "development",
    database: { url: process.env.DATABASE_URL! },
    discord: {
        webhookUrl: process.env.DISCORD_WEBHOOK_URL!,
        roleId: process.env.DISCORD_ROLE_ID!,
    },
}));

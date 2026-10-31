import { registerAs } from "@nestjs/config";

export default registerAs("drive", () => ({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN!,
    folderId: process.env.GOOGLE_DRIVE_FOLDER_ID!,
}));

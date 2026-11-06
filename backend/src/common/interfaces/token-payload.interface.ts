export interface TokenPayload {
    sub: string;
    type: "access" | "refresh";
    tokenVersion: number;
}

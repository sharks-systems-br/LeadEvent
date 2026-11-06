import { Request } from "express";
import { TokenPayload } from "./token-payload.interface.js";

export interface CustomRequest extends Request {
    tokenPayload?: TokenPayload;
}

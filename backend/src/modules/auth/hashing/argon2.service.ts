import { HashingService } from "./hashing.service.js";
import argon2 from "argon2";

export class Argon2Service extends HashingService {
    hash(password: string): Promise<string> {
        return argon2.hash(password, { parallelism: 2 });
    }

    compare(password: string, passwordHash: string): Promise<boolean> {
        return argon2.verify(passwordHash, password);
    }
}

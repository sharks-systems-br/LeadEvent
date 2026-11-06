import argon2 from "argon2";
import { Argon2Service } from "./argon2.service.js";

vi.mock("argon2");

describe("Argon2Service", () => {
    const service = new Argon2Service();

    const MOCK_HASH = "MOCK_HASH";

    it("should be defined", () => {
        expect(service).toBeDefined();
    });

    describe("hash", () => {
        it("should generate a salt and return the generated hash", async () => {
            const password = "secretpass";

            vi.mocked(argon2.hash).mockResolvedValue(MOCK_HASH as any);

            const result = await service.hash(password);

            expect(argon2.hash).toHaveBeenCalledWith(password, { parallelism: 2 });
            expect(result).toBe(MOCK_HASH);
        });
    });

    describe("compare", () => {
        it("should return true if the passowrd is correct", async () => {
            const password = "secretpass";

            vi.mocked(argon2.verify).mockResolvedValue(true as any);

            const result = await service.compare(password, MOCK_HASH);

            expect(argon2.verify).toHaveBeenCalledWith(MOCK_HASH, password);
            expect(result).toBe(true);
        });

        it("should return false if the passowrd is incorrect", async () => {
            vi.mocked(argon2.verify).mockResolvedValue(false as any);

            const result = await service.compare("wrong-password", MOCK_HASH);

            expect(argon2.verify).toHaveBeenCalledWith(MOCK_HASH, "wrong-password");
            expect(result).toBe(false);
        });
    });
});

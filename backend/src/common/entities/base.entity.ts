import { PrimaryKey, Property } from "@mikro-orm/decorators/legacy";

export abstract class BaseEntity {
    @PrimaryKey({ type: "uuid", defaultRaw: "gen_random_uuid()" })
    id: string;

    @Property({ defaultRaw: "now()" })
    createdAt: Date;

    @Property({ defaultRaw: "now()", onUpdate: () => new Date() })
    updatedAt: Date;
}

import { Entity, ManyToOne, Property, Unique } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "../../../common/entities/base.entity.js";
import { Company } from "./company.entity.js";
import type { Rel } from "@mikro-orm/core";

@Entity()
@Unique({
    properties: ["format", "company"],
})
export class PartnershipFormat extends BaseEntity {
    @Property({ type: "varchar", length: 30 })
    format: string;

    @ManyToOne(() => Company, { deleteRule: "cascade" })
    company: Rel<Company>;
}

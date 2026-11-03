import { Entity, OneToMany, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "../../../common/entities/base.entity.js";
import { PartnershipFormat } from "./partnership-format.entity.js";
import { Collection } from "@mikro-orm/core";

@Entity()
export class Company extends BaseEntity {
    @Property({ type: "varchar", length: 150 })
    tradeName: string;

    @Property({ type: "varchar", length: 14, unique: true })
    cnpj: string;

    @Property({ type: "varchar", length: 255 })
    contactEmail: string;

    @Property({ type: "varchar", length: 150 })
    personName: string;

    @Property({ type: "varchar", length: 255 })
    socialMedia: string;

    @Property({ type: "varchar", length: 700 })
    reason: string;

    @OneToMany(() => PartnershipFormat, p => p.company)
    partnershipFormats = new Collection<PartnershipFormat>(this);
}

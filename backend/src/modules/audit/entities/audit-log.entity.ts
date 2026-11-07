import { Entity, Index, Property } from "@mikro-orm/decorators/legacy";
import { BaseEntity } from "../../../common/entities/base.entity.js";

@Entity()
@Index({ name: "audit_log_entity_idx", properties: ["entityType", "entityId"] })
@Index({ name: "audit_log_created_at_idx", properties: ["createdAt"] })
export class AuditLog extends BaseEntity {
    @Property({ type: "varchar", length: 150 })
    actor: string;

    @Property({ type: "varchar", length: 60 })
    action: string;

    @Property({ type: "varchar", length: 30 })
    entityType: string;

    @Property({ type: "uuid" })
    entityId: string;

    @Property({ type: "jsonb", nullable: true })
    metadata: Record<string, unknown> | null;
}

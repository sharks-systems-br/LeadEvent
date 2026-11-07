import { Injectable } from "@nestjs/common";
import { EntityManager } from "@mikro-orm/postgresql";
import { AuditLog } from "./entities/audit-log.entity.js";

export interface AuditEntry {
    actor: string;
    action: string;
    entityType: string;
    entityId: string;
    metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
    constructor(private readonly em: EntityManager) {}

    async record(entry: AuditEntry): Promise<void> {
        this.em.create(
            AuditLog,
            {
                actor: entry.actor,
                action: entry.action,
                entityType: entry.entityType,
                entityId: entry.entityId,
                metadata: entry.metadata ?? null,
            },
            { partial: true },
        );

        await this.em.flush();
    }
}

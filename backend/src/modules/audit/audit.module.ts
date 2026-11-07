import { Global, Module } from "@nestjs/common";
import { MikroOrmModule } from "@mikro-orm/nestjs";
import { AuditLog } from "./entities/audit-log.entity.js";
import { AuditService } from "./audit.service.js";

@Global()
@Module({
    imports: [MikroOrmModule.forFeature([AuditLog])],
    providers: [AuditService],
    exports: [AuditService],
})
export class AuditModule {}

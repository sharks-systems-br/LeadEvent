import { Migration } from "@mikro-orm/migrations";

export class Migration20261106182444 extends Migration {
    override name = "Migration20261106182444";

    override up(): void | Promise<void> {
        this.addSql(`create type "ApprovalStatus" as enum ('PENDING', 'APPROVED', 'REFUSED');`);
        this.addSql(`alter table "company" add "approval_status" "ApprovalStatus" not null default 'PENDING';`);

        this.addSql(`alter table "influencer" add "approval_status" "ApprovalStatus" not null default 'PENDING';`);
    }

    override down(): void | Promise<void> {
        this.addSql(`alter table "company" drop column "approval_status";`);

        this.addSql(`alter table "influencer" drop column "approval_status";`);

        this.addSql(`drop type "ApprovalStatus";`);
    }
}

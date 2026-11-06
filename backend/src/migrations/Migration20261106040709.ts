import { Migration } from "@mikro-orm/migrations";

export class Migration20261106040709 extends Migration {
    override name = "Migration20261106040709";

    override up(): void | Promise<void> {
        this.addSql(`alter table "company" add "deleted_at" timestamptz null;`);

        this.addSql(`alter table "influencer" add "deleted_at" timestamptz null;`);
    }

    override down(): void | Promise<void> {
        this.addSql(`alter table "company" drop column "deleted_at";`);

        this.addSql(`alter table "influencer" drop column "deleted_at";`);
    }
}

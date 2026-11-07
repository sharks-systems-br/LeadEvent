import { Migration } from "@mikro-orm/migrations";

export class Migration20261107120000 extends Migration {
    override name = "Migration20261107120000";

    override up(): void | Promise<void> {
        this.addSql(`alter table "company" add "consent_at" timestamptz null;`);
        this.addSql(`alter table "company" add "consent_version" varchar(20) null;`);
        this.addSql(`alter table "company" add "consent_ip" varchar(45) null;`);

        this.addSql(`alter table "influencer" add "consent_at" timestamptz null;`);
        this.addSql(`alter table "influencer" add "consent_version" varchar(20) null;`);
        this.addSql(`alter table "influencer" add "consent_ip" varchar(45) null;`);

        this.addSql(
            `create table "audit_log" ("id" uuid not null default gen_random_uuid(), "actor" varchar(150) not null, "action" varchar(60) not null, "entity_type" varchar(30) not null, "entity_id" uuid not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), constraint "audit_log_pkey" primary key ("id"));`,
        );
        this.addSql(`create index "audit_log_entity_idx" on "audit_log" ("entity_type", "entity_id");`);
        this.addSql(`create index "audit_log_created_at_idx" on "audit_log" ("created_at");`);
    }

    override down(): void | Promise<void> {
        this.addSql(`drop table if exists "audit_log";`);

        this.addSql(`alter table "influencer" drop column "consent_at";`);
        this.addSql(`alter table "influencer" drop column "consent_version";`);
        this.addSql(`alter table "influencer" drop column "consent_ip";`);

        this.addSql(`alter table "company" drop column "consent_at";`);
        this.addSql(`alter table "company" drop column "consent_version";`);
        this.addSql(`alter table "company" drop column "consent_ip";`);
    }
}

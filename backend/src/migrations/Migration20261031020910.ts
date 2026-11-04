import { Migration } from "@mikro-orm/migrations";

export class Migration20261031020910 extends Migration {
    override name = "Migration20261031020910";

    override up(): void | Promise<void> {
        this.addSql(
            `create type "FollowerRange" as enum ('_UP_TO_10K', '_10K_TO_50K', '_50K_TO_100K', '_100K_TO_500K', '_500K_TO_1M', '_GT_1M');`,
        );
        this.addSql(
            `create table "influencer" ("id" uuid not null default gen_random_uuid(), "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "name" varchar(150) not null, "instagram" varchar(100) not null, "phone" varchar(20) not null, "reason" varchar(600) not null, "niche" varchar(30) not null, "video_url" varchar(255) not null, "video_id" varchar(255) null, "state" char(2) not null, "city" varchar(150) not null, "follower_range" "FollowerRange" not null, primary key ("id"));`,
        );
        this.addSql(`alter table "influencer" add constraint "influencer_instagram_unique" unique ("instagram");`);
    }
}

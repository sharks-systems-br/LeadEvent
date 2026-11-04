import { Migration } from '@mikro-orm/migrations';

export class Migration20261104031328 extends Migration {

  override name = 'Migration20261104031328';

  override up(): void | Promise<void> {
    this.addSql(`create type "Disponibility" as enum ('MORNING', 'AFTERNOON', 'END_OF_THE_DAY', 'ANY_TIME', 'BY_EMAIL');`);
    this.addSql(`alter table "company" add "disponibility" "Disponibility" not null;`);
  }

  override down(): void | Promise<void> {
    this.addSql(`alter table "company" drop column "disponibility";`);

    this.addSql(`drop type "Disponibility";`);
  }

}

import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export default class CreateCateforyTable1599925153513
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'category',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            generationStrategy: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'title', type: 'varchar' },
          { name: 'created_at', type: 'date', default: 'now()' },
          { name: 'updated_at', type: 'date', default: 'now()' },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('category');
  }
}

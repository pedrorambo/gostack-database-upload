import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export default class AddTypeColumnToTransactionTable1599947062893
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'transaction',
      new TableColumn({
        name: 'type',
        type: 'varchar',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('transaction', 'type');
  }
}

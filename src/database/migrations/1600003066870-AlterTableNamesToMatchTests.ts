import { MigrationInterface, QueryRunner } from 'typeorm';

export default class AlterTableNamesToMatchTests1600003066870
  implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('transaction', 'transactions');
    await queryRunner.renameTable('category', 'categories');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('categories', 'category');
    await queryRunner.renameTable('transactions', 'transaction');
  }
}

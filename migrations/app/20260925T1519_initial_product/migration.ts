#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/d5c862f4f85c03159cc96ef27542b9bf8cbaf8697bcf7b99d94e1927f773aea6/contract';
import endContract from '../../snapshots/d5c862f4f85c03159cc96ef27542b9bf8cbaf8697bcf7b99d94e1927f773aea6/contract.json' with { type: 'json' };
import { Migration, MigrationCLI, col, fn, lit, primaryKey } from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Product',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
          col('description', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('quantity', 'int4', {
            notNull: true,
            default: lit(0),
            codecRef: { codecId: 'pg/int4@1' },
          }),
          col('sellingPrice', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('sku', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('unitCost', 'numeric', { notNull: true, codecRef: { codecId: 'pg/numeric@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-temporal@1' },
          }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Product',
        constraint: 'Product_sku_key',
        columns: ['sku'],
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);

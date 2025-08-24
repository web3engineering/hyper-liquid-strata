import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, ClickHouseClient } from '@clickhouse/client';

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
  private client: ClickHouseClient;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    this.client = createClient({
      url: `http://${this.configService.get<string>('CLICKHOUSE_HOST')}:${this.configService.get<string>('CLICKHOUSE_PORT')}`,
      database: this.configService.get<string>('CLICKHOUSE_DATABASE'),
      username: this.configService.get<string>('CLICKHOUSE_USERNAME'),
      password: this.configService.get<string>('CLICKHOUSE_PASSWORD'),
    });
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  async query(sql: string, params?: Record<string, any>) {
    try {
      const resultSet = await this.client.query({
        query: sql,
        query_params: params,
      });

      const rows = await resultSet.json();
      return rows;
    } catch (error) {
      console.error('ClickHouse query error:', error);
      throw error;
    }
  }

  async getTables() {
    return this.query(`
      SELECT name, engine, total_rows, total_bytes
      FROM system.tables 
      WHERE database = 'hyperliquid'
      ORDER BY name
    `);
  }

  async getTableData(
    tableName: string,
    limit: number = 100,
    whereClause?: string,
  ) {
    const whereSQL = whereClause ? `WHERE ${whereClause}` : '';
    return this.query(`
      SELECT *
      FROM hyperliquid.${tableName}
      ${whereSQL}
      LIMIT ${limit}
    `);
  }

  async getTableSchema(tableName: string) {
    return this.query(`
      SELECT name, type, default_expression
      FROM system.columns 
      WHERE database = 'hyperliquid' AND table = '${tableName}'
      ORDER BY position
    `);
  }

  async getUserData(
    tableName: string,
    userColumn: string,
    userId: string,
    limit: number = 100,
  ) {
    return this.query(`
      SELECT *
      FROM hyperliquid.${tableName}
      WHERE ${userColumn} = '${userId}'
      ORDER BY timestamp DESC
      LIMIT ${limit}
    `);
  }

  // New method to get sample data from a table
  async getTableSample(tableName: string, limit: number = 5) {
    return this.query(`
      SELECT *
      FROM hyperliquid.${tableName}
      LIMIT ${limit}
    `);
  }
}

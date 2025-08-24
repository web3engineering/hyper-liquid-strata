import { Controller, Get, Param, Query } from '@nestjs/common';
import { ClickHouseService } from './clickhouse.service';

@Controller('api/clickhouse')
export class ClickHouseController {
  constructor(private readonly clickhouseService: ClickHouseService) {}

  @Get('tables')
  async getTables() {
    try {
      const tables = await this.clickhouseService.getTables();
      return { success: true, data: { data: tables } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('tables/:tableName')
  async getTableData(
    @Param('tableName') tableName: string,
    @Query('limit') limit: number = 100,
    @Query('where') whereClause?: string,
  ) {
    try {
      const data = await this.clickhouseService.getTableData(
        tableName,
        limit,
        whereClause,
      );
      return { success: true, data: { data } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('tables/:tableName/schema')
  async getTableSchema(@Param('tableName') tableName: string) {
    try {
      const schema = await this.clickhouseService.getTableSchema(tableName);
      return { success: true, data: { data: schema } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('query')
  async executeQuery(@Query('sql') sql: string) {
    try {
      const data = await this.clickhouseService.query(sql);
      return { success: true, data: { data } };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  // Debug endpoints for table inspection
  @Get('debug/tables/:tableName/schema')
  async debugTableSchema(@Param('tableName') tableName: string) {
    try {
      const schema = await this.clickhouseService.getTableSchema(tableName);
      return { success: true, data: schema };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @Get('debug/tables/:tableName/sample')
  async debugTableSample(@Param('tableName') tableName: string) {
    try {
      const sample = await this.clickhouseService.getTableSample(tableName, 3);
      return { success: true, data: sample };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

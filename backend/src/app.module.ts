import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClickHouseService } from './clickhouse.service';
import { ClickHouseController } from './clickhouse.controller';
import { TraderService } from './trader.service';
import { TraderController } from './trader.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController, ClickHouseController, TraderController],
  providers: [AppService, ClickHouseService, TraderService],
})
export class AppModule {}

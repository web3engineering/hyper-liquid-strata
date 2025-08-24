import { Controller, Get, Param, Query } from '@nestjs/common';
import { TraderService, TraderStats, TraderDetail } from './trader.service';

@Controller('traders')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @Get()
  async getTraders(
    @Query('period') period: string = 'ALL',
  ): Promise<TraderStats[]> {
    return this.traderService.getTradersByPeriod(period);
  }

  @Get('search')
  async searchTraders(
    @Query('q') searchTerm: string,
    @Query('period') period: string = 'ALL',
  ): Promise<TraderStats[]> {
    return this.traderService.searchTraders(searchTerm, period);
  }

  @Get(':wallet')
  async getTraderDetails(
    @Param('wallet') wallet: string,
  ): Promise<TraderDetail> {
    return this.traderService.getTraderDetails(wallet);
  }
}

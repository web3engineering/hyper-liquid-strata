import { Controller, Get, Param, Query } from '@nestjs/common';
import {
  TraderService,
  TraderStats,
  TraderDetail,
  TraderFilters,
} from './trader.service';

@Controller('traders')
export class TraderController {
  constructor(private readonly traderService: TraderService) {}

  @Get()
  async getTraders(
    @Query('period') period: string = 'ALL',
  ): Promise<TraderStats[]> {
    return this.traderService.getTradersByPeriod(period);
  }

  @Get('filtered')
  async getFilteredTraders(
    @Query('period') period: string = 'ALL',
    @Query('winRateMin') winRateMin?: string,
    @Query('winRateMax') winRateMax?: string,
    @Query('totalRoiMin') totalRoiMin?: string,
    @Query('totalRoiMax') totalRoiMax?: string,
    @Query('avgOrderRoiMin') avgOrderRoiMin?: string,
    @Query('avgOrderRoiMax') avgOrderRoiMax?: string,
    @Query('tradingDaysMin') tradingDaysMin?: string,
    @Query('tradingCoinsMin') tradingCoinsMin?: string,
  ): Promise<TraderStats[]> {
    const filters: TraderFilters = {};

    // Parse and validate filter parameters
    if (winRateMin !== undefined) {
      const value = parseFloat(winRateMin);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        filters.winRateMin = value;
      }
    }

    if (winRateMax !== undefined) {
      const value = parseFloat(winRateMax);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        filters.winRateMax = value;
      }
    }

    if (totalRoiMin !== undefined) {
      const value = parseFloat(totalRoiMin);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        filters.totalRoiMin = value;
      }
    }

    if (totalRoiMax !== undefined) {
      const value = parseFloat(totalRoiMax);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        filters.totalRoiMax = value;
      }
    }

    if (avgOrderRoiMin !== undefined) {
      const value = parseFloat(avgOrderRoiMin);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        filters.avgOrderRoiMin = value;
      }
    }

    if (avgOrderRoiMax !== undefined) {
      const value = parseFloat(avgOrderRoiMax);
      if (!isNaN(value) && value >= 0 && value <= 100) {
        filters.avgOrderRoiMax = value;
      }
    }

    if (tradingDaysMin !== undefined) {
      const value = parseInt(tradingDaysMin, 10);
      if (!isNaN(value) && value >= 0) {
        filters.tradingDaysMin = value;
      }
    }

    if (tradingCoinsMin !== undefined) {
      const value = parseInt(tradingCoinsMin, 10);
      if (!isNaN(value) && value >= 0) {
        filters.tradingCoinsMin = value;
      }
    }

    return this.traderService.getFilteredTraders(period, filters);
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

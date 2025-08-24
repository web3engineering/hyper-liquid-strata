import { Injectable } from '@nestjs/common';
import { ClickHouseService } from './clickhouse.service';

export interface TraderStats {
  wallet: string;
  pnl: number;
  total_volume: number;
  total_trades: number;
  win_rate: number;
  avg_trade_size: number;
  cnt_trade_days: number;
  prct_wallet_roi: number;
  prct_avg_order_roi: number;
  period: string;
}

export interface TraderDetail {
  wallet: string;
  stats: TraderStats[];
  orders: any[];
  fills: any[];
}

@Injectable()
export class TraderService {
  constructor(private readonly clickhouseService: ClickHouseService) {}

  async getTradersByPeriod(period: string = 'ALL'): Promise<TraderStats[]> {
    let periodFilter = '';

    if (period !== 'ALL') {
      // Map period to the actual agg_period_type values in your table
      const periodMap: Record<string, string> = {
        '1d': '1D',
        '7d': '7D',
        '30d': '30D',
      };
      const mappedPeriod = periodMap[period] || 'ALL';
      periodFilter = `WHERE agg_period_type = '${mappedPeriod}'`;
    }

    const query = `
      SELECT 
        wallet_address as wallet,
        total_pnl as pnl,
        total_volume,
        cnt_unique_orders as total_trades,
        prct_win_rate as win_rate,
        avg_trade_usd_size as avg_trade_size,
        '${period}' as period
      FROM hyperliquid.mv_wallet_stats_by_period
      ${periodFilter}
      ORDER BY total_pnl DESC
      LIMIT 100
    `;

    const result = await this.clickhouseService.query(query);
    return result as unknown as TraderStats[];
  }

  async getTraderDetails(wallet: string): Promise<TraderDetail> {
    // Get trader stats for ALL period (aggregated stats)
    const statsQuery = `
      SELECT 
        wallet_address as wallet,
        total_pnl as pnl,
        total_volume,
        cnt_unique_orders as total_trades,
        prct_win_rate as win_rate,
        avg_trade_usd_size as avg_trade_size,
        cnt_trade_days,
        prct_wallet_roi,
        prct_avg_order_roi,
        'ALL' as period
      FROM hyperliquid.mv_wallet_stats_by_period
      WHERE wallet_address = '${wallet}' AND agg_period_type = 'ALL'
      LIMIT 1
    `;

    // Get latest orders
    const ordersQuery = `
      SELECT *
      FROM hyperliquid.mv_wallet_orders
      WHERE wallet_address = '${wallet}'
      ORDER BY utc_order_dttm DESC
      LIMIT 50
    `;

    // Get latest fills
    const fillsQuery = `
      SELECT *
      FROM hyperliquid.raw_node_fill
      WHERE wallet_address = '${wallet}'
      ORDER BY utc_fill_dttm DESC
      LIMIT 50
    `;

    const [statsResult, ordersResult, fillsResult] = await Promise.all([
      this.clickhouseService.query(statsQuery),
      this.clickhouseService.query(ordersQuery),
      this.clickhouseService.query(fillsQuery),
    ]);

    // Handle ClickHouse response format - extract data array
    const stats =
      (statsResult as unknown as { data?: TraderStats[] }).data ||
      (statsResult as unknown as TraderStats[]);
    const orders =
      (ordersResult as unknown as { data?: any[] }).data ||
      (ordersResult as unknown as any[]);
    const fills =
      (fillsResult as unknown as { data?: any[] }).data ||
      (fillsResult as unknown as any[]);

    return {
      wallet,
      stats: Array.isArray(stats) && stats.length > 0 ? stats : [],
      orders: Array.isArray(orders) ? orders : [],
      fills: Array.isArray(fills) ? fills : [],
    };
  }

  async searchTraders(
    searchTerm: string,
    period: string = 'ALL',
  ): Promise<TraderStats[]> {
    let periodFilter = '';

    if (period !== 'ALL') {
      const periodMap: Record<string, string> = {
        '1d': '1D',
        '7d': '7D',
        '30d': '30D',
      };
      const mappedPeriod = periodMap[period] || 'ALL';
      periodFilter = `AND agg_period_type = '${mappedPeriod}'`;
    }

    const query = `
      SELECT 
        wallet_address as wallet,
        total_pnl as pnl,
        total_volume,
        cnt_unique_orders as total_trades,
        prct_win_rate as win_rate,
        avg_trade_usd_size as avg_trade_size,
        '${period}' as period
      FROM hyperliquid.mv_wallet_stats_by_period
      WHERE wallet_address LIKE '%${searchTerm}%' ${periodFilter}
      ORDER BY total_pnl DESC
      LIMIT 50
    `;

    const result = await this.clickhouseService.query(query);
    return result as unknown as TraderStats[];
  }
}

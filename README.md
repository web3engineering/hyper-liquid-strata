# HyperLiquid Trader Dashboard

A comprehensive dashboard for viewing and analyzing trader performance data from HyperLiquid's ClickHouse database.

## Features

### 🏆 Main Dashboard
- **Top Traders by PnL**: View traders sorted by profit/loss in descending order
- **Period Filtering**: Filter data by 1 day, 7 days, 30 days, or all time
- **Search Functionality**: Search for specific traders by wallet address
- **Real-time Data**: Live data from ClickHouse database

### 📊 Trader Details
- **Performance Metrics**: PnL, volume, trade count, win rate, average trade size
- **Recent Orders**: Latest trading orders with detailed information
- **Recent Fills**: Latest order fills and executions
- **Interactive Charts**: Visual representation of trader performance

### 🎨 Modern UI
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Beautiful Interface**: Modern gradient design with smooth animations
- **Intuitive Navigation**: Easy-to-use interface with clear data presentation

## Database Tables Used

The dashboard integrates with the following ClickHouse tables:

- **`mv_wallet_stats_by_period`**: Main trader statistics and PnL data
- **`mv_wallet_orders`**: Trader order history and details
- **`raw_node_fill`**: Order fill and execution data
- **`mv_wallet_stats`**: Additional trader metrics and statistics

## Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the backend directory with your ClickHouse credentials:
   ```env
   CLICKHOUSE_HOST=localhost
   CLICKHOUSE_PORT=8123
   CLICKHOUSE_DATABASE=hyperliquid
   CLICKHOUSE_USERNAME=default
   CLICKHOUSE_PASSWORD=
   ```

4. **Start the backend server:**
   ```bash
   npm run start:dev
   ```
   The backend will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the frontend:**
   ```bash
   npm start
   ```
   The frontend will open in your browser at `http://localhost:8080`

## API Endpoints

### Traders
- `GET /traders` - Get all traders sorted by PnL
- `GET /traders?period=7d` - Get traders for specific period (1d, 7d, 30d, ALL)
- `GET /traders/search?q=wallet&period=ALL` - Search traders by wallet address
- `GET /traders/:wallet` - Get detailed information for a specific trader

### ClickHouse (Legacy)
- `GET /api/clickhouse/tables` - Get available database tables
- `GET /api/clickhouse/tables/:table` - Get data from specific table
- `GET /api/clickhouse/tables/:table/schema` - Get table schema
- `POST /api/clickhouse/query` - Execute custom SQL queries

## Usage

### Viewing Top Traders
1. Open the dashboard in your browser
2. Use the period selector to filter by time range
3. View traders sorted by PnL (highest to lowest)
4. Click on any trader card to view detailed information

### Searching for Traders
1. Use the search box to find specific traders
2. Enter wallet address (full or partial)
3. Results update in real-time as you type
4. Combine search with period filtering

### Analyzing Trader Performance
1. Click on a trader card to open the details modal
2. View comprehensive performance metrics
3. Examine recent orders and fills
4. Analyze trading patterns and success rates

## Data Structure

### Trader Statistics
```typescript
interface TraderStats {
  wallet: string;           // Trader wallet address
  pnl: number;              // Profit/Loss amount
  total_volume: number;     // Total trading volume
  total_trades: number;     // Number of trades
  win_rate: number;         // Percentage of profitable trades
  avg_trade_size: number;   // Average trade size
  period: string;           // Time period (1d, 7d, 30d, ALL)
}
```

### Trader Details
```typescript
interface TraderDetail {
  wallet: string;           // Trader wallet address
  stats: TraderStats[];     // Performance statistics
  orders: any[];            // Recent orders
  fills: any[];             // Recent fills
}
```

## Customization

### Adding New Metrics
1. Modify the SQL queries in `backend/src/trader.service.ts`
2. Update the TypeScript interfaces
3. Add new UI components in the frontend

### Styling Changes
1. Edit `frontend/styles.css` for visual modifications
2. Update `frontend/index.html` for structural changes
3. Modify `frontend/script.js` for functional enhancements

### Database Integration
1. Update ClickHouse queries in the service files
2. Add new table integrations as needed
3. Modify data transformation logic

## Troubleshooting

### Common Issues

**Backend won't start:**
- Check ClickHouse connection settings in `.env`
- Ensure ClickHouse server is running
- Verify database and table permissions

**Frontend can't connect to backend:**
- Confirm backend is running on port 3000
- Check CORS settings if needed
- Verify API endpoint URLs

**No data displayed:**
- Check database connection
- Verify table names and structure
- Review ClickHouse query syntax

### Performance Tips

- Use appropriate period filters to limit data
- Implement pagination for large datasets
- Add database indexes for frequently queried columns
- Cache frequently accessed data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Check the troubleshooting section
- Review the API documentation
- Examine the code examples
- Create an issue in the repository

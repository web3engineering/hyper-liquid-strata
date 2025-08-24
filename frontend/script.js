// Global variables
let currentTraders = [];
let currentPeriod = 'ALL';
let searchTimeout;
let currentTraderWallet = '';

// API configuration
const API_BASE_URL = 'http://144.76.39.46:3004';

// Utility functions
function formatNumber(num) {
    if (num === null || num === undefined) return '0';
    if (typeof num === 'string') num = parseFloat(num);
    
    if (Math.abs(num) >= 1e9) {
        return (num / 1e9).toFixed(2) + 'B';
    } else if (Math.abs(num) >= 1e6) {
        return (num / 1e6).toFixed(2) + 'M';
    } else if (Math.abs(num) >= 1e3) {
        return (num / 1e3).toFixed(2) + 'K';
    } else {
        return num.toFixed(2);
    }
}

function formatCurrency(num) {
    if (num === null || num === undefined) return '$0.00';
    if (typeof num === 'string') num = parseFloat(num);
    
    const sign = num >= 0 ? '+' : '';
    return `${sign}$${Math.abs(num).toFixed(2)}`;
}

function formatPercentage(num) {
    if (num === null || num === undefined) return '0%';
    if (typeof num === 'string') num = parseFloat(num);
    
    return `${num.toFixed(1)}%`;
}

function formatWallet(wallet) {
    if (!wallet) return 'Unknown';
    if (wallet.length <= 12) return wallet;
    return `${wallet.substring(0, 6)}...${wallet.substring(wallet.length - 6)}`;
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
}

function showLoading() {
    document.getElementById('loadingSpinner').classList.remove('hidden');
}

function hideLoading() {
    document.getElementById('loadingSpinner').classList.add('hidden');
}

function showError(message) {
    // Create a simple error notification
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #e53e3e;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 600;
    `;
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// API functions
async function fetchTraders(period = 'ALL') {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/traders?period=${period}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle ClickHouse response format
        const traders = result.data || result;
        
        // Ensure we return an array
        if (!Array.isArray(traders)) {
            console.warn('Fetch traders API returned non-array data:', traders);
            return [];
        }
        
        return traders;
    } catch (error) {
        console.error('Error fetching traders:', error);
        showError('Failed to load traders. Please try again.');
        return [];
    } finally {
        hideLoading();
    }
}

async function searchTraders() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const period = document.getElementById('period').value;
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search
    searchTimeout = setTimeout(async () => {
        try {
            const traders = await searchTradersAPI(searchTerm, period);
            renderTraders(traders);
        } catch (error) {
            console.error('Search error:', error);
            showError('Search failed. Please try again.');
            // Show empty results on error
            renderTraders([]);
        }
    }, 300);
}

async function searchTradersAPI(searchTerm, period = 'ALL') {
    try {
        if (!searchTerm.trim()) {
            return await fetchTraders(period);
        }
        
        const response = await fetch(`${API_BASE_URL}/traders/search?q=${encodeURIComponent(searchTerm)}&period=${period}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle ClickHouse response format
        const traders = result.data || result;
        
        // Ensure we return an array
        if (!Array.isArray(traders)) {
            console.warn('Search API returned non-array data:', traders);
            return [];
        }
        
        return traders;
    } catch (error) {
        console.error('Error searching traders:', error);
        showError('Failed to search traders. Please try again.');
        return [];
    }
}

async function fetchTraderDetails(wallet) {
    try {
        showLoading();
        const response = await fetch(`${API_BASE_URL}/traders/${encodeURIComponent(wallet)}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Handle ClickHouse response format for orders and fills
        if (result.orders && result.orders.data) {
            result.orders = result.orders.data;
        }
        if (result.fills && result.fills.data) {
            result.fills = result.fills.data;
        }
        
        return result;
    } catch (error) {
        console.error('Error fetching trader details:', error);
        showError('Failed to load trader details. Please try again.');
        return null;
    } finally {
        hideLoading();
    }
}

// UI functions
function renderTraders(traders) {
    // Add null/undefined check
    if (!traders || !Array.isArray(traders)) {
        console.warn('renderTraders called with invalid data:', traders);
        traders = [];
    }
    
    currentTraders = traders;
    const tradersTableBody = document.getElementById('tradersTableBody');
    const totalTradersElement = document.getElementById('totalTraders');
    
    if (!tradersTableBody || !totalTradersElement) {
        console.error('Required DOM elements not found');
        return;
    }
    
    totalTradersElement.textContent = traders.length;
    
    if (traders.length === 0) {
        tradersTableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 3rem; color: #718096;">
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                    <h3>No traders found</h3>
                    <p>Try adjusting your search or period filter</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tradersTableBody.innerHTML = traders.map((trader, index) => `
        <tr data-wallet="${trader.wallet}">
            <td class="rank-cell">${index + 1}</td>
            <td class="wallet-cell" title="${trader.wallet}">${formatWallet(trader.wallet)}</td>
            <td class="pnl-cell ${trader.pnl >= 0 ? 'pnl-positive' : 'pnl-negative'}">
                ${formatCurrency(trader.pnl)}
            </td>
            <td class="volume-cell">${formatNumber(trader.total_volume)}</td>
            <td class="trades-cell">${trader.total_trades}</td>
            <td class="winrate-cell">${formatPercentage(trader.win_rate)}</td>
            <td class="avgtrade-cell">${formatNumber(trader.avg_trade_size)}</td>
        </tr>
    `).join('');
    
    // Add click event listeners to table rows
    const tableRows = tradersTableBody.querySelectorAll('tr[data-wallet]');
    tableRows.forEach(row => {
        row.addEventListener('click', function() {
            const wallet = this.getAttribute('data-wallet');
            openTraderDetails(wallet);
        });
    });
}

function renderTraderOverview(traderDetails) {
    const traderOverview = document.getElementById('traderOverview');
    
    // Handle stats - might be empty array or have data
    const stats = Array.isArray(traderDetails.stats) && traderDetails.stats.length > 0 ? traderDetails.stats[0] : {};
    
    traderOverview.innerHTML = `
        <div class="overview-card">
            <div class="overview-value ${(stats.pnl || 0) >= 0 ? 'pnl-positive' : 'pnl-negative'}">
                ${formatCurrency(stats.pnl || 0)}
            </div>
            <div class="overview-label">Total PnL</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${formatNumber(stats.total_volume || 0)}</div>
            <div class="overview-label">Total Volume</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${stats.total_trades || 0}</div>
            <div class="overview-label">Total Trades</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${formatPercentage(stats.win_rate || 0)}</div>
            <div class="overview-label">Win Rate</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${formatNumber(stats.avg_trade_size || 0)}</div>
            <div class="overview-label">Avg Trade Size</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${stats.cnt_trade_days || 0}</div>
            <div class="overview-label">Trading Days</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${formatPercentage(stats.prct_wallet_roi || 0)}</div>
            <div class="overview-label">Wallet ROI</div>
        </div>
        <div class="overview-card">
            <div class="overview-value">${formatPercentage(stats.prct_avg_order_roi || 0)}</div>
            <div class="overview-label">Avg Order ROI</div>
        </div>
    `;
}

function renderOrdersTable(orders) {
    if (!orders || orders.length === 0) {
        return '<p style="text-align: center; color: #718096; padding: 2rem;">No orders found for this trader.</p>';
    }
    
    const headers = Object.keys(orders[0]).slice(0, 8); // Limit to first 8 columns for readability
    
    return `
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => `
                        <tr>
                            ${headers.map(header => {
                                let value = order[header];
                                if (header === 'utc_order_dttm') {
                                    value = formatTimestamp(value);
                                } else if (header === 'wallet_address') {
                                    value = formatWallet(value);
                                } else if (typeof value === 'number') {
                                    value = formatNumber(value);
                                }
                                return `<td title="${order[header]}">${value || '-'}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function renderFillsTable(fills) {
    if (!Array.isArray(fills) || fills.length === 0) {
        return '<div class="no-data">No fills found for this trader</div>';
    }

    // Define headers for fills table - removed UTC FILL DT, WALLET ADDRESS, Side, order_id, fill_id and added fill_type, closed_pnl, fee
    const headers = ['utc_fill_dttm', 'coin', 'price', 'size', 'fill_type', 'closed_pnl', 'fee'];
    
    return `
        <div class="table-wrapper">
            <table class="data-table">
                <thead>
                    <tr>
                        ${headers.map(header => `<th>${header.replace(/_/g, ' ').toUpperCase()}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${fills.map(fill => `
                        <tr>
                            ${headers.map(header => {
                                let value = fill[header];
                                
                                // Format specific fields
                                if (header === 'utc_fill_dttm') {
                                    value = value ? new Date(value).toLocaleString() : '-';
                                } else if (header === 'price' || header === 'size' || header === 'closed_pnl' || header === 'fee') {
                                    value = value ? (typeof value === 'number' ? value.toLocaleString() : value) : '-';
                                } else if (header === 'coin') {
                                    value = value || '-';
                                } else if (header === 'fill_type') {
                                    value = value || '-';
                                }
                                
                                return `<td title="${fill[header]}">${value || '-'}</td>`;
                            }).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Page navigation functions
function showMainDashboard() {
    document.getElementById('mainDashboard').style.display = 'block';
    document.getElementById('traderDetailsPage').style.display = 'none';
}

function showTraderDetails() {
    document.getElementById('mainDashboard').style.display = 'none';
    document.getElementById('traderDetailsPage').style.display = 'block';
}

function goBackToMain() {
    showMainDashboard();
}

// Tab functions
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Trader details functions
async function openTraderDetails(wallet) {
    
    currentTraderWallet = wallet;
    
    try {
        // Show loading
        showLoading();
        
        // Update page title
        document.getElementById('traderPageTitle').textContent = `Trader: ${formatWallet(wallet)}`;
        
        // Load trader details
        const traderDetails = await fetchTraderDetails(wallet);
        
        if (traderDetails) {
            
            // Render overview
            renderTraderOverview(traderDetails);
            
            // Update counts
            const orders = Array.isArray(traderDetails.orders) ? traderDetails.orders : [];
            const fills = Array.isArray(traderDetails.fills) ? traderDetails.fills : [];
            
            document.getElementById('ordersCount').textContent = orders.length;
            document.getElementById('fillsCount').textContent = fills.length;
            
            // Render initial tab content (orders)
            document.getElementById('ordersTableContainer').innerHTML = renderOrdersTable(orders);
            document.getElementById('fillsTableContainer').innerHTML = renderFillsTable(fills);
            
            // Show trader details page
            showTraderDetails();
            
        } else {
            console.error('Failed to load trader details');
            showError('Failed to load trader details');
        }
    } catch (error) {
        console.error('Error opening trader details:', error);
        showError('Error loading trader details');
    } finally {
        hideLoading();
    }
}

// Event handlers
async function loadTraders() {
    const period = document.getElementById('period').value;
    currentPeriod = period;
    
    const traders = await fetchTraders(period);
    renderTraders(traders);
}

async function searchTraders() {
    const searchTerm = document.getElementById('searchInput').value.trim();
    const period = document.getElementById('period').value;
    
    // Clear previous timeout
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    // Debounce search
    searchTimeout = setTimeout(async () => {
        try {
            const traders = await searchTradersAPI(searchTerm, period);
            renderTraders(traders);
        } catch (error) {
            console.error('Search error:', error);
            showError('Search failed. Please try again.');
            // Show empty results on error
            renderTraders([]);
        }
    }, 300);
}

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Load initial traders
    loadTraders();
    
    // Add event listeners
    document.getElementById('period').addEventListener('change', loadTraders);
    document.getElementById('searchInput').addEventListener('input', searchTraders);
});

// Export functions for global access
window.loadTraders = loadTraders;
window.searchTraders = searchTraders;
window.openTraderDetails = openTraderDetails;
window.goBackToMain = goBackToMain;
window.switchTab = switchTab;
window.openSmartSearchAI = openSmartSearchAI;

// Smart Search AI function
function openSmartSearchAI() {
    console.log('Opening Smart Search AI...');
    window.open('http://144.76.39.46:3003/', '_blank');
}

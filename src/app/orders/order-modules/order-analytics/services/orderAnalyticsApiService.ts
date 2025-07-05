import { OrderAnalyticsData, AnalyticsFilters, DateRange } from '../types';

export class OrderAnalyticsApiService {
  /**
   * Format analytics data for chart display
   */
  static formatChartData(analytics: OrderAnalyticsData) {
    return {
      salesChart: {
        labels: analytics.dailySales.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        ),
        datasets: [
          {
            label: 'Sales',
            data: analytics.dailySales.map(item => item.total),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            fill: true
          }
        ]
      },
      ordersChart: {
        labels: analytics.dailyOrders.map(item => 
          new Date(item.date).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          })
        ),
        datasets: [
          {
            label: 'Orders',
            data: analytics.dailyOrders.map(item => item.count),
            borderColor: 'rgb(34, 197, 94)',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true
          }
        ]
      },
      statusChart: {
        labels: Object.keys(analytics.ordersByStatus),
        datasets: [
          {
            data: Object.values(analytics.ordersByStatus),
            backgroundColor: [
              '#FCD34D', // pending
              '#60A5FA', // confirmed
              '#A78BFA', // processing
              '#818CF8', // shipped
              '#34D399', // delivered
              '#F87171'  // cancelled
            ],
            borderWidth: 0
          }
        ]
      }
    };
  }

  /**
   * Calculate growth percentage
   */
  static calculateGrowth(current: number, previous: number): {
    percentage: number;
    trend: 'up' | 'down' | 'neutral';
  } {
    if (previous === 0) {
      return { percentage: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'neutral' };
    }

    const percentage = Math.round(((current - previous) / previous) * 100);
    const trend = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'neutral';

    return { percentage: Math.abs(percentage), trend };
  }

  /**
   * Format currency values
   */
  static formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  }

  /**
   * Export analytics data to CSV
   */
  static exportAnalyticsToCSV(analytics: OrderAnalyticsData): void {
    const headers = [
      'Date',
      'Sales Amount',
      'Orders Count',
      'Average Order Value'
    ];

    const rows = analytics.dailySales.map((sale, index) => [
      new Date(sale.date).toLocaleDateString(),
      sale.total.toString(),
      analytics.dailyOrders[index]?.count.toString() || '0',
      (sale.total / (analytics.dailyOrders[index]?.count || 1)).toFixed(2)
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `order-analytics-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Generate analytics report summary
   */
  static generateReportSummary(analytics: OrderAnalyticsData): string {
    const totalOrders = Object.values(analytics.ordersByStatus).reduce((sum, count) => sum + count, 0);
    const totalRevenue = analytics.dailySales.reduce((sum, sale) => sum + sale.total, 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return `
Analytics Report Summary:
- Total Orders: ${totalOrders.toLocaleString()}
- Total Revenue: ${this.formatCurrency(totalRevenue)}
- Average Order Value: ${this.formatCurrency(avgOrderValue)}
- Top Status: ${Object.entries(analytics.ordersByStatus).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
- Date Range: ${analytics.dailySales[0]?.date} to ${analytics.dailySales[analytics.dailySales.length - 1]?.date}
    `.trim();
  }

  /**
   * Get date range presets
   */
  static getDateRangePresets(): { label: string; value: DateRange }[] {
    const now = new Date();
    
    return [
      {
        label: 'Last 7 days',
        value: {
          from: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
          to: now
        }
      },
      {
        label: 'Last 30 days',
        value: {
          from: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          to: now
        }
      },
      {
        label: 'Last 90 days',
        value: {
          from: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
          to: now
        }
      },
      {
        label: 'This month',
        value: {
          from: new Date(now.getFullYear(), now.getMonth(), 1),
          to: now
        }
      },
      {
        label: 'Last month',
        value: {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0)
        }
      }
    ];
  }
}

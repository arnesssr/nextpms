import { Order } from '@/types';

export class OrderListService {
  /**
   * Format order data for display
   */
  static formatOrderForDisplay(order: Order): Order & {
    formattedTotal: string;
    formattedDate: string;
    statusColor: string;
  } {
    return {
      ...order,
      formattedTotal: new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(order.total),
      formattedDate: new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      statusColor: this.getStatusColor(order.status)
    };
  }

  /**
   * Get status color for badges
   */
  static getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Download orders as CSV file
   */
  static downloadCSV(orders: Order[]): void {
    const csvContent = this.exportToCSV(orders);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Export orders to CSV
   */
  static exportToCSV(orders: Order[]): string {
    const headers = [
      'Order ID',
      'Customer ID',
      'Status',
      'Total Amount',
      'Items Count',
      'Created Date',
      'Shipping Address'
    ];

    const rows = orders.map(order => [
      order.id,
      order.customerId,
      order.status,
      order.total.toString(),
      order.items.length.toString(),
      new Date(order.createdAt).toLocaleDateString(),
      order.shippingAddress
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * Filter orders based on criteria
   */
  static filterOrders(orders: Order[], filters: any): Order[] {
    return orders.filter(order => {
      // Status filter
      if (filters.status && order.status !== filters.status) {
        return false;
      }

      // Customer filter
      if (filters.customerId && order.customerId !== filters.customerId) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const searchableText = [
          order.id,
          order.customerId,
          order.status,
          order.shippingAddress
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(searchTerm)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateFrom) {
        const orderDate = new Date(order.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (orderDate < fromDate) {
          return false;
        }
      }

      if (filters.dateTo) {
        const orderDate = new Date(order.createdAt);
        const toDate = new Date(filters.dateTo);
        if (orderDate > toDate) {
          return false;
        }
      }

      return true;
    });
  }

  /**
   * Sort orders
   */
  static sortOrders(orders: Order[], sortBy: string, sortOrder: 'asc' | 'desc' = 'desc'): Order[] {
    return [...orders].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'total':
          aValue = a.total;
          bValue = b.total;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'customerId':
          aValue = a.customerId;
          bValue = b.customerId;
          break;
        default:
          aValue = a.id;
          bValue = b.id;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  /**
   * Calculate order statistics
   */
  static calculateStats(orders: Order[]) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total_orders: totalOrders,
      pending_orders: statusCounts.pending || 0,
      processing_orders: statusCounts.processing || 0,
      shipped_orders: statusCounts.shipped || 0,
      delivered_orders: statusCounts.delivered || 0,
      cancelled_orders: statusCounts.cancelled || 0,
      total_revenue: totalRevenue,
      average_order_value: averageOrderValue
    };
  }
}
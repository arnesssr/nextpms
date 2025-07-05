import { supabase } from '@/lib/supabaseClient';
import { Order } from '@/types';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface OrderAnalytics {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  ordersByStatus: Record<string, number>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  topCustomers: Array<{ customerId: string; orderCount: number; totalSpent: number }>;
}

export class OrderAnalyticsService {
  /**
   * Get comprehensive order analytics
   */
  static async getOrderAnalytics(
    dateFrom?: string,
    dateTo?: string
  ): Promise<ApiResponse<OrderAnalytics>> {
    try {
      let query = supabase
        .from('orders')
        .select('*');

      // Apply date filters
      if (dateFrom) {
        query = query.gte('createdAt', dateFrom);
      }
      if (dateTo) {
        query = query.lte('createdAt', dateTo);
      }

      const { data: orders, error } = await query;

      if (error) {
        console.error('Error fetching orders for analytics:', error);
        return {
          success: false,
          message: error.message
        };
      }

      const analytics = this.calculateAnalytics(orders || []);

      return {
        success: true,
        data: analytics
      };
    } catch (error) {
      console.error('Error in getOrderAnalytics:', error);
      return {
        success: false,
        message: 'Failed to fetch order analytics'
      };
    }
  }

  /**
   * Calculate analytics from order data
   */
  private static calculateAnalytics(orders: Order[]): OrderAnalytics {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Orders by status
    const ordersByStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Revenue by month (simplified)
    const revenueByMonth = this.calculateRevenueByMonth(orders);

    // Top customers (simplified)
    const topCustomers = this.calculateTopCustomers(orders);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      ordersByStatus,
      revenueByMonth,
      topCustomers
    };
  }

  /**
   * Calculate revenue by month
   */
  private static calculateRevenueByMonth(orders: Order[]): Array<{ month: string; revenue: number }> {
    const monthlyRevenue = orders.reduce((acc, order) => {
      const month = new Date(order.createdAt).toISOString().slice(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + order.total;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyRevenue)
      .map(([month, revenue]) => ({ month, revenue }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * Calculate top customers
   */
  private static calculateTopCustomers(orders: Order[]): Array<{ customerId: string; orderCount: number; totalSpent: number }> {
    const customerStats = orders.reduce((acc, order) => {
      const customerId = order.customerId;
      if (!acc[customerId]) {
        acc[customerId] = { orderCount: 0, totalSpent: 0 };
      }
      acc[customerId].orderCount += 1;
      acc[customerId].totalSpent += order.total;
      return acc;
    }, {} as Record<string, { orderCount: number; totalSpent: number }>);

    return Object.entries(customerStats)
      .map(([customerId, stats]) => ({
        customerId,
        orderCount: stats.orderCount,
        totalSpent: stats.totalSpent
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 10); // Top 10 customers
  }

  /**
   * Get order trends
   */
  static async getOrderTrends(days: number = 30): Promise<ApiResponse<any>> {
    try {
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - days);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('createdAt, total, status')
        .gte('createdAt', dateFrom.toISOString());

      if (error) {
        console.error('Error fetching order trends:', error);
        return {
          success: false,
          message: error.message
        };
      }

      // Group orders by day
      const dailyStats = orders?.reduce((acc, order) => {
        const day = new Date(order.createdAt).toISOString().split('T')[0];
        if (!acc[day]) {
          acc[day] = { orders: 0, revenue: 0 };
        }
        acc[day].orders += 1;
        acc[day].revenue += order.total;
        return acc;
      }, {} as Record<string, { orders: number; revenue: number }>);

      const trends = Object.entries(dailyStats || {})
        .map(([date, stats]) => ({
          date,
          orders: stats.orders,
          revenue: stats.revenue
        }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        success: true,
        data: trends
      };
    } catch (error) {
      console.error('Error in getOrderTrends:', error);
      return {
        success: false,
        message: 'Failed to fetch order trends'
      };
    }
  }
}
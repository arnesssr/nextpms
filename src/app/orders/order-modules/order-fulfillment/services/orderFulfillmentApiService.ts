import { Order, FulfillmentStatus, ShipmentInfo, FulfillmentAction } from '../types';

export class OrderFulfillmentApiService {
  /**
   * Get status color for fulfillment badges
   */
  static getStatusColor(status: FulfillmentStatus): string {
    const colors: Record<FulfillmentStatus, string> = {
      confirmed: 'bg-blue-100 text-blue-800',
      processing: 'bg-yellow-100 text-yellow-800',
      packed: 'bg-purple-100 text-purple-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get next status in fulfillment workflow
   */
  static getNextStatus(currentStatus: FulfillmentStatus): FulfillmentStatus | null {
    const workflow: Record<FulfillmentStatus, FulfillmentStatus | null> = {
      confirmed: 'processing',
      processing: 'packed',
      packed: 'shipped',
      shipped: 'delivered',
      delivered: null
    };
    return workflow[currentStatus] || null;
  }

  /**
   * Get available actions for order status
   */
  static getAvailableActions(status: FulfillmentStatus): FulfillmentAction[] {
    const actions: Record<FulfillmentStatus, FulfillmentAction[]> = {
      confirmed: ['start_processing', 'cancel'],
      processing: ['mark_packed', 'cancel'],
      packed: ['mark_shipped', 'cancel'],
      shipped: ['mark_delivered'],
      delivered: []
    };
    return actions[status] || [];
  }

  /**
   * Format tracking information
   */
  static formatTrackingInfo(shipmentInfo?: ShipmentInfo): string {
    if (!shipmentInfo) return 'No tracking info';
    
    return `${shipmentInfo.carrier}: ${shipmentInfo.trackingNumber}`;
  }

  /**
   * Export fulfillment report to CSV
   */
  static exportFulfillmentReportCSV(orders: Order[]): void {
    const headers = [
      'Order ID',
      'Customer',
      'Status',
      'Items Count',
      'Total Amount',
      'Order Date',
      'Carrier',
      'Tracking Number',
      'Shipped Date'
    ];

    const rows = orders.map(order => [
      order.id,
      order.customerId,
      order.status,
      order.items.length.toString(),
      order.total.toString(),
      new Date(order.createdAt).toLocaleDateString(),
      order.shipmentInfo?.carrier || '',
      order.shipmentInfo?.trackingNumber || '',
      order.shipmentInfo?.shippedAt ? new Date(order.shipmentInfo.shippedAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `fulfillment-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get shipping carriers
   */
  static getShippingCarriers() {
    return [
      { value: 'ups', label: 'UPS' },
      { value: 'fedex', label: 'FedEx' },
      { value: 'usps', label: 'USPS' },
      { value: 'dhl', label: 'DHL' },
      { value: 'amazon', label: 'Amazon Logistics' }
    ];
  }

  /**
   * Calculate fulfillment metrics
   */
  static calculateFulfillmentMetrics(orders: Order[]) {
    const total = orders.length;
    const byStatus = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgProcessingTime = this.calculateAverageProcessingTime(orders);
    const shippedToday = orders.filter(order => 
      order.shipmentInfo?.shippedAt &&
      new Date(order.shipmentInfo.shippedAt).toDateString() === new Date().toDateString()
    ).length;

    return {
      total,
      confirmed: byStatus.confirmed || 0,
      processing: byStatus.processing || 0,
      packed: byStatus.packed || 0,
      shipped: byStatus.shipped || 0,
      delivered: byStatus.delivered || 0,
      avgProcessingTime,
      shippedToday
    };
  }

  /**
   * Calculate average processing time
   */
  private static calculateAverageProcessingTime(orders: Order[]): number {
    const processedOrders = orders.filter(order => 
      order.status === 'shipped' || order.status === 'delivered'
    );

    if (processedOrders.length === 0) return 0;

    const totalProcessingTime = processedOrders.reduce((total, order) => {
      const orderDate = new Date(order.createdAt);
      const shippedDate = order.shipmentInfo?.shippedAt 
        ? new Date(order.shipmentInfo.shippedAt)
        : new Date();
      
      return total + (shippedDate.getTime() - orderDate.getTime());
    }, 0);

    const avgMilliseconds = totalProcessingTime / processedOrders.length;
    return Math.round(avgMilliseconds / (1000 * 60 * 60 * 24)); // Convert to days
  }
}

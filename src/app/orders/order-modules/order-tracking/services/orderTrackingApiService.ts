import { TrackedOrder, TrackingStatus } from '../types';

export class OrderTrackingApiService {
  /**
   * Get status color for tracking status badges
   */
  static getStatusColor(status: TrackingStatus): string {
    const colors: Record<TrackingStatus, string> = {
      pending: 'bg-gray-100 text-gray-800',
      in_transit: 'bg-yellow-100 text-yellow-800',
      delivered: 'bg-green-100 text-green-800',
      returned: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Format tracking information
   */
  static formatTrackingInfo(order: TrackedOrder) {
    if (order.trackingInfo) {
      return `Carrier: ${order.trackingInfo.carrier}\nTracking Number: ${order.trackingInfo.trackingNumber}`;
    }
    return 'No tracking info available';
  }

  /**
   * Export tracking report to CSV
   */
  static exportTrackingReportCSV(trackedOrders: TrackedOrder[]): void {
    const headers = [
      'Order ID',
      'Customer ID',
      'Status',
      'Carrier',
      'Tracking Number',
      'Date Ordered',
      'Last Updated'
    ];

    const rows = trackedOrders.map((order) => [
      order.id,
      order.customerId,
      order.status,
      order.trackingInfo?.carrier || '',
      order.trackingInfo?.trackingNumber || '',
      new Date(order.dateOrdered).toLocaleDateString(),
      order.lastUpdated ? new Date(order.lastUpdated).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `tracking-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Get tracking status updates
   */
  static getTrackingUpdates(trackedOrders: TrackedOrder[]): string {
    return trackedOrders.reduce((message, order) = "  ").concat(
      order.trackingUpdates
        .map((update) => `${new Date(update.date).toLocaleDateString()} - ${update.status}`)
        .join('\n'),
    "\n");
    
  }
}

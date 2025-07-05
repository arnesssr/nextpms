import { ReturnRequest, ReturnStatus, ReturnItem, ReturnReason } from '../types';

export class OrderReturnsApiService {
  /**
   * Get status color for return badges
   */
  static getStatusColor(status: ReturnStatus): string {
    const colors: Record<ReturnStatus, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      shipped_back: 'bg-purple-100 text-purple-800',
      received: 'bg-indigo-100 text-indigo-800',
      refunded: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  }

  /**
   * Get return reasons
   */
  static getReturnReasons(): ReturnReason[] {
    return [
      { value: 'defective', label: 'Defective/Damaged Product' },
      { value: 'wrong_item', label: 'Wrong Item Received' },
      { value: 'not_as_described', label: 'Not As Described' },
      { value: 'size_issue', label: 'Size/Fit Issue' },
      { value: 'changed_mind', label: 'Changed Mind' },
      { value: 'duplicate_order', label: 'Duplicate Order' },
      { value: 'late_delivery', label: 'Late Delivery' },
      { value: 'other', label: 'Other' }
    ];
  }

  /**
   * Calculate refund amount based on return policy
   */
  static calculateRefundAmount(items: ReturnItem[], returnReason: string): number {
    const baseRefund = items.reduce((total, item) => total + item.refundAmount, 0);
    
    // Apply deductions based on reason
    const deductionRates: Record<string, number> = {
      defective: 0, // Full refund
      wrong_item: 0, // Full refund
      not_as_described: 0, // Full refund
      size_issue: 0.1, // 10% restocking fee
      changed_mind: 0.15, // 15% restocking fee
      duplicate_order: 0, // Full refund
      late_delivery: 0, // Full refund
      other: 0.1 // 10% restocking fee
    };

    const deductionRate = deductionRates[returnReason] || 0.1;
    const deduction = baseRefund * deductionRate;
    
    return Math.max(0, baseRefund - deduction);
  }

  /**
   * Validate return request
   */
  static validateReturnRequest(orderId: string, items: ReturnItem[], reason: string): string[] {
    const errors: string[] = [];

    if (!orderId) {
      errors.push('Order ID is required');
    }

    if (!items || items.length === 0) {
      errors.push('At least one item must be selected for return');
    }

    if (!reason) {
      errors.push('Return reason is required');
    }

    items.forEach((item, index) => {
      if (!item.productId) {
        errors.push(`Item ${index + 1}: Product ID is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.refundAmount < 0) {
        errors.push(`Item ${index + 1}: Refund amount cannot be negative`);
      }
    });

    return errors;
  }

  /**
   * Format return summary
   */
  static formatReturnSummary(returnRequest: ReturnRequest): string {
    const itemsText = returnRequest.items.map((item, index) => 
      `${index + 1}. ${item.productName} - Qty: ${item.quantity} - Refund: $${item.refundAmount.toFixed(2)}`
    ).join('\n');

    const totalRefund = returnRequest.items.reduce((sum, item) => sum + item.refundAmount, 0);

    return `
Return Request Summary:
${itemsText}

Total Refund Amount: $${totalRefund.toFixed(2)}
Reason: ${returnRequest.reason}
Status: ${returnRequest.status}
${returnRequest.description ? `Description: ${returnRequest.description}` : ''}
    `.trim();
  }

  /**
   * Export returns report to CSV
   */
  static exportReturnsReportCSV(returns: ReturnRequest[]): void {
    const headers = [
      'Return ID',
      'Order ID',
      'Customer ID',
      'Status',
      'Reason',
      'Items Count',
      'Total Refund',
      'Created Date',
      'Updated Date'
    ];

    const rows = returns.map(returnRequest => [
      returnRequest.id,
      returnRequest.orderId,
      returnRequest.customerId || '',
      returnRequest.status,
      returnRequest.reason,
      returnRequest.items.length.toString(),
      returnRequest.items.reduce((sum, item) => sum + item.refundAmount, 0).toFixed(2),
      new Date(returnRequest.createdAt).toLocaleDateString(),
      returnRequest.updatedAt ? new Date(returnRequest.updatedAt).toLocaleDateString() : ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `returns-report-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Calculate return metrics
   */
  static calculateReturnMetrics(returns: ReturnRequest[]) {
    const total = returns.length;
    const byStatus = returns.reduce((acc, returnRequest) => {
      acc[returnRequest.status] = (acc[returnRequest.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalRefundAmount = returns
      .filter(ret => ret.status === 'refunded')
      .reduce((sum, ret) => {
        return sum + ret.items.reduce((itemSum, item) => itemSum + item.refundAmount, 0);
      }, 0);

    const avgProcessingTime = this.calculateAverageProcessingTime(returns);

    return {
      total,
      pending: byStatus.pending || 0,
      approved: byStatus.approved || 0,
      rejected: byStatus.rejected || 0,
      refunded: byStatus.refunded || 0,
      totalRefundAmount,
      avgProcessingTime
    };
  }

  /**
   * Calculate average return processing time
   */
  private static calculateAverageProcessingTime(returns: ReturnRequest[]): number {
    const processedReturns = returns.filter(ret => 
      ret.status === 'refunded' || ret.status === 'rejected'
    );

    if (processedReturns.length === 0) return 0;

    const totalProcessingTime = processedReturns.reduce((total, ret) => {
      const createdDate = new Date(ret.createdAt);
      const processedDate = ret.updatedAt ? new Date(ret.updatedAt) : new Date();
      
      return total + (processedDate.getTime() - createdDate.getTime());
    }, 0);

    const avgMilliseconds = totalProcessingTime / processedReturns.length;
    return Math.round(avgMilliseconds / (1000 * 60 * 60 * 24)); // Convert to days
  }
}

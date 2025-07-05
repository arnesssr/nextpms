import { Order as BaseOrder } from '@/types';

export interface Order extends BaseOrder {
  shipmentInfo?: ShipmentInfo;
}

export type FulfillmentStatus = 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered';

export type FulfillmentAction = 
  | 'start_processing'
  | 'mark_packed'
  | 'mark_shipped'
  | 'mark_delivered'
  | 'cancel';

export interface ShipmentInfo {
  carrier: string;
  trackingNumber: string;
  shippedAt?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
}

export interface OrderFulfillmentProps {
  onOrderStatusUpdate?: (orderId: string, status: FulfillmentStatus) => void;
  showBulkActions?: boolean;
}

export interface FulfillmentCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, status: FulfillmentStatus, shipmentInfo?: ShipmentInfo) => void;
  onGenerateLabel: (orderId: string) => void;
  onSelect: (orderId: string) => void;
  isSelected: boolean;
  isProcessing: boolean;
}

export interface BulkActionsProps {
  selectedCount: number;
  onBulkAction: (action: FulfillmentAction) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export interface FulfillmentFiltersProps {
  currentStatus?: FulfillmentStatus;
  onStatusChange: (status?: FulfillmentStatus) => void;
}

export interface ShippingLabelProps {
  orderId: string;
  onGenerate: (orderId: string) => void;
  isGenerating?: boolean;
}

export interface FulfillmentMetrics {
  total: number;
  confirmed: number;
  processing: number;
  packed: number;
  shipped: number;
  delivered: number;
  avgProcessingTime: number;
  shippedToday: number;
}

import { Order, OrderFilters } from '@/types';

export interface OrderListProps {
  onCreateOrder?: () => void;
  onEditOrder?: (order: Order) => void;
  onViewOrder?: (order: Order) => void;
  onDeleteOrder?: (orderId: string) => void;
  onFulfillOrder?: (order: Order) => void;
}

export interface OrderCardProps {
  order: Order;
  onEdit?: (order: Order) => void;
  onView?: (order: Order) => void;
  onDelete?: (orderId: string) => void;
  onFulfill?: (order: Order) => void;
}

export interface OrderFiltersProps {
  filters: OrderFilters;
  onFiltersChange: (filters: OrderFilters) => void;
  onReset: () => void;
}

export interface OrderSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export interface OrderStatsProps {
  stats: {
    total_orders: number;
    pending_orders: number;
    processing_orders: number;
    shipped_orders: number;
    delivered_orders: number;
    cancelled_orders: number;
    total_revenue: number;
    average_order_value: number;
  };
}
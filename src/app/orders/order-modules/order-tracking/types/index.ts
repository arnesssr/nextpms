export interface TrackedOrder {
  id: string;
  customerId: string;
  trackingInfo?: TrackingInfo;
  status: TrackingStatus;
  dateOrdered: string;
  lastUpdated?: string;
  trackingUpdates: TrackingUpdate[];
}

export interface TrackingInfo {
  carrier: string;
  trackingNumber: string;
}

export type TrackingStatus = 'pending' | 'in_transit' | 'delivered' | 'returned';

export interface TrackingUpdate {
  date: string;
  status: string;
}

export interface OrderTrackingProps {
  trackedOrders: TrackedOrder[];
}

export interface TrackingCardProps {
  order: TrackedOrder;
}

export interface TrackingFiltersProps {
  status?: TrackingStatus;
  onStatusChange: (status?: TrackingStatus) => void;
}

export interface TrackingReportsProps {
  onExportReport: () => void;
}

import { supabase } from '@/lib/supabaseClient';

// Updated types for inventory management
export interface InventoryItem {
  id: string;
  product_id: string;
  location_id: string;
  location_name: string;
  quantity_on_hand: number;
  quantity_available: number;
  quantity_reserved: number;
  quantity_allocated: number;
  quantity_incoming: number;
  min_stock_level: number;
  max_stock_level?: number;
  reorder_point: number;
  reorder_quantity: number;
  unit_cost: number;
  total_cost: number;
  last_purchase_cost?: number;
  average_cost: number;
  batch_number?: string;
  lot_number?: string;
  expiry_date?: string;
  manufacture_date?: string;
  status: string;
  is_tracked: boolean;
  is_serialized: boolean;
  is_perishable: boolean;
  requires_quality_check: boolean;
  last_movement_date?: string;
  last_movement_type?: string;
  last_counted_date?: string;
  last_counted_by?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  // Product information (from join)
  product_name?: string;
  product_sku?: string;
  product_barcode?: string;
  category_name?: string;
  primary_image_path?: string;
  stock_status?: string;
  inventory_value?: number;
  potential_revenue?: number;
}

export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier: string;
  status: 'pending' | 'approved' | 'shipped' | 'received' | 'cancelled';
  total_amount: number;
  order_date: string;
  expected_delivery: string;
  created_at: string;
  updated_at: string;
}

export interface Adjustment {
  id: string;
  inventory_item_id: string;
  adjustment_type: 'increase' | 'decrease' | 'correction';
  quantity_change: number;
  reason: string;
  reference_number?: string;
  created_at: string;
  created_by: string;
}

export interface LowStockAlert {
  id: string;
  inventory_item_id: string;
  current_quantity: number;
  threshold: number;
  status: 'active' | 'resolved';
  created_at: string;
}

// Inventory Items Service
export const inventoryService = {
  // Get all inventory items
  async getInventoryItems(): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select(`
        *,
        products (
          name,
          sku,
          barcode,
          selling_price,
          cost_price,
          categories (
            name
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get inventory item by ID
  async getInventoryItem(id: string): Promise<InventoryItem | null> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new inventory item
  async createInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(item)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update inventory item
  async updateInventoryItem(id: string, updates: Partial<InventoryItem>): Promise<InventoryItem> {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete inventory item
  async deleteInventoryItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // Search inventory items
  async searchInventoryItems(query: string): Promise<InventoryItem[]> {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .or(`name.ilike.%${query}%,sku.ilike.%${query}%,category.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Purchase Orders Service
export const purchaseOrderService = {
  // Get all purchase orders
  async getPurchaseOrders(): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get purchase order by ID
  async getPurchaseOrder(id: string): Promise<PurchaseOrder | null> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create new purchase order
  async createPurchaseOrder(order: Omit<PurchaseOrder, 'id' | 'created_at' | 'updated_at'>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .insert(order)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update purchase order
  async updatePurchaseOrder(id: string, updates: Partial<PurchaseOrder>): Promise<PurchaseOrder> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get purchase orders by status
  async getPurchaseOrdersByStatus(status: PurchaseOrder['status']): Promise<PurchaseOrder[]> {
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

// Adjustments Service
export const adjustmentsService = {
  // Get all adjustments
  async getAdjustments(): Promise<Adjustment[]> {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Get adjustments for specific inventory item
  async getAdjustmentsByItem(inventoryItemId: string): Promise<Adjustment[]> {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .select('*')
      .eq('inventory_item_id', inventoryItemId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Create new adjustment
  async createAdjustment(adjustment: Omit<Adjustment, 'id' | 'created_at'>): Promise<Adjustment> {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .insert(adjustment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};

// Low Stock Alerts Service
export const lowStockAlertsService = {
  // Get all active low stock alerts
  async getActiveLowStockAlerts(): Promise<LowStockAlert[]> {
    const { data, error } = await supabase
      .from('low_stock_alerts')
      .select(`
        *,
        inventory_items (
          name,
          sku,
          category
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Resolve low stock alert
  async resolveLowStockAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from('low_stock_alerts')
      .update({ status: 'resolved' })
      .eq('id', id);

    if (error) throw error;
  },

  // Check and create low stock alerts
  async checkLowStockItems(): Promise<LowStockAlert[]> {
    // This would typically be handled by a database function or trigger
    // For now, we'll implement it as a client-side check
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .lte('quantity', 'low_stock_threshold');

    if (error) throw error;

    const alerts: LowStockAlert[] = [];
    for (const item of items || []) {
      // Check if alert already exists for this item
      const { data: existingAlert } = await supabase
        .from('low_stock_alerts')
        .select('id')
        .eq('inventory_item_id', item.id)
        .eq('status', 'active')
        .single();

      if (!existingAlert) {
        // Create new alert
        const { data: newAlert, error: alertError } = await supabase
          .from('low_stock_alerts')
          .insert({
            inventory_item_id: item.id,
            current_quantity: item.quantity,
            threshold: item.low_stock_threshold,
            status: 'active'
          })
          .select()
          .single();

        if (alertError) throw alertError;
        if (newAlert) alerts.push(newAlert);
      }
    }

    return alerts;
  }
};

// Reports Service
export const reportsService = {
  // Get inventory summary report
  async getInventorySummary(): Promise<{
    totalItems: number;
    totalValue: number;
    lowStockItems: number;
    categories: { category: string; count: number; value: number }[];
  }> {
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) throw error;

    const totalItems = items?.length || 0;
    const totalValue = items?.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0) || 0;
    const lowStockItems = items?.filter(item => item.quantity <= item.low_stock_threshold).length || 0;

    // Group by category
    const categoryMap = new Map();
    items?.forEach(item => {
      if (!categoryMap.has(item.category)) {
        categoryMap.set(item.category, { count: 0, value: 0 });
      }
      const category = categoryMap.get(item.category);
      category.count += 1;
      category.value += item.quantity * item.unit_price;
    });

    const categories = Array.from(categoryMap.entries()).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value
    }));

    return {
      totalItems,
      totalValue,
      lowStockItems,
      categories
    };
  },

  // Get movement report (adjustments over time)
  async getMovementReport(startDate: string, endDate: string): Promise<Adjustment[]> {
    const { data, error } = await supabase
      .from('inventory_adjustments')
      .select(`
        *,
        inventory_items (
          name,
          sku,
          category
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }
};

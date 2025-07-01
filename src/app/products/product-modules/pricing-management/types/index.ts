// Pricing-related types
export interface ProductPrice {
  id: string;
  product_id: string;
  price_type: PriceType;
  amount: number;
  currency: string;
  cost_price?: number;
  markup_percentage?: number;
  profit_margin?: number;
  is_active: boolean;
  effective_from: string;
  effective_until?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

export interface PriceHistory {
  id: string;
  product_id: string;
  old_price: number;
  new_price: number;
  old_cost_price?: number;
  new_cost_price?: number;
  change_reason: string;
  change_type: PriceChangeType;
  changed_by: string;
  changed_at: string;
  // Optional fields populated by joins
  product_name?: string;
  product_sku?: string;
}

export interface Discount {
  id: string;
  name: string;
  description?: string;
  discount_type: DiscountType;
  value: number; // percentage or fixed amount
  min_quantity?: number;
  max_quantity?: number;
  min_order_value?: number;
  applicable_products?: string[]; // product IDs
  applicable_categories?: string[]; // category IDs
  start_date: string;
  end_date: string;
  is_active: boolean;
  usage_limit?: number;
  used_count: number;
  created_at: string;
  updated_at: string;
}

export interface PricingRule {
  id: string;
  name: string;
  description?: string;
  rule_type: PricingRuleType;
  conditions: PricingCondition[];
  actions: PricingAction[];
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PricingCondition {
  field: string; // 'cost_price', 'category', 'supplier', etc.
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
}

export interface PricingAction {
  action: 'set_markup' | 'set_margin' | 'set_fixed_price' | 'apply_discount';
  value: number;
  unit: 'percentage' | 'fixed' | 'currency';
}

export interface ProfitAnalysis {
  product_id: string;
  product_name: string;
  cost_price: number;
  selling_price: number;
  profit_amount: number;
  profit_margin: number;
  markup_percentage: number;
  revenue_30d?: number;
  units_sold_30d?: number;
}

// Enums
export type PriceType = 
  | 'base_price' 
  | 'wholesale_price' 
  | 'retail_price' 
  | 'promotional_price'
  | 'bulk_price';

export type DiscountType = 
  | 'percentage' 
  | 'fixed_amount' 
  | 'buy_x_get_y' 
  | 'bulk_discount';

export type PriceChangeType = 
  | 'manual_update' 
  | 'cost_change' 
  | 'promotion' 
  | 'bulk_update' 
  | 'automated_rule';

export type PricingRuleType = 
  | 'markup_based' 
  | 'margin_based' 
  | 'competitive_pricing' 
  | 'dynamic_pricing';

// Form types
export interface PriceUpdateRequest {
  product_id: string;
  new_price: number;
  cost_price?: number;
  price_type: PriceType;
  change_reason: string;
  effective_from?: string;
  effective_until?: string;
}

export interface BulkPriceUpdateRequest {
  product_ids: string[];
  update_type: 'percentage' | 'fixed_amount' | 'new_price';
  value: number;
  change_reason: string;
  price_type: PriceType;
  effective_from?: string;
}

export interface DiscountCreateRequest {
  name: string;
  description?: string;
  discount_type: DiscountType;
  value: number;
  min_quantity?: number;
  max_quantity?: number;
  min_order_value?: number;
  applicable_products?: string[];
  applicable_categories?: string[];
  start_date: string;
  end_date: string;
  usage_limit?: number;
}

// API response types
export interface PricingResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PricingAnalyticsResponse {
  total_products: number;
  avg_profit_margin: number;
  total_revenue_potential: number;
  products_with_low_margin: number;
  products_with_high_margin: number;
  recent_price_changes: number;
}

// Saved pricing calculations
export interface SavedPricingCalculation {
  id: string;
  name: string;
  description?: string;
  calculation_type: 'single_product' | 'competitor_analysis' | 'bulk_pricing' | 'break_even';
  input_data: CalculationInputData;
  results: CalculationResults;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_favorite?: boolean;
  tags?: string[];
  product_id?: string; // Optional link to specific product
}

export interface CalculationInputData {
  // Single product inputs
  cost_price?: number;
  target_margin?: number;
  overhead_percentage?: number;
  
  // Competitor analysis inputs
  competitor_price?: number;
  market_position?: 'premium' | 'competitive' | 'value';
  
  // Bulk pricing inputs
  bulk_update_type?: 'margin' | 'markup' | 'cost_plus';
  bulk_value?: number;
  
  // Break-even inputs
  fixed_costs?: number;
  variable_costs?: number;
  
  // Additional context
  product_id?: string;
  product_name?: string;
  calculation_date: string;
}

export interface CalculationResults {
  selling_price: number;
  profit_margin: number;
  markup_percentage: number;
  profit_amount: number;
  break_even_price?: number;
  recommended_price?: number;
  competitor_adjustment?: number;
  total_cost_with_overhead?: number;
  warnings: string[];
  recommendations: string[];
  is_valid_margin: boolean;
}

export interface SaveCalculationRequest {
  name: string;
  description?: string;
  calculation_type: 'single_product' | 'competitor_analysis' | 'bulk_pricing' | 'break_even';
  input_data: CalculationInputData;
  results: CalculationResults;
  is_favorite?: boolean;
  tags?: string[];
  product_id?: string; // Optional link to specific product
}

export interface CalculationComparison {
  id: string;
  name: string;
  comparisons: SavedPricingCalculation[];
  created_at: string;
  created_by: string;
}

// Component props
export interface PriceEditorProps {
  productId: string;
  currentPrice: number;
  costPrice?: number;
  onPriceUpdate: (request: PriceUpdateRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export interface DiscountManagerProps {
  productIds?: string[];
  onDiscountCreate: (discount: DiscountCreateRequest) => void;
  onDiscountUpdate: (id: string, updates: Partial<Discount>) => void;
  onDiscountDelete: (id: string) => void;
}

export interface ProfitMarginIndicatorProps {
  costPrice: number;
  sellingPrice: number;
  targetMargin?: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

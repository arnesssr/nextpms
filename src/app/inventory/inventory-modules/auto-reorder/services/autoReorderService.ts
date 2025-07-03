import { 
  AutoReorderRule,
  AutoReorderRecommendation,
  AutoReorderSettings,
  CreateAutoReorderRuleRequest,
  UpdateAutoReorderRuleRequest,
  AutoReorderFilter,
  AutoReorderSummary,
  ReorderExecution,
  ReorderUrgency
} from '../types/auto-reorder.types';

// API Base URL - adjust according to your backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export class AutoReorderService {
  
  // Transform API response to match AutoReorderRule interface
  private static transformApiResponseToRule(apiRule: any): AutoReorderRule {
    return {
      id: apiRule.id,
      productId: apiRule.product_id || apiRule.productId,
      productName: apiRule.product?.name || apiRule.productName || 'Unknown Product',
      productSku: apiRule.product?.sku || apiRule.productSku || 'N/A',
      supplierId: apiRule.supplier_id || apiRule.supplierId,
      supplierName: apiRule.supplier?.name || apiRule.supplierName || 'Unknown Supplier',
      minimumThreshold: apiRule.minimum_threshold || apiRule.minimumThreshold || 0,
      reorderQuantity: apiRule.reorder_quantity || apiRule.reorderQuantity || 0,
      leadTimeDays: apiRule.lead_time_days || apiRule.leadTimeDays || 7,
      isActive: apiRule.is_active ?? apiRule.isActive ?? true,
      lastTriggered: apiRule.last_triggered ? new Date(apiRule.last_triggered) : undefined,
      createdAt: new Date(apiRule.created_at || apiRule.createdAt),
      updatedAt: new Date(apiRule.updated_at || apiRule.updatedAt),
    };
  }

  // Transform API response to match AutoReorderRecommendation interface
  private static transformApiResponseToRecommendation(apiRec: any): AutoReorderRecommendation {
    return {
      id: apiRec.id,
      productId: apiRec.product_id || apiRec.productId,
      productName: apiRec.product?.name || apiRec.productName || 'Unknown Product',
      productSku: apiRec.product?.sku || apiRec.productSku || 'N/A',
      currentStock: apiRec.current_stock || apiRec.currentStock || 0,
      minimumThreshold: apiRec.minimum_threshold || apiRec.minimumThreshold || 0,
      suggestedOrderQuantity: apiRec.suggested_order_quantity || apiRec.suggestedOrderQuantity || 0,
      supplierId: apiRec.supplier_id || apiRec.supplierId,
      supplierName: apiRec.supplier?.name || apiRec.supplierName,
      unitCost: apiRec.unit_cost || apiRec.unitCost || 0,
      totalCost: apiRec.total_cost || apiRec.totalCost || 0,
      urgencyLevel: apiRec.urgency_level || apiRec.urgencyLevel || ReorderUrgency.LOW,
      daysUntilStockout: apiRec.days_until_stockout || apiRec.daysUntilStockout || 0,
      averageDailyUsage: apiRec.average_daily_usage || apiRec.averageDailyUsage || 0,
      leadTimeDays: apiRec.lead_time_days || apiRec.leadTimeDays || 7,
    };
  }

  // Get all auto reorder rules with optional filtering
  static async getAutoReorderRules(filters?: AutoReorderFilter): Promise<AutoReorderRule[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${API_BASE_URL}/auto-reorder/rules${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch auto reorder rules: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || result || [];
      
      return rawData.map((item: any) => this.transformApiResponseToRule(item));
    } catch (error) {
      console.error('Error fetching auto reorder rules:', error);
      throw error;
    }
  }

  // Get reorder recommendations
  static async getRecommendations(filters?: AutoReorderFilter): Promise<AutoReorderRecommendation[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${API_BASE_URL}/auto-reorder/recommendations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reorder recommendations: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || result || [];
      
      return rawData.map((item: any) => this.transformApiResponseToRecommendation(item));
    } catch (error) {
      console.error('Error fetching reorder recommendations:', error);
      throw error;
    }
  }

  // Generate recommendations based on current stock levels
  static async generateRecommendations(): Promise<AutoReorderRecommendation[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/generate-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to generate recommendations: ${response.statusText}`);
      }
      
      const result = await response.json();
      const rawData = result.data || result || [];
      
      return rawData.map((item: any) => this.transformApiResponseToRecommendation(item));
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  // Create new auto reorder rule
  static async createAutoReorderRule(ruleData: CreateAutoReorderRuleRequest): Promise<AutoReorderRule> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product_id: ruleData.productId,
          supplier_id: ruleData.supplierId,
          minimum_threshold: ruleData.minimumThreshold,
          reorder_quantity: ruleData.reorderQuantity,
          lead_time_days: ruleData.leadTimeDays,
          is_active: ruleData.isActive ?? true
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create auto reorder rule: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToRule(result.data || result);
    } catch (error) {
      console.error('Error creating auto reorder rule:', error);
      throw error;
    }
  }

  // Update existing auto reorder rule
  static async updateAutoReorderRule(ruleData: UpdateAutoReorderRuleRequest): Promise<AutoReorderRule> {
    try {
      const { id, ...updateFields } = ruleData;
      const mappedFields: any = {};
      
      if (updateFields.supplierId !== undefined) {
        mappedFields.supplier_id = updateFields.supplierId;
      }
      if (updateFields.minimumThreshold !== undefined) {
        mappedFields.minimum_threshold = updateFields.minimumThreshold;
      }
      if (updateFields.reorderQuantity !== undefined) {
        mappedFields.reorder_quantity = updateFields.reorderQuantity;
      }
      if (updateFields.leadTimeDays !== undefined) {
        mappedFields.lead_time_days = updateFields.leadTimeDays;
      }
      if (updateFields.isActive !== undefined) {
        mappedFields.is_active = updateFields.isActive;
      }
      
      const response = await fetch(`${API_BASE_URL}/auto-reorder/rules/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mappedFields),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`Failed to update auto reorder rule: ${response.statusText}`);
      }
      
      const result = await response.json();
      return this.transformApiResponseToRule(result.data || result);
    } catch (error) {
      console.error('Error updating auto reorder rule:', error);
      throw error;
    }
  }

  // Delete auto reorder rule
  static async deleteAutoReorderRule(id: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/rules/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete auto reorder rule: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting auto reorder rule:', error);
      throw error;
    }
  }

  // Get auto reorder settings
  static async getSettings(): Promise<AutoReorderSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/settings`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch auto reorder settings: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error fetching auto reorder settings:', error);
      throw error;
    }
  }

  // Update auto reorder settings
  static async updateSettings(settings: Partial<AutoReorderSettings>): Promise<AutoReorderSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update auto reorder settings: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error updating auto reorder settings:', error);
      throw error;
    }
  }

  // Get auto reorder summary/dashboard data
  static async getSummary(): Promise<AutoReorderSummary> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/summary`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch auto reorder summary: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching auto reorder summary:', error);
      throw error;
    }
  }

  // Execute reorder recommendations (create purchase orders)
  static async executeRecommendations(recommendationIds: string[]): Promise<ReorderExecution[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recommendation_ids: recommendationIds
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to execute reorder recommendations: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result || [];
    } catch (error) {
      console.error('Error executing reorder recommendations:', error);
      throw error;
    }
  }

  // Toggle auto reorder globally
  static async toggleGlobalAutoReorder(enabled: boolean): Promise<AutoReorderSettings> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/toggle`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          is_globally_enabled: enabled
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to toggle auto reorder: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result;
    } catch (error) {
      console.error('Error toggling auto reorder:', error);
      throw error;
    }
  }

  // Run auto reorder check manually
  static async runAutoReorderCheck(): Promise<{ message: string; recommendationsGenerated: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auto-reorder/run-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to run auto reorder check: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error running auto reorder check:', error);
      throw error;
    }
  }
}

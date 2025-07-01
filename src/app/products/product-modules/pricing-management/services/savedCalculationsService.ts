import { supabase } from '@/lib/supabaseClient';
import { SaveCalculationRequest, SavedPricingCalculation } from '../types';

export const savedCalculationsService = {
  async saveCalculation(request: SaveCalculationRequest): Promise<SavedPricingCalculation> {
    try {
      // Get current user - fallback to anonymous for development
      let userId = 'anonymous';
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (user && !userError) {
          userId = user.id;
        } else {
          console.log('No authenticated user, using anonymous');
        }
      } catch (authError) {
        console.log('Auth not available, using anonymous');
      }
      
      console.log('Attempting to save calculation:', {
        name: request.name,
        calculation_type: request.calculation_type,
        userId: userId
      });

      const insertData = {
        name: request.name,
        description: request.description || '',
        calculation_type: request.calculation_type,
        input_data: request.input_data,
        results: request.results,
        is_favorite: request.is_favorite || false,
        tags: request.tags || [],
        product_id: request.product_id || null,
        created_by: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Insert data:', insertData);

      const { data, error } = await supabase
        .from('saved_calculations')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error('Supabase error saving calculation:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Successfully saved calculation:', data);
      return data;
    } catch (error) {
      console.error('Error saving calculation:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to save calculation');
    }
  },

  // Get saved calculations for current user
  async getSavedCalculations(): Promise<SavedPricingCalculation[]> {
    try {
      console.log('🔍 Getting saved calculations...');
      
      // Get current user - fallback to anonymous for development
      let userId = 'anonymous';
      
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (user && !userError) {
          userId = user.id;
          console.log('👤 User found:', userId);
        } else {
          console.log('👤 No authenticated user, using anonymous');
        }
      } catch (authError) {
        console.log('👤 Auth not available, using anonymous');
      }

      console.log('🗄️ Querying saved_calculations table for user:', userId);
      
      const { data, error } = await supabase
        .from('saved_calculations')
        .select('*')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Database error fetching saved calculations:', error);
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        return [];
      }

      console.log('✅ Successfully fetched calculations:', data?.length || 0, 'items');
      console.log('📄 Raw data:', data);
      
      return data || [];
    } catch (error) {
      console.error('💥 Exception fetching saved calculations:', error);
      return [];
    }
  },

  // Delete a saved calculation
  async deleteCalculation(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_calculations')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting calculation:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting calculation:', error);
      return false;
    }
  }
};

export default savedCalculationsService;

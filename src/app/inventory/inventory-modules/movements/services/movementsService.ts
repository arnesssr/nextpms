import { 
  Movement, 
  CreateMovementRequest, 
  MovementFilter, 
  MovementSummary,
  MovementsByProduct,
  BulkMovementRequest,
  MovementType,
  MovementReason
} from '../types/movements.types';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

class MovementsService {
  private apiUrl = `${API_BASE_URL}/movements`;

  async getMovements(filter?: MovementFilter): Promise<Movement[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movements: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching movements:', error);
      throw error;
    }
  }

  async getMovementById(id: string): Promise<Movement | null> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movement: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching movement by ID:', error);
      throw error;
    }
  }

  async createMovement(request: CreateMovementRequest): Promise<Movement> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create movement: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating movement:', error);
      throw error;
    }
  }

  async createBulkMovements(request: BulkMovementRequest): Promise<Movement[]> {
    try {
      const response = await fetch(`${this.apiUrl}/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to create bulk movements: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error creating bulk movements:', error);
      throw error;
    }
  }

  async getMovementSummary(filter?: MovementFilter): Promise<MovementSummary> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movement summary: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching movement summary:', error);
      throw error;
    }
  }

  async getMovementsByProduct(filter?: MovementFilter): Promise<MovementsByProduct[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            queryParams.append(key, value.toString());
          }
        });
      }
      
      const url = `${this.apiUrl}/by-product${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch movements by product: ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error fetching movements by product:', error);
      throw error;
    }
  }

  async deleteMovement(id: string): Promise<void> {
    try {
      const response = await fetch(`${this.apiUrl}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete movement: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error deleting movement:', error);
      throw error;
    }
  }
}

export const movementsService = new MovementsService();

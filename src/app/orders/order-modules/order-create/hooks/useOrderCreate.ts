import { useState, useCallback } from 'react';
import { CreateOrderRequest, OrderItem, Customer, Product } from '../types';

export const useOrderCreate = () => {
  const [orderData, setOrderData] = useState<CreateOrderRequest>({
    customerId: '',
    items: [],
    shippingAddress: '',
    paymentMethod: '',
    notes: ''
  });
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchingCustomers, setSearchingCustomers] = useState(false);
  const [searchingProducts, setSearchingProducts] = useState(false);

  const searchCustomers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setCustomers([]);
      return;
    }

    try {
      setSearchingCustomers(true);
      const response = await fetch(`/api/customers/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search customers');
      }

      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
      }
    } catch (err) {
      console.error('Error searching customers:', err);
      setCustomers([]);
    } finally {
      setSearchingCustomers(false);
    }
  }, []);

  const searchProducts = useCallback(async (query: string) => {
    if (!query.trim()) {
      setProducts([]);
      return;
    }

    try {
      setSearchingProducts(true);
      const response = await fetch(`/api/products/search?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search products');
      }

      const result = await response.json();
      
      if (result.success) {
        setProducts(result.data);
      }
    } catch (err) {
      console.error('Error searching products:', err);
      setProducts([]);
    } finally {
      setSearchingProducts(false);
    }
  }, []);

  const addItem = useCallback((product: Product, quantity: number = 1) => {
    const existingItemIndex = items.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      setItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity
      };
      setItems([...items, newItem]);
    }
  }, [items]);

  const updateItem = useCallback((index: number, updates: Partial<OrderItem>) => {
    const updatedItems = [...items];
    updatedItems[index] = {
      ...updatedItems[index],
      ...updates,
      total: (updates.unitPrice || updatedItems[index].unitPrice) * 
             (updates.quantity || updatedItems[index].quantity)
    };
    setItems(updatedItems);
  }, [items]);

  const removeItem = useCallback((index: number) => {
    setItems(items.filter((_, i) => i !== index));
  }, [items]);

  const calculateTotal = useCallback(() => {
    return items.reduce((sum, item) => sum + item.total, 0);
  }, [items]);

  const updateOrderData = useCallback((updates: Partial<CreateOrderRequest>) => {
    setOrderData(prev => ({ ...prev, ...updates }));
  }, []);

  const validateOrder = useCallback((): string[] => {
    const errors: string[] = [];

    if (!orderData.customerId) {
      errors.push('Customer is required');
    }

    if (items.length === 0) {
      errors.push('At least one item is required');
    }

    if (!orderData.shippingAddress?.trim()) {
      errors.push('Shipping address is required');
    }

    if (!orderData.paymentMethod) {
      errors.push('Payment method is required');
    }

    items.forEach((item, index) => {
      if (item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
      }
      if (item.unitPrice <= 0) {
        errors.push(`Item ${index + 1}: Unit price must be greater than 0`);
      }
    });

    return errors;
  }, [orderData, items]);

  const createOrder = useCallback(async (): Promise<{ success: boolean; orderId?: string; message?: string }> => {
    const validationErrors = validateOrder();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return { success: false, message: validationErrors.join(', ') };
    }

    try {
      setLoading(true);
      setError(null);

      const orderRequest = {
        ...orderData,
        items,
        total: calculateTotal()
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderRequest),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      const result = await response.json();

      if (result.success) {
        // Reset form
        setOrderData({
          customerId: '',
          items: [],
          shippingAddress: '',
          paymentMethod: '',
          notes: ''
        });
        setItems([]);
        
        return { success: true, orderId: result.data.id };
      } else {
        throw new Error(result.message || 'Failed to create order');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [orderData, items, validateOrder, calculateTotal]);

  const resetForm = useCallback(() => {
    setOrderData({
      customerId: '',
      items: [],
      shippingAddress: '',
      paymentMethod: '',
      notes: ''
    });
    setItems([]);
    setError(null);
    setCustomers([]);
    setProducts([]);
  }, []);

  return {
    orderData,
    items,
    loading,
    error,
    customers,
    products,
    searchingCustomers,
    searchingProducts,
    searchCustomers,
    searchProducts,
    addItem,
    updateItem,
    removeItem,
    calculateTotal,
    updateOrderData,
    validateOrder,
    createOrder,
    resetForm
  };
};

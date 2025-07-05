import {
  CreateSupplierOrderRequest,
  SupplierOrder,
  SupplierOrderFilters,
  SupplierOrderStats,
  SupplierOrderSummary,
  SupplierOrdersResponse,
  UpdateSupplierOrderRequest
} from '../types';

// Mock data for supplier orders
const supplierOrders: SupplierOrder[] = [
  {
    id: 'order_001',
    orderNumber: 'PO-2025-001',
    supplierId: 'sup_001',
    supplierName: 'Acme Supplies',
    orderDate: new Date('2025-05-15'),
    expectedDeliveryDate: new Date('2025-05-25'),
    actualDeliveryDate: new Date('2025-05-24'),
    status: 'delivered',
    items: [
      {
        id: 'item_001',
        productId: 'prod_001',
        productName: 'Widget A',
        sku: 'WA-001',
        quantity: 100,
        unitPrice: 10.5,
        totalPrice: 1050,
        expectedDeliveryDate: new Date('2025-05-25'),
        actualDeliveryDate: new Date('2025-05-24'),
        status: 'delivered',
        notes: 'Standard quality check required'
      },
      {
        id: 'item_002',
        productId: 'prod_002',
        productName: 'Widget B',
        sku: 'WB-002',
        quantity: 50,
        unitPrice: 15.75,
        totalPrice: 787.5,
        expectedDeliveryDate: new Date('2025-05-25'),
        actualDeliveryDate: new Date('2025-05-24'),
        status: 'delivered',
        notes: 'Premium packaging'
      }
    ],
    subtotal: 1837.5,
    taxAmount: 147,
    shippingCost: 75,
    discountAmount: 50,
    totalAmount: 2009.5,
    paymentTerms: 'Net 30',
    paymentStatus: 'paid',
    paymentDueDate: new Date('2025-06-24'),
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    trackingNumber: 'TRK123456789',
    shippingMethod: 'Ground',
    notes: 'Regular quarterly order',
    attachments: ['https://example.com/po-2025-001.pdf'],
    createdBy: 'user_001',
    createdAt: new Date('2025-05-15'),
    updatedAt: new Date('2025-05-24')
  },
  {
    id: 'order_002',
    orderNumber: 'PO-2025-002',
    supplierId: 'sup_002',
    supplierName: 'Global Manufacturing',
    orderDate: new Date('2025-05-20'),
    expectedDeliveryDate: new Date('2025-06-05'),
    status: 'confirmed',
    items: [
      {
        id: 'item_003',
        productId: 'prod_003',
        productName: 'Component X',
        sku: 'CX-003',
        quantity: 200,
        unitPrice: 5.25,
        totalPrice: 1050,
        expectedDeliveryDate: new Date('2025-06-05'),
        status: 'pending',
        notes: 'Bulk order'
      },
      {
        id: 'item_004',
        productId: 'prod_004',
        productName: 'Component Y',
        sku: 'CY-004',
        quantity: 150,
        unitPrice: 7.5,
        totalPrice: 1125,
        expectedDeliveryDate: new Date('2025-06-05'),
        status: 'pending'
      }
    ],
    subtotal: 2175,
    taxAmount: 174,
    shippingCost: 120,
    discountAmount: 100,
    totalAmount: 2369,
    paymentTerms: 'Net 45',
    paymentStatus: 'pending',
    paymentDueDate: new Date('2025-07-20'),
    shippingAddress: {
      street: '456 Oak Ave',
      city: 'Somewhere',
      state: 'NY',
      zipCode: '54321',
      country: 'USA'
    },
    shippingMethod: 'Express',
    notes: 'Urgent production materials',
    createdBy: 'user_002',
    createdAt: new Date('2025-05-20'),
    updatedAt: new Date('2025-05-22')
  },
  {
    id: 'order_003',
    orderNumber: 'PO-2025-003',
    supplierId: 'sup_003',
    supplierName: 'Tech Components Inc',
    orderDate: new Date('2025-06-01'),
    expectedDeliveryDate: new Date('2025-06-15'),
    status: 'submitted',
    items: [
      {
        id: 'item_005',
        productId: 'prod_005',
        productName: 'Circuit Board A',
        sku: 'CBA-005',
        quantity: 50,
        unitPrice: 45,
        totalPrice: 2250,
        expectedDeliveryDate: new Date('2025-06-15'),
        status: 'pending'
      }
    ],
    subtotal: 2250,
    taxAmount: 180,
    shippingCost: 95,
    discountAmount: 0,
    totalAmount: 2525,
    paymentTerms: 'Net 30',
    paymentStatus: 'pending',
    paymentDueDate: new Date('2025-07-15'),
    shippingAddress: {
      street: '789 Tech Blvd',
      city: 'Techville',
      state: 'CA',
      zipCode: '98765',
      country: 'USA'
    },
    notes: 'Special handling required',
    createdBy: 'user_001',
    createdAt: new Date('2025-06-01'),
    updatedAt: new Date('2025-06-01')
  },
  {
    id: 'order_004',
    orderNumber: 'PO-2025-004',
    supplierId: 'sup_001',
    supplierName: 'Acme Supplies',
    orderDate: new Date('2025-06-05'),
    expectedDeliveryDate: new Date('2025-06-20'),
    status: 'draft',
    items: [
      {
        id: 'item_006',
        productId: 'prod_001',
        productName: 'Widget A',
        sku: 'WA-001',
        quantity: 75,
        unitPrice: 10.5,
        totalPrice: 787.5,
        expectedDeliveryDate: new Date('2025-06-20'),
        status: 'pending'
      },
      {
        id: 'item_007',
        productId: 'prod_006',
        productName: 'Widget C',
        sku: 'WC-006',
        quantity: 40,
        unitPrice: 12.25,
        totalPrice: 490,
        expectedDeliveryDate: new Date('2025-06-20'),
        status: 'pending'
      }
    ],
    subtotal: 1277.5,
    taxAmount: 102.2,
    shippingCost: 65,
    discountAmount: 25,
    totalAmount: 1419.7,
    paymentTerms: 'Net 30',
    paymentStatus: 'pending',
    paymentDueDate: new Date('2025-07-20'),
    shippingAddress: {
      street: '123 Main St',
      city: 'Anytown',
      state: 'CA',
      zipCode: '12345',
      country: 'USA'
    },
    shippingMethod: 'Ground',
    notes: 'Draft order - pending approval',
    createdBy: 'user_003',
    createdAt: new Date('2025-06-05'),
    updatedAt: new Date('2025-06-05')
  },
  {
    id: 'order_005',
    orderNumber: 'PO-2025-005',
    supplierId: 'sup_004',
    supplierName: 'Quality Parts Ltd',
    orderDate: new Date('2025-05-10'),
    expectedDeliveryDate: new Date('2025-05-30'),
    actualDeliveryDate: new Date('2025-06-02'),
    status: 'delivered',
    items: [
      {
        id: 'item_008',
        productId: 'prod_007',
        productName: 'Precision Gear',
        sku: 'PG-007',
        quantity: 100,
        unitPrice: 8.75,
        totalPrice: 875,
        expectedDeliveryDate: new Date('2025-05-30'),
        actualDeliveryDate: new Date('2025-06-02'),
        status: 'delivered',
        notes: 'Delayed due to quality inspection'
      },
      {
        id: 'item_009',
        productId: 'prod_008',
        productName: 'Mounting Bracket',
        sku: 'MB-008',
        quantity: 200,
        unitPrice: 3.5,
        totalPrice: 700,
        expectedDeliveryDate: new Date('2025-05-30'),
        actualDeliveryDate: new Date('2025-06-02'),
        status: 'delivered'
      }
    ],
    subtotal: 1575,
    taxAmount: 126,
    shippingCost: 85,
    discountAmount: 0,
    totalAmount: 1786,
    paymentTerms: 'Net 15',
    paymentStatus: 'paid',
    paymentDueDate: new Date('2025-06-17'),
    shippingAddress: {
      street: '555 Industrial Way',
      city: 'Factorytown',
      state: 'MI',
      zipCode: '45678',
      country: 'USA'
    },
    trackingNumber: 'TRK987654321',
    shippingMethod: 'Standard',
    notes: 'Delivered 3 days late',
    attachments: ['https://example.com/po-2025-005.pdf', 'https://example.com/quality-report-005.pdf'],
    createdBy: 'user_002',
    createdAt: new Date('2025-05-10'),
    updatedAt: new Date('2025-06-02')
  }
];

// Generate order summaries from full orders
const supplierOrderSummaries: SupplierOrderSummary[] = supplierOrders.map(order => ({
  id: order.id,
  orderNumber: order.orderNumber,
  supplierId: order.supplierId,
  supplierName: order.supplierName,
  orderDate: order.orderDate,
  expectedDeliveryDate: order.expectedDeliveryDate,
  status: order.status,
  totalAmount: order.totalAmount,
  itemCount: order.items.length,
  paymentStatus: order.paymentStatus
}));

// Calculate order stats
const calculateOrderStats = (): SupplierOrderStats => {
  const stats: SupplierOrderStats = {
    total: supplierOrders.length,
    draft: supplierOrders.filter(o => o.status === 'draft').length,
    submitted: supplierOrders.filter(o => o.status === 'submitted').length,
    confirmed: supplierOrders.filter(o => o.status === 'confirmed').length,
    shipped: supplierOrders.filter(o => o.status === 'shipped').length,
    delivered: supplierOrders.filter(o => o.status === 'delivered').length,
    cancelled: supplierOrders.filter(o => o.status === 'cancelled').length,
    partiallyDelivered: supplierOrders.filter(o => o.status === 'partially_delivered').length,
    totalValue: supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0),
    averageOrderValue: supplierOrders.reduce((sum, order) => sum + order.totalAmount, 0) / supplierOrders.length,
    pendingPayment: supplierOrders.filter(o => o.paymentStatus === 'pending').length,
    pendingPaymentValue: supplierOrders
      .filter(o => o.paymentStatus === 'pending')
      .reduce((sum, order) => sum + order.totalAmount, 0)
  };
  return stats;
};

// Service functions
export const getSupplierOrders = async (filters?: SupplierOrderFilters): Promise<SupplierOrdersResponse> => {
  // Simulate API call with filtering
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...supplierOrderSummaries];
      
      if (filters) {
        if (filters.supplierId) {
          filtered = filtered.filter(o => o.supplierId === filters.supplierId);
        }
        if (filters.status) {
          filtered = filtered.filter(o => o.status === filters.status);
        }
        if (filters.paymentStatus) {
          filtered = filtered.filter(o => o.paymentStatus === filters.paymentStatus);
        }
        if (filters.startDate) {
          filtered = filtered.filter(o => o.orderDate >= filters.startDate!);
        }
        if (filters.endDate) {
          filtered = filtered.filter(o => o.orderDate <= filters.endDate!);
        }
        if (filters.minAmount !== undefined) {
          filtered = filtered.filter(o => o.totalAmount >= filters.minAmount!);
        }
        if (filters.maxAmount !== undefined) {
          filtered = filtered.filter(o => o.totalAmount <= filters.maxAmount!);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filtered = filtered.filter(o => 
            o.orderNumber.toLowerCase().includes(searchLower) || 
            o.supplierName.toLowerCase().includes(searchLower)
          );
        }
      }
      
      const stats = calculateOrderStats();
      
      resolve({
        orders: filtered,
        pagination: {
          page: 1,
          limit: 10,
          total: filtered.length,
          totalPages: Math.ceil(filtered.length / 10)
        },
        stats
      });
    }, 500);
  });
};

export const getSupplierOrder = async (orderId: string): Promise<SupplierOrder | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const order = supplierOrders.find(o => o.id === orderId);
      resolve(order || null);
    }, 500);
  });
};

export const createSupplierOrder = async (orderData: CreateSupplierOrderRequest): Promise<SupplierOrder> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Find supplier name
      const supplierName = supplierOrders.find(o => o.supplierId === orderData.supplierId)?.supplierName || 'Unknown Supplier';
      
      // Generate new order
      const newOrder: SupplierOrder = {
        id: `order_${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        orderNumber: `PO-2025-${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
        supplierId: orderData.supplierId,
        supplierName,
        orderDate: new Date(),
        expectedDeliveryDate: orderData.expectedDeliveryDate,
        status: 'draft',
        items: orderData.items.map((item, index) => ({
          id: `item_${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
          productId: item.productId,
          productName: `Product ${item.productId}`, // Mock product name
          sku: `SKU-${item.productId}`, // Mock SKU
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          expectedDeliveryDate: item.expectedDeliveryDate || orderData.expectedDeliveryDate,
          status: 'pending',
          notes: item.notes
        })),
        subtotal: orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0),
        taxAmount: orderData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0) * 0.08, // Mock 8% tax
        shippingCost: 75, // Mock shipping cost
        discountAmount: 0,
        totalAmount: 0, // Will be calculated below
        paymentTerms: orderData.paymentTerms || 'Net 30',
        paymentStatus: 'pending',
        paymentDueDate: orderData.paymentDueDate || new Date(new Date().setDate(new Date().getDate() + 30)),
        shippingAddress: orderData.shippingAddress || {
          street: '123 Default St',
          city: 'Default City',
          state: 'DC',
          zipCode: '00000',
          country: 'USA'
        },
        shippingMethod: orderData.shippingMethod,
        notes: orderData.notes,
        attachments: orderData.attachments,
        createdBy: 'user_001', // Mock user ID
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Calculate total amount
      newOrder.totalAmount = newOrder.subtotal + newOrder.taxAmount + newOrder.shippingCost - newOrder.discountAmount;
      
      // Add to mock data
      supplierOrders.push(newOrder);
      supplierOrderSummaries.push({
        id: newOrder.id,
        orderNumber: newOrder.orderNumber,
        supplierId: newOrder.supplierId,
        supplierName: newOrder.supplierName,
        orderDate: newOrder.orderDate,
        expectedDeliveryDate: newOrder.expectedDeliveryDate,
        status: newOrder.status,
        totalAmount: newOrder.totalAmount,
        itemCount: newOrder.items.length,
        paymentStatus: newOrder.paymentStatus
      });
      
      resolve(newOrder);
    }, 500);
  });
};

export const updateSupplierOrder = async (orderId: string, orderData: UpdateSupplierOrderRequest): Promise<SupplierOrder | null> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = supplierOrders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        resolve(null);
        return;
      }
      
      const order = { ...supplierOrders[orderIndex] };
      
      // Update fields
      if (orderData.expectedDeliveryDate) order.expectedDeliveryDate = orderData.expectedDeliveryDate;
      if (orderData.status) order.status = orderData.status;
      if (orderData.paymentTerms) order.paymentTerms = orderData.paymentTerms;
      if (orderData.paymentStatus) order.paymentStatus = orderData.paymentStatus;
      if (orderData.paymentDueDate) order.paymentDueDate = orderData.paymentDueDate;
      if (orderData.shippingAddress) order.shippingAddress = orderData.shippingAddress;
      if (orderData.trackingNumber) order.trackingNumber = orderData.trackingNumber;
      if (orderData.shippingMethod) order.shippingMethod = orderData.shippingMethod;
      if (orderData.notes) order.notes = orderData.notes;
      if (orderData.attachments) order.attachments = orderData.attachments;
      
      // Update items if provided
      if (orderData.items) {
        // Handle existing items (update or remove)
        const updatedItems = order.items.filter(item => {
          const updatedItem = orderData.items!.find(i => i.id === item.id);
          return !!updatedItem; // Keep only items that exist in the update
        }).map(item => {
          const updatedItem = orderData.items!.find(i => i.id === item.id);
          if (updatedItem) {
            return {
              ...item,
              quantity: updatedItem.quantity || item.quantity,
              unitPrice: updatedItem.unitPrice || item.unitPrice,
              totalPrice: (updatedItem.quantity || item.quantity) * (updatedItem.unitPrice || item.unitPrice),
              expectedDeliveryDate: updatedItem.expectedDeliveryDate || item.expectedDeliveryDate,
              notes: updatedItem.notes !== undefined ? updatedItem.notes : item.notes
            };
          }
          return item;
        });
        
        // Add new items
        const newItems = orderData.items
          .filter(item => !item.id) // Items without ID are new
          .map(item => ({
            id: `item_${Math.floor(Math.random() * 10000).toString().padStart(3, '0')}`,
            productId: item.productId,
            productName: `Product ${item.productId}`, // Mock product name
            sku: `SKU-${item.productId}`, // Mock SKU
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.quantity * item.unitPrice,
            expectedDeliveryDate: item.expectedDeliveryDate || order.expectedDeliveryDate,
            status: 'pending',
            notes: item.notes
          }));
        
        order.items = [...updatedItems, ...newItems];
        
        // Recalculate totals
        order.subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
        order.taxAmount = order.subtotal * 0.08; // Mock 8% tax
        order.totalAmount = order.subtotal + order.taxAmount + order.shippingCost - order.discountAmount;
      }
      
      order.updatedAt = new Date();
      
      // Update in mock data
      supplierOrders[orderIndex] = order;
      
      // Update summary
      const summaryIndex = supplierOrderSummaries.findIndex(o => o.id === orderId);
      if (summaryIndex !== -1) {
        supplierOrderSummaries[summaryIndex] = {
          id: order.id,
          orderNumber: order.orderNumber,
          supplierId: order.supplierId,
          supplierName: order.supplierName,
          orderDate: order.orderDate,
          expectedDeliveryDate: order.expectedDeliveryDate,
          status: order.status,
          totalAmount: order.totalAmount,
          itemCount: order.items.length,
          paymentStatus: order.paymentStatus
        };
      }
      
      resolve(order);
    }, 500);
  });
};

export const deleteSupplierOrder = async (orderId: string): Promise<boolean> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const orderIndex = supplierOrders.findIndex(o => o.id === orderId);
      if (orderIndex === -1) {
        resolve(false);
        return;
      }
      
      // Remove from mock data
      supplierOrders.splice(orderIndex, 1);
      
      // Remove from summaries
      const summaryIndex = supplierOrderSummaries.findIndex(o => o.id === orderId);
      if (summaryIndex !== -1) {
        supplierOrderSummaries.splice(summaryIndex, 1);
      }
      
      resolve(true);
    }, 500);
  });
};
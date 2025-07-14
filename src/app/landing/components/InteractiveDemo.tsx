'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Warehouse,
  Plus,
  Minus,
  Check,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface Order {
  id: string;
  customer: string;
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
}

export const InteractiveDemo = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'analytics'>('inventory');
  const [products, setProducts] = useState<Product[]>([
    { id: '1', name: 'Wireless Headphones', stock: 45, price: 99.99, status: 'in-stock' },
    { id: '2', name: 'Smart Watch', stock: 8, price: 299.99, status: 'low-stock' },
    { id: '3', name: 'Laptop Stand', stock: 0, price: 49.99, status: 'out-of-stock' },
    { id: '4', name: 'USB-C Cable', stock: 120, price: 19.99, status: 'in-stock' },
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: 'ORD-001', customer: 'John Doe', items: 3, total: 149.97, status: 'pending' },
    { id: 'ORD-002', customer: 'Jane Smith', items: 1, total: 299.99, status: 'processing' },
    { id: 'ORD-003', customer: 'Bob Johnson', items: 2, total: 119.98, status: 'shipped' },
    { id: 'ORD-004', customer: 'Alice Brown', items: 1, total: 99.99, status: 'delivered' },
  ]);

  const [stats, setStats] = useState({
    totalProducts: 4,
    totalOrders: 4,
    revenue: 669.93,
    lowStockItems: 1
  });

  const updateStock = (productId: string, change: number) => {
    setProducts(prev => prev.map(product => {
      if (product.id === productId) {
        const newStock = Math.max(0, product.stock + change);
        let status: Product['status'] = 'in-stock';
        if (newStock === 0) status = 'out-of-stock';
        else if (newStock < 10) status = 'low-stock';
        
        return { ...product, stock: newStock, status };
      }
      return product;
    }));
  };

  const processOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        const statusFlow: Record<Order['status'], Order['status']> = {
          'pending': 'processing',
          'processing': 'shipped',
          'shipped': 'delivered',
          'delivered': 'delivered'
        };
        return { ...order, status: statusFlow[order.status] };
      }
      return order;
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'low-stock': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'out-of-stock': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const tabs = [
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
  ];

  return (
    <div className="bg-gradient-to-br from-gray-900 to-black border border-green-500/20 rounded-2xl p-6 shadow-2xl max-w-4xl mx-auto">
      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-6 bg-gray-800/50 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-green-500/20 text-green-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'inventory' && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Inventory Management</h3>
            {products.map((product) => (
              <motion.div
                key={product.id}
                layout
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-400">${product.price}</div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <Badge className={getStatusColor(product.status)}>
                    {product.status.replace('-', ' ')}
                  </Badge>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(product.id, -1)}
                      disabled={product.stock === 0}
                      className="w-8 h-8 p-0"
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    
                    <span className="w-12 text-center font-mono">
                      {product.stock}
                    </span>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateStock(product.id, 1)}
                      className="w-8 h-8 p-0"
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold mb-4">Order Processing</h3>
            {orders.map((order) => (
              <motion.div
                key={order.id}
                layout
                className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg"
              >
                <div className="flex-1">
                  <div className="font-medium">{order.id}</div>
                  <div className="text-sm text-gray-400">
                    {order.customer} • {order.items} items
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">${order.total.toFixed(2)}</div>
                  </div>
                  
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  
                  {order.status !== 'delivered' && (
                    <Button
                      size="sm"
                      onClick={() => processOrder(order.id)}
                      className="bg-green-500/20 text-green-400 hover:bg-green-500/30"
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Process
                    </Button>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            key="analytics"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-lg font-semibold mb-4">Real-time Analytics</h3>
            
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Products', value: stats.totalProducts, icon: Package },
                { label: 'Active Orders', value: stats.totalOrders, icon: ShoppingCart },
                { label: 'Revenue', value: `$${stats.revenue.toFixed(2)}`, icon: TrendingUp },
                { label: 'Low Stock', value: stats.lowStockItems, icon: AlertCircle },
              ].map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gray-800/30 rounded-lg p-4"
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <Icon className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-gray-400">{stat.label}</span>
                    </div>
                    <div className="text-2xl font-bold">{stat.value}</div>
                  </motion.div>
                );
              })}
            </div>
            
            {/* Chart Visualization */}
            <div className="bg-gray-800/30 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-4">Sales Trend</h4>
              <div className="h-32 flex items-end justify-between space-x-2">
                {[65, 45, 80, 55, 90, 70, 85].map((height, index) => (
                  <motion.div
                    key={index}
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                    className="bg-gradient-to-t from-green-400 to-emerald-600 flex-1 rounded-t"
                  />
                ))}
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <span key={day}>{day}</span>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
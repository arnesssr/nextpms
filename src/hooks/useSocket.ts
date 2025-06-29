'use client';

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { InventoryUpdateEvent, OrderStatusEvent, SystemAlert } from '@/types';

interface UseSocketProps {
  onInventoryUpdate?: (data: InventoryUpdateEvent) => void;
  onOrderStatus?: (data: OrderStatusEvent) => void;
  onSystemAlert?: (data: SystemAlert) => void;
}

export const useSocket = ({ 
  onInventoryUpdate, 
  onOrderStatus, 
  onSystemAlert 
}: UseSocketProps = {}) => {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);

  // Initialize socket connection
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SOCKET_URL) {
      console.warn('Socket URL not configured');
      return;
    }

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      path: '/socket.io',
      auth: {
        token: process.env.NEXT_PUBLIC_API_KEY
      },
      transports: ['websocket', 'polling']
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      isConnectedRef.current = true;
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      isConnectedRef.current = false;
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    // Business logic events
    socket.on('inventory_update', (data: InventoryUpdateEvent) => {
      onInventoryUpdate?.(data);
    });

    socket.on('order_status', (data: OrderStatusEvent) => {
      onOrderStatus?.(data);
    });

    socket.on('system_alert', (data: SystemAlert) => {
      onSystemAlert?.(data);
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    };
  }, [onInventoryUpdate, onOrderStatus, onSystemAlert]);

  // Subscribe to inventory updates for a specific product
  const subscribeToInventory = useCallback((productId: string) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('subscribe_inventory', productId);
    }
  }, []);

  // Subscribe to order updates
  const subscribeToOrder = useCallback((orderId: string) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('subscribe_order', orderId);
    }
  }, []);

  // Unsubscribe from inventory updates
  const unsubscribeFromInventory = useCallback((productId: string) => {
    if (socketRef.current && isConnectedRef.current) {
      socketRef.current.emit('unsubscribe_inventory', productId);
    }
  }, []);

  // Check if socket is connected
  const isConnected = () => isConnectedRef.current;

  return {
    socket: socketRef.current,
    isConnected,
    subscribeToInventory,
    subscribeToOrder,
    unsubscribeFromInventory,
  };
};

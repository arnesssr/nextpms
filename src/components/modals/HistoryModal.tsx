'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Package } from 'lucide-react';
import { InventoryItem } from '@/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}

interface StockHistory {
  date: string;
  action: string;
  quantityChanged: number;
  newQuantity: number;
  user: string;
}

export function HistoryModal({ isOpen, onClose, item }: HistoryModalProps) {
  const [history, setHistory] = useState<StockHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;

    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching history for item:', item.id);
        const response = await fetch(`/api/inventory/${item.id}/history`);
        
        // Check if response is ok
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Check content type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Non-JSON response:', text);
          throw new Error('Server returned non-JSON response');
        }
        
        const data = await response.json();
        console.log('History API response:', data);
        
        if (data.success && data.history) {
          setHistory(data.history);
        } else {
          throw new Error(data.error || 'Failed to fetch history');
        }
      } catch (error) {
        console.error('Error fetching history:', error);
        if (error instanceof Error) {
          if (error.message.includes('JSON.parse')) {
            setError('Server returned invalid response. Please try again.');
          } else {
            setError(error.message);
          }
        } else {
          setError('Failed to fetch history');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [item]);

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Stock History for {item.product?.name}</span>
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400" />
            <span className="ml-2">Loading history...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-10">
            <AlertTriangle className="text-red-500 h-6 w-6 mr-2" />
            <span className="text-red-500">{error}</span>
          </div>
        ) : history.length === 0 ? (
          <div className="py-10 text-center text-gray-600">
            No history records available.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Quantity Changed</TableHead>
                <TableHead>New Quantity</TableHead>
                <TableHead>Handled By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((record, index) => (
                <TableRow key={index}>
                  <TableCell>{new Date(record.date).toLocaleString()}</TableCell>
                  <TableCell>{record.action}</TableCell>
                  <TableCell>{record.quantityChanged}</TableCell>
                  <TableCell>{record.newQuantity}</TableCell>
                  <TableCell>{record.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


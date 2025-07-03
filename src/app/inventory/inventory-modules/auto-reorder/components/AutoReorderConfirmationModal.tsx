'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Package, ShoppingCart, TrendingDown, CheckCircle, X } from 'lucide-react';

interface LowStockItem {
  id: string;
  productName: string;
  productSku: string;
  currentStock: number;
  lowStockThreshold: number;
  location: string;
  suggestedOrderQuantity?: number;
  urgencyLevel: 'critical' | 'low' | 'moderate';
}

interface AutoReorderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lowStockItems: LowStockItem[];
  onConfirm: (selectedItems: string[]) => void;
  onCancel: () => void;
}

export function AutoReorderConfirmationModal({ 
  isOpen, 
  onClose, 
  lowStockItems, 
  onConfirm, 
  onCancel 
}: AutoReorderConfirmationModalProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(
    lowStockItems.map(item => item.id)
  );

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === lowStockItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(lowStockItems.map(item => item.id));
    }
  };

  const handleConfirm = () => {
    onConfirm(selectedItems);
    onClose();
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'moderate': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStockProgress = (item: LowStockItem) => {
    const maxStock = item.lowStockThreshold * 3; // Assume 3x threshold is "full"
    return Math.min((item.currentStock / maxStock) * 100, 100);
  };

  const criticalItems = lowStockItems.filter(item => item.urgencyLevel === 'critical').length;
  const moderateItems = lowStockItems.filter(item => item.urgencyLevel === 'moderate').length;
  const lowItems = lowStockItems.filter(item => item.urgencyLevel === 'low').length;

  const selectedCount = selectedItems.length;
  const totalItems = lowStockItems.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span>Auto Reorder - Low Stock Alert</span>
          </DialogTitle>
          <DialogDescription>
            {totalItems} item{totalItems !== 1 ? 's' : ''} require reordering due to low stock levels
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{totalItems}</div>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-red-600">{criticalItems}</div>
                <p className="text-xs text-muted-foreground">Critical</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-600">{moderateItems}</div>
                <p className="text-xs text-muted-foreground">Moderate</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-yellow-600">{lowItems}</div>
                <p className="text-xs text-muted-foreground">Low</p>
              </CardContent>
            </Card>
          </div>

          {/* Action Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <ShoppingCart className="h-4 w-4" />
                <span>Reorder Action</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-blue-900">Generate Purchase Orders</div>
                    <div className="text-sm text-blue-700">
                      Create purchase orders for {selectedCount} selected item{selectedCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  {selectedCount} / {totalItems} selected
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Low Stock Items</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedItems.length === lowStockItems.length ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-muted-foreground">
                  Select items to include in purchase orders
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedItems.length === lowStockItems.length && lowStockItems.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300"
                        />
                      </TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Current Stock</TableHead>
                      <TableHead>Threshold</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Urgency</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowStockItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                            className="rounded border-gray-300"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">{item.productSku}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-orange-600">{item.currentStock}</span>
                              <span className="text-sm text-muted-foreground">
                                / {item.lowStockThreshold} min
                              </span>
                            </div>
                            <Progress 
                              value={getStockProgress(item)} 
                              className="h-2"
                            />
                          </div>
                        </TableCell>
                        <TableCell>{item.lowStockThreshold}</TableCell>
                        <TableCell>
                          <div className="text-sm">{item.location}</div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`${getUrgencyColor(item.urgencyLevel)} flex items-center gap-1 w-fit`}
                          >
                            {item.urgencyLevel === 'critical' && <AlertTriangle className="h-3 w-3" />}
                            {item.urgencyLevel === 'moderate' && <TrendingDown className="h-3 w-3" />}
                            {item.urgencyLevel === 'low' && <Package className="h-3 w-3" />}
                            {item.urgencyLevel.charAt(0).toUpperCase() + item.urgencyLevel.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <span className="text-sm">Review and select items for reordering</span>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <span className="text-sm">Generate purchase orders for selected items</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">3</span>
                  </div>
                  <span className="text-sm text-muted-foreground">Send orders to suppliers and track delivery</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={selectedCount === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Generate Purchase Orders ({selectedCount})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

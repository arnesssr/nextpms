'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertTriangle, Package, Calculator, CheckCircle, X } from 'lucide-react';

interface BulkReorderPointsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface InventoryItemSummary {
  id: string;
  productName: string;
  productSku: string;
  currentStock: number;
  currentReorderPoint: number;
  currentReorderQuantity: number;
  selected: boolean;
}

export function BulkReorderPointsModal({ isOpen, onClose, onSuccess }: BulkReorderPointsModalProps) {
  const [items, setItems] = useState<InventoryItemSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Bulk calculation parameters
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [dailyUsage, setDailyUsage] = useState<number>(2);
  const [safetyStock, setSafetyStock] = useState<number>(5);
  const [applyToSelected, setApplyToSelected] = useState(true);

  // Fetch inventory items when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInventoryItems();
    }
  }, [isOpen]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/inventory');
      if (!response.ok) {
        throw new Error('Failed to fetch inventory items');
      }
      const data = await response.json();
      
      // Transform API response to our format
      const itemsData = data.data?.map((item: any) => ({
        id: item.id,
        productName: item.product_name || item.products?.name || 'Unknown Product',
        productSku: item.product_sku || item.products?.sku || 'N/A',
        currentStock: item.quantity_on_hand || item.quantity_available || 0,
        currentReorderPoint: item.min_stock_level || item.reorder_point || 0,
        currentReorderQuantity: item.reorder_quantity || 0,
        selected: false
      })) || [];
      
      setItems(itemsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setLoading(false);
    }
  };

  const calculateReorderPoint = () => {
    return (leadTimeDays * dailyUsage) + safetyStock;
  };

  const calculateReorderQuantity = () => {
    return Math.max(leadTimeDays * dailyUsage * 2, 10);
  };

  const handleSelectAll = () => {
    const allSelected = items.every(item => item.selected);
    setItems(items.map(item => ({ ...item, selected: !allSelected })));
  };

  const handleSelectItem = (itemId: string) => {
    setItems(items.map(item => 
      item.id === itemId ? { ...item, selected: !item.selected } : item
    ));
  };

  const handleBulkUpdate = async () => {
    const selectedItems = items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      setError('Please select at least one item to update');
      return;
    }

    setSaving(true);
    setError(null);

    const reorderPoint = calculateReorderPoint();
    const reorderQuantity = calculateReorderQuantity();

    try {
      const updatePromises = selectedItems.map(item =>
        fetch(`/api/inventory/${item.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            min_stock_level: reorderPoint,
            reorder_quantity: reorderQuantity
          })
        })
      );

      const results = await Promise.allSettled(updatePromises);
      const failures = results.filter(result => result.status === 'rejected');

      if (failures.length > 0) {
        setError(`Failed to update ${failures.length} items. Please try again.`);
      } else {
        // Refresh the items data
        await fetchInventoryItems();
        onSuccess?.();
        
        // Show success and close after delay
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err) {
      setError('Failed to update reorder points. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedCount = items.filter(item => item.selected).length;
  const needsReorderPoint = items.filter(item => item.currentReorderPoint === 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Bulk Set Reorder Points</span>
          </DialogTitle>
          <DialogDescription>
            Configure reorder points for multiple inventory items at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold">{items.length}</div>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-orange-600">{needsReorderPoint}</div>
                <p className="text-xs text-muted-foreground">Need Reorder Points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-2xl font-bold text-blue-600">{selectedCount}</div>
                <p className="text-xs text-muted-foreground">Selected Items</p>
              </CardContent>
            </Card>
          </div>

          {/* Calculation Parameters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Calculation Parameters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    min="1"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="dailyUsage">Daily Usage</Label>
                  <Input
                    id="dailyUsage"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={dailyUsage}
                    onChange={(e) => setDailyUsage(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="safetyStock">Safety Stock</Label>
                  <Input
                    id="safetyStock"
                    type="number"
                    min="0"
                    value={safetyStock}
                    onChange={(e) => setSafetyStock(Number(e.target.value))}
                  />
                </div>
              </div>
              
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-900">
                  <strong>Calculated Values:</strong>
                  <div className="mt-1">
                    Reorder Point: {calculateReorderPoint()} units | 
                    Reorder Quantity: {calculateReorderQuantity()} units
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Inventory Items</CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {items.every(item => item.selected) ? 'Deselect All' : 'Select All'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setItems(items.map(item => ({
                      ...item,
                      selected: item.currentReorderPoint === 0
                    })));
                  }}
                >
                  Select Items Without Reorder Points
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                </div>
              ) : (
                <div className="max-h-64 overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={items.length > 0 && items.every(item => item.selected)}
                            onCheckedChange={handleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Current Reorder Point</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Checkbox
                              checked={item.selected}
                              onCheckedChange={() => handleSelectItem(item.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">{item.productSku}</div>
                            </div>
                          </TableCell>
                          <TableCell>{item.currentStock}</TableCell>
                          <TableCell>{item.currentReorderPoint}</TableCell>
                          <TableCell>
                            {item.currentReorderPoint === 0 ? (
                              <Badge variant="outline" className="text-orange-600 border-orange-200">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Needs Setup
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-green-600 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Configured
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleBulkUpdate} 
            disabled={saving || selectedCount === 0}
          >
            {saving ? 'Updating...' : `Update ${selectedCount} Selected Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

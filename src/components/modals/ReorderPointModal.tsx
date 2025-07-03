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
import { AlertTriangle, Package, TrendingDown, Calculator, Info } from 'lucide-react';
import { InventoryItem } from '@/types';

interface ReorderPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSave: (itemId: string, reorderPoint: number, reorderQuantity: number) => Promise<void>;
}

export function ReorderPointModal({ isOpen, onClose, item, onSave }: ReorderPointModalProps) {
  const [reorderPoint, setReorderPoint] = useState<number>(0);
  const [reorderQuantity, setReorderQuantity] = useState<number>(0);
  const [leadTimeDays, setLeadTimeDays] = useState<number>(7);
  const [dailyUsage, setDailyUsage] = useState<number>(1);
  const [safetyStock, setSafetyStock] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setReorderPoint(item.lowStockThreshold || 0);
      setReorderQuantity(item.quantity || 10);
      setLeadTimeDays(7);
      setDailyUsage(1);
      setSafetyStock(0);
    }
  }, [item]);

  // Calculate suggested reorder point based on lead time and usage
  useEffect(() => {
    const suggestedReorderPoint = (leadTimeDays * dailyUsage) + safetyStock;
    setReorderPoint(suggestedReorderPoint);
  }, [leadTimeDays, dailyUsage, safetyStock]);

  // Calculate suggested reorder quantity (Economic Order Quantity simplified)
  useEffect(() => {
    const suggestedQuantity = Math.max(leadTimeDays * dailyUsage * 2, 10);
    setReorderQuantity(suggestedQuantity);
  }, [leadTimeDays, dailyUsage]);

  const handleSave = async () => {
    if (!item) return;

    setIsLoading(true);
    try {
      await onSave(item.id, reorderPoint, reorderQuantity);
      onClose();
    } catch (error) {
      console.error('Error saving reorder point:', error);
      alert('Failed to save reorder point. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getReorderStatus = () => {
    if (!item) return null;

    const currentStock = item.quantity;
    if (currentStock <= reorderPoint) {
      return {
        status: 'action-required',
        message: 'Immediate reorder required',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="h-4 w-4" />
      };
    } else if (currentStock <= reorderPoint * 1.5) {
      return {
        status: 'warning',
        message: 'Approaching reorder point',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        icon: <TrendingDown className="h-4 w-4" />
      };
    } else {
      return {
        status: 'good',
        message: 'Stock level healthy',
        color: 'bg-green-100 text-green-800 border-green-200',
        icon: <Package className="h-4 w-4" />
      };
    }
  };

  const reorderStatus = getReorderStatus();

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span>Set Reorder Point</span>
          </DialogTitle>
          <DialogDescription>
            Configure automatic reorder settings for {item.product?.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
          {/* Current Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Current Stock Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-muted-foreground">Current Stock</span>
                  <div className="text-lg font-bold">{item.quantity}</div>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Current Threshold</span>
                  <div className="text-lg">{item.lowStockThreshold}</div>
                </div>
              </div>
              {reorderStatus && (
                <Badge className={`${reorderStatus.color} flex items-center gap-2 w-fit text-xs`}>
                  {reorderStatus.icon}
                  {reorderStatus.message}
                </Badge>
              )}
            </CardContent>
          </Card>

          {/* Calculation Parameters */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Calculator className="h-4 w-4" />
                <span>Calculation Parameters</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Adjust these values to calculate optimal reorder points
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="leadTime">Lead Time (days)</Label>
                  <Input
                    id="leadTime"
                    type="number"
                    min="1"
                    max="365"
                    value={leadTimeDays}
                    onChange={(e) => setLeadTimeDays(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time from order to delivery
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dailyUsage">Daily Usage</Label>
                  <Input
                    id="dailyUsage"
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={dailyUsage}
                    onChange={(e) => setDailyUsage(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Average units used per day
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="safetyStock">Safety Stock</Label>
                <Input
                  id="safetyStock"
                  type="number"
                  min="0"
                  value={safetyStock}
                  onChange={(e) => setSafetyStock(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Extra stock to handle demand fluctuations
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Calculated Values */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recommended Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorderPoint">Reorder Point</Label>
                  <Input
                    id="reorderPoint"
                    type="number"
                    min="0"
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(Number(e.target.value))}
                  />
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Info className="h-3 w-3" />
                    <span>Formula: (Lead Time × Daily Usage) + Safety Stock</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                  <Input
                    id="reorderQuantity"
                    type="number"
                    min="1"
                    value={reorderQuantity}
                    onChange={(e) => setReorderQuantity(Number(e.target.value))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Quantity to order when reorder point is reached
                  </p>
                </div>
              </div>
              
              {/* Calculation breakdown */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Calculation Breakdown:</h4>
                <div className="text-xs text-blue-800 space-y-1">
                  <div>Lead Time Demand: {leadTimeDays} days × {dailyUsage} units = {leadTimeDays * dailyUsage}</div>
                  <div>Safety Stock: {safetyStock}</div>
                  <div className="font-medium border-t border-blue-300 pt-1">
                    Total Reorder Point: {leadTimeDays * dailyUsage} + {safetyStock} = {reorderPoint}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Reorder Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

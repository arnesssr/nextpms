'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Plus, 
  Minus, 
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calculator
} from 'lucide-react';
import { InventoryItem, Product } from '@/types';

// Form validation schema
const stockAdjustmentSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  adjustmentType: z.enum(['increment', 'decrement', 'set']),
  quantity: z.number().min(1, 'Quantity must be greater than 0'),
  reason: z.string().min(1, 'Reason is required'),
  location: z.string().optional(),
});

type StockAdjustmentData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  item?: InventoryItem | null;
  products: Product[];
}

export function StockAdjustmentModal({ 
  isOpen, 
  onClose, 
  item, 
  products 
}: StockAdjustmentModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<StockAdjustmentData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      productId: '',
      adjustmentType: 'increment',
      quantity: 1,
      reason: '',
      location: '',
    }
  });

  const watchedValues = watch();

  // Update form when item changes
  useEffect(() => {
    if (item && isOpen) {
      const product = products.find(p => p.id === item.productId);
      setSelectedProduct(product || null);
      setValue('productId', item.productId);
      setValue('location', item.location);
      reset({
        productId: item.productId,
        adjustmentType: 'increment',
        quantity: 1,
        reason: '',
        location: item.location,
      });
    } else if (isOpen) {
      // Reset form for new adjustment
      setSelectedProduct(null);
      reset({
        productId: '',
        adjustmentType: 'increment',
        quantity: 1,
        reason: '',
        location: '',
      });
    }
  }, [item, isOpen, products, setValue, reset]);

  // Update selected product when productId changes
  useEffect(() => {
    const product = products.find(p => p.id === watchedValues.productId);
    setSelectedProduct(product || null);
  }, [watchedValues.productId, products]);

  const calculateNewStock = () => {
    if (!selectedProduct) return null;
    
    const currentStock = selectedProduct.stock;
    const adjustmentQuantity = watchedValues.quantity || 0;
    
    switch (watchedValues.adjustmentType) {
      case 'increment':
        return currentStock + adjustmentQuantity;
      case 'decrement':
        return Math.max(0, currentStock - adjustmentQuantity);
      case 'set':
        return adjustmentQuantity;
      default:
        return currentStock;
    }
  };

  const getStockStatus = (stock: number) => {
    if (!selectedProduct || !item) return null;
    
    if (stock === 0) {
      return { label: 'Out of Stock', color: 'text-red-600', icon: AlertTriangle };
    }
    if (stock <= item.lowStockThreshold) {
      return { label: 'Low Stock', color: 'text-amber-600', icon: TrendingDown };
    }
    return { label: 'In Stock', color: 'text-green-600', icon: TrendingUp };
  };

  const onSubmit = async (data: StockAdjustmentData) => {
    setIsSubmitting(true);
    try {
      // TODO: Implement actual API call
      console.log('Stock adjustment:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onClose();
    } catch (error) {
      console.error('Error adjusting stock:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const newStock = calculateNewStock();
  const stockStatus = newStock !== null ? getStockStatus(newStock) : null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Adjust Stock Level' : 'Stock Adjustment'}
          </DialogTitle>
          <DialogDescription>
            {item 
              ? `Update inventory for ${selectedProduct?.name || 'selected product'}`
              : 'Make inventory adjustments to your stock levels'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Product Selection */}
          {!item && (
            <div className="space-y-2">
              <Label htmlFor="productId">Product *</Label>
              <Select 
                value={watchedValues.productId} 
                onValueChange={(value) => setValue('productId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center space-x-2">
                        <span>{product.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {product.stock} in stock
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.productId && (
                <p className="text-sm text-red-600">{errors.productId.message}</p>
              )}
            </div>
          )}

          {/* Current Product Info */}
          {selectedProduct && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Current Product Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={selectedProduct.images[0]} alt={selectedProduct.name} />
                    <AvatarFallback>
                      {selectedProduct.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">{selectedProduct.name}</div>
                    <div className="text-sm text-muted-foreground">
                      SKU: {selectedProduct.sku} • Current Stock: {selectedProduct.stock}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${selectedProduct.price}</div>
                    {item && (
                      <div className="text-sm text-muted-foreground">
                        {item.location}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Adjustment Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adjustmentType">Adjustment Type *</Label>
              <Select 
                value={watchedValues.adjustmentType} 
                onValueChange={(value: 'increment' | 'decrement' | 'set') => 
                  setValue('adjustmentType', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increment">
                    <div className="flex items-center">
                      <Plus className="mr-2 h-4 w-4 text-green-600" />
                      Add Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="decrement">
                    <div className="flex items-center">
                      <Minus className="mr-2 h-4 w-4 text-red-600" />
                      Remove Stock
                    </div>
                  </SelectItem>
                  <SelectItem value="set">
                    <div className="flex items-center">
                      <Calculator className="mr-2 h-4 w-4 text-blue-600" />
                      Set Exact Amount
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.adjustmentType && (
                <p className="text-sm text-red-600">{errors.adjustmentType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">
                {watchedValues.adjustmentType === 'set' ? 'New Stock Level *' : 'Quantity *'}
              </Label>
              <Input
                id="quantity"
                type="number"
                {...register('quantity', { valueAsNumber: true })}
                placeholder="Enter quantity"
              />
              {errors.quantity && (
                <p className="text-sm text-red-600">{errors.quantity.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          {item && (
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                {...register('location')}
                placeholder="Warehouse location"
              />
            </div>
          )}

          {/* Reason */}
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Adjustment *</Label>
            <Textarea
              id="reason"
              {...register('reason')}
              placeholder="Explain the reason for this stock adjustment..."
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-red-600">{errors.reason.message}</p>
            )}
          </div>

          {/* Preview */}
          {selectedProduct && newStock !== null && (
            <Card className="bg-gray-50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center">
                  <Package className="mr-2 h-4 w-4" />
                  Adjustment Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">{selectedProduct.stock}</div>
                    <div className="text-sm text-muted-foreground">Current Stock</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-blue-600">
                      {watchedValues.adjustmentType === 'increment' && '+'}
                      {watchedValues.adjustmentType === 'decrement' && '-'}
                      {watchedValues.adjustmentType === 'set' && '='}
                      {watchedValues.quantity || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Adjustment</div>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${stockStatus?.color}`}>
                      {newStock}
                    </div>
                    <div className="text-sm text-muted-foreground">New Stock</div>
                    {stockStatus && (
                      <Badge 
                        variant="outline" 
                        className={`mt-1 ${stockStatus.color} border-current`}
                      >
                        <stockStatus.icon className="mr-1 h-3 w-3" />
                        {stockStatus.label}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !selectedProduct}
            >
              {isSubmitting ? 'Adjusting...' : 'Apply Adjustment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

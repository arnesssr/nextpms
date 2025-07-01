'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calculator,
  Eye,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { productService } from '@/services/products';
import { categoryService } from '@/services/categories';
import { usePricing } from '../hooks/usePricing';
import { usePriceHistory } from '../hooks/usePriceHistory';
import { BulkPriceUpdateRequest, PriceType } from '../types';
import {
  PriceIncreaseIcon,
  PriceDecreaseIcon,
  ApplyDiscountIcon,
  SetTargetMarginIcon,
  AddFixedAmountIcon,
  ReduceFixedAmountIcon
} from '@/assets/icons/bulk-pricing/BulkPricingIcons';

interface BulkPriceUpdateProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ProductForUpdate {
  id: string;
  name: string;
  sku: string;
  current_price: number;
  cost_price: number;
  new_price: number;
  current_margin: number;
  new_margin: number;
  price_change: number;
  price_change_percent: number;
  selected: boolean;
}

interface UpdatePreview {
  total_products: number;
  selected_products: number;
  total_current_value: number;
  total_new_value: number;
  value_change: number;
  avg_margin_change: number;
}

export const BulkPriceUpdate: React.FC<BulkPriceUpdateProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { bulkUpdatePrices, calculateProfitMargin } = usePricing();
  const { refreshAllData } = usePriceHistory();
  
  // Form state
  const [updateType, setUpdateType] = useState<'increase' | 'decrease' | 'discount' | 'set_margin' | 'fixed_increase' | 'fixed_decrease'>('increase');
  const [value, setValue] = useState<string>('');
  const [priceType, setPriceType] = useState<PriceType>('retail_price');
  const [reason, setReason] = useState<string>('');
  const [selectionType, setSelectionType] = useState<'all' | 'category' | 'low_margin' | 'custom'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  
  // Data state
  const [products, setProducts] = useState<ProductForUpdate[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState<UpdatePreview | null>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      loadProducts();
      loadCategories();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProducts({ per_page: 100 });
      
      const productsForUpdate: ProductForUpdate[] = response.data
        .filter(p => p.base_price && p.selling_price)
        .map(product => {
          const current_price = product.selling_price;
          const cost_price = product.base_price;
          const current_margin = calculateProfitMargin(cost_price, current_price);
          
          return {
            id: product.id,
            name: product.name,
            sku: product.sku || 'No SKU',
            current_price,
            cost_price,
            new_price: current_price, // Will be calculated
            current_margin,
            new_margin: current_margin, // Will be calculated
            price_change: 0,
            price_change_percent: 0,
            selected: true // Default all selected
          };
        });
      
      setProducts(productsForUpdate);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await categoryService.getCategories({ limit: 100, status: 'active' });
      setCategories(response.data);
    } catch (error) {
      console.error('Error loading categories:', error);
      setError('Failed to load categories');
    }
  };

  // Calculate new prices based on update type and value
  const calculateNewPrices = () => {
    if (!value || isNaN(Number(value))) return;

    const updateValue = Number(value);
    
    const updatedProducts = products.map(product => {
      let new_price: number;
      
      switch (updateType) {
        case 'increase':
          new_price = product.current_price * (1 + updateValue / 100);
          break;
        case 'decrease':
          new_price = product.current_price * (1 - updateValue / 100);
          break;
        case 'discount':
          new_price = product.current_price * (1 - updateValue / 100);
          break;
        case 'set_margin':
          // Calculate price needed to achieve target margin
          new_price = product.cost_price / (1 - updateValue / 100);
          break;
        case 'fixed_increase':
          new_price = product.current_price + updateValue;
          break;
        case 'fixed_decrease':
          new_price = product.current_price - updateValue;
          break;
        default:
          new_price = product.current_price;
      }

      // Ensure price is not negative
      new_price = Math.max(0.01, new_price);
      
      const price_change = new_price - product.current_price;
      const price_change_percent = product.current_price > 0 ? (price_change / product.current_price) * 100 : 0;
      const new_margin = calculateProfitMargin(product.cost_price, new_price);

      return {
        ...product,
        new_price,
        new_margin,
        price_change,
        price_change_percent
      };
    });

    setProducts(updatedProducts);
    calculatePreview(updatedProducts);
  };

  // Calculate preview statistics
  const calculatePreview = (updatedProducts: ProductForUpdate[]) => {
    const selectedProducts = updatedProducts.filter(p => p.selected);
    
    const total_current_value = selectedProducts.reduce((sum, p) => sum + p.current_price, 0);
    const total_new_value = selectedProducts.reduce((sum, p) => sum + p.new_price, 0);
    const value_change = total_new_value - total_current_value;
    
    const avg_current_margin = selectedProducts.reduce((sum, p) => sum + p.current_margin, 0) / selectedProducts.length;
    const avg_new_margin = selectedProducts.reduce((sum, p) => sum + p.new_margin, 0) / selectedProducts.length;
    const avg_margin_change = avg_new_margin - avg_current_margin;

    setPreview({
      total_products: updatedProducts.length,
      selected_products: selectedProducts.length,
      total_current_value,
      total_new_value,
      value_change,
      avg_margin_change
    });
  };

  // Apply selection filters
  const applySelection = async () => {
    setError(null); // Clear any previous errors
    
    if (selectionType === 'category') {
      if (!selectedCategory) {
        // Clear products if no category selected
        setProducts([]);
        setPreview(null);
        return;
      }
      
      // Load products for the selected category
      try {
        setLoading(true);
        console.log('Loading products for category:', selectedCategory);
        const response = await productService.getProducts({ 
          category_id: selectedCategory,
          per_page: 100 // Load up to 100 products from the category
        });
        console.log('Category products response:', response);
        
        const categoryProducts: ProductForUpdate[] = response.data
          .filter(p => p.base_price && p.selling_price) // Only products with pricing data
          .map(product => {
            const current_price = product.selling_price;
            const cost_price = product.base_price;
            const current_margin = calculateProfitMargin(cost_price, current_price);
            
            return {
              id: product.id,
              name: product.name,
              sku: product.sku || 'No SKU',
              current_price,
              cost_price,
              new_price: current_price, // Will be calculated when value changes
              current_margin,
              new_margin: current_margin, // Will be calculated when value changes
              price_change: 0,
              price_change_percent: 0,
              selected: true // All category products selected by default
            };
          });
        
        setProducts(categoryProducts);
        
        // Auto-show preview when category products are loaded
        setShowPreview(true);
        
        // If we have a value set, recalculate prices for the new products
        if (value && !isNaN(Number(value))) {
          // Trigger price recalculation for the new products
          setTimeout(() => calculateNewPrices(), 100);
        } else {
          calculatePreview(categoryProducts);
        }
        
      } catch (error) {
        console.error('Error loading category products:', error);
        setError(`Failed to load products for the selected category`);
        setProducts([]);
        setPreview(null);
      } finally {
        setLoading(false);
      }
    } else {
      // Apply selection filters to existing products
      const updatedProducts = products.map(product => {
        let selected = false;
        
        switch (selectionType) {
          case 'all':
            selected = true;
            break;
          case 'low_margin':
            selected = product.current_margin < 20;
            break;
          case 'custom':
            selected = product.selected; // Keep current selection
            break;
        }
        
        return { ...product, selected };
      });
      
      setProducts(updatedProducts);
      calculatePreview(updatedProducts);
    }
  };

  // Handle individual product selection
  const toggleProductSelection = (productId: string) => {
    const updatedProducts = products.map(product =>
      product.id === productId 
        ? { ...product, selected: !product.selected }
        : product
    );
    setProducts(updatedProducts);
    calculatePreview(updatedProducts);
  };

  // Apply bulk update
  const handleApplyUpdate = async () => {
    try {
      setLoading(true);
      
      const selectedProducts = products.filter(p => p.selected);
      if (selectedProducts.length === 0) {
        setError('Please select at least one product');
        return;
      }

      if (!reason.trim()) {
        setError('Please provide a reason for the price update');
        return;
      }

      // Convert our business-friendly types to backend types
      let backendUpdateType: string;
      switch (updateType) {
        case 'increase':
        case 'decrease':
        case 'discount':
          backendUpdateType = 'percentage';
          break;
        case 'set_margin':
          backendUpdateType = 'new_price';
          break;
        case 'fixed_increase':
        case 'fixed_decrease':
          backendUpdateType = 'fixed_amount';
          break;
        default:
          backendUpdateType = 'percentage';
      }

      // Adjust value for decrease/discount operations
      let adjustedValue = Number(value);
      if (updateType === 'decrease' || updateType === 'discount') {
        adjustedValue = -adjustedValue; // Make it negative for decreases
      } else if (updateType === 'fixed_decrease') {
        adjustedValue = -adjustedValue; // Make it negative for fixed decreases
      }

      const request: BulkPriceUpdateRequest = {
        product_ids: selectedProducts.map(p => p.id),
        update_type: backendUpdateType as any,
        value: adjustedValue,
        change_reason: reason,
        price_type: priceType,
        effective_from: new Date().toISOString()
      };

      await bulkUpdatePrices(request);
      
      // Refresh price history data to show recent changes
      try {
        await refreshAllData();
      } catch (refreshError) {
        console.warn('Failed to refresh price history data:', refreshError);
        // Don't fail the entire operation if refresh fails
      }
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error applying bulk update:', error);
      setError('Failed to apply bulk price update');
    } finally {
      setLoading(false);
    }
  };

  // Recalculate when form values change
  useEffect(() => {
    if (value && products.length > 0) {
      calculateNewPrices();
    }
  }, [value, updateType, products.length]);

  useEffect(() => {
    if (selectionType === 'category' && selectedCategory) {
      // Always trigger for category selection
      applySelection();
    } else if (selectionType !== 'category' && products.length > 0) {
      // For other selections, only trigger if we have products
      applySelection();
    }
  }, [selectionType, selectedCategory]);

  const getPriceChangeColor = (changePercent: number) => {
    if (changePercent > 0) return 'text-green-600';
    if (changePercent < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getMarginColor = (margin: number) => {
    if (margin < 20) return 'text-red-600';
    if (margin > 50) return 'text-green-600';
    return 'text-gray-600';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[95vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Bulk Price Update
          </DialogTitle>
          <DialogDescription>
            Update prices for multiple products at once using different strategies
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Update Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Update Type</Label>
                  <Select value={updateType} onValueChange={(value: any) => setUpdateType(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="increase">
                        <div className="flex items-center gap-2">
                          <PriceIncreaseIcon width={16} height={16} />
                          Price Increase
                        </div>
                      </SelectItem>
                      <SelectItem value="decrease">
                        <div className="flex items-center gap-2">
                          <PriceDecreaseIcon width={16} height={16} />
                          Price Decrease
                        </div>
                      </SelectItem>
                      <SelectItem value="discount">
                        <div className="flex items-center gap-2">
                          <ApplyDiscountIcon width={16} height={16} />
                          Apply Discount
                        </div>
                      </SelectItem>
                      <SelectItem value="set_margin">
                        <div className="flex items-center gap-2">
                          <SetTargetMarginIcon width={16} height={16} />
                          Set Target Margin
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed_increase">
                        <div className="flex items-center gap-2">
                          <AddFixedAmountIcon width={16} height={16} />
                          Add Fixed Amount
                        </div>
                      </SelectItem>
                      <SelectItem value="fixed_decrease">
                        <div className="flex items-center gap-2">
                          <ReduceFixedAmountIcon width={16} height={16} />
                          Reduce Fixed Amount
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    {updateType === 'increase' && 'Increase Percentage (%)'}
                    {updateType === 'decrease' && 'Decrease Percentage (%)'}
                    {updateType === 'discount' && 'Discount Percentage (%)'}
                    {updateType === 'set_margin' && 'Target Margin (%)'}
                    {updateType === 'fixed_increase' && 'Amount to Add ($)'}
                    {updateType === 'fixed_decrease' && 'Amount to Reduce ($)'}
                  </Label>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={
                      updateType === 'increase' ? '10' :
                      updateType === 'decrease' ? '5' :
                      updateType === 'discount' ? '15' :
                      updateType === 'set_margin' ? '30' :
                      updateType === 'fixed_increase' ? '5.00' :
                      updateType === 'fixed_decrease' ? '2.00' : '10'
                    }
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Price Type</Label>
                  <Select value={priceType} onValueChange={(value: any) => setPriceType(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail_price">Selling Price</SelectItem>
                      <SelectItem value="base_price">Cost Price</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Apply To</Label>
                  <Select value={selectionType} onValueChange={(value: any) => setSelectionType(value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="low_margin">Low Margin (&lt;20%)</SelectItem>
                      <SelectItem value="category">By Category</SelectItem>
                      <SelectItem value="custom">Custom Selection</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category Selection - Show only when 'category' is selected */}
              {selectionType === 'category' && (
                <div className="mt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Select Category</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a category..." />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedCategory && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-md">
                      <div className="text-sm text-blue-700">
                        {loading ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading products from category...</span>
                          </div>
                        ) : (
                          <>
                            <strong>Note:</strong> This will load and update products from the selected category only.
                            {products.length > 0 ? (
                              <div className="mt-1">
                                <strong>{products.length}</strong> products loaded from category: <strong>
                                  {categories.find(cat => cat.id === selectedCategory)?.name}
                                </strong>
                              </div>
                            ) : (
                              <div className="mt-1 text-orange-600">
                                No products found in category: <strong>
                                  {categories.find(cat => cat.id === selectedCategory)?.name}
                                </strong>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="col-span-full space-y-2 mt-4">
                <Label className="text-sm font-medium">Reason for Update</Label>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g., Supplier cost increase, Market adjustment, Seasonal pricing..."
                  rows={3}
                  className="resize-none w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preview Summary */}
          {preview && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Update Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{preview.selected_products}</div>
                    <div className="text-sm text-muted-foreground">Products Selected</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${preview.value_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {preview.value_change >= 0 ? '+' : ''}${preview.value_change.toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">Value Change</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold ${preview.avg_margin_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {preview.avg_margin_change >= 0 ? '+' : ''}{preview.avg_margin_change.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Margin Change</div>
                  </div>
                  <div className="text-center">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPreview(!showPreview)}
                      className="w-full"
                    >
                      {showPreview ? 'Hide' : 'Show'} Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product List */}
          {showPreview && (
            <Card>
              <CardHeader>
                <CardTitle>Product Updates Preview</CardTitle>
                <CardDescription>
                  Review the proposed price changes for each product
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto border rounded-md">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={products.every(p => p.selected)}
                            onCheckedChange={(checked) => {
                              const updatedProducts = products.map(p => ({ ...p, selected: !!checked }));
                              setProducts(updatedProducts);
                              calculatePreview(updatedProducts);
                            }}
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Current Price</TableHead>
                        <TableHead>New Price</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Current Margin</TableHead>
                        <TableHead>New Margin</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className={!product.selected ? 'opacity-50' : ''}>
                          <TableCell>
                            <Checkbox
                              checked={product.selected}
                              onCheckedChange={() => toggleProductSelection(product.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.sku}</div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">${product.current_price.toFixed(2)}</TableCell>
                          <TableCell className="font-mono">${product.new_price.toFixed(2)}</TableCell>
                          <TableCell>
                            <div className={`font-mono ${getPriceChangeColor(product.price_change_percent)}`}>
                              {product.price_change >= 0 ? '+' : ''}${product.price_change.toFixed(2)}
                              <div className="text-xs">
                                ({product.price_change_percent >= 0 ? '+' : ''}{product.price_change_percent.toFixed(1)}%)
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className={getMarginColor(product.current_margin)}>
                            {product.current_margin.toFixed(1)}%
                          </TableCell>
                          <TableCell className={getMarginColor(product.new_margin)}>
                            {product.new_margin.toFixed(1)}%
                          </TableCell>
                          <TableCell>
                            {product.new_margin < 0 ? (
                              <Badge variant="destructive" className="text-xs">
                                <XCircle className="w-3 h-3 mr-1" />
                                Loss
                              </Badge>
                            ) : product.new_margin < 10 ? (
                              <Badge variant="secondary" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Low
                              </Badge>
                            ) : (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Good
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex-shrink-0 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleApplyUpdate} disabled={loading || !value || !reason.trim()}>
            {loading ? 'Applying...' : `Apply Update to ${preview?.selected_products || 0} Products`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

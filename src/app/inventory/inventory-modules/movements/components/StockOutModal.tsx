'use client';

import { useState, useEffect } from 'react';
import { CreateMovementRequest, MovementType, MovementReason } from '../types/movements.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProductPicker, ProductWithStock } from './ProductPicker';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  MapPin, 
  Users,
  Calendar,
  FileText,
  Hash,
  AlertTriangle,
  Info,
  Truck
} from 'lucide-react';

export interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateMovementRequest) => void;
  locations: string[];
  customers: string[];
}

export function StockOutModal({ isOpen, onClose, onSave, locations, customers }: StockOutModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState(locations.length ? locations[0] : '');
  const [reason, setReason] = useState<MovementReason>(MovementReason.SALE);
  const [customer, setCustomer] = useState(customers.length ? customers[0] : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setQuantity(0);
      setLocation(locations.length ? locations[0] : '');
      setReason(MovementReason.SALE);
      setCustomer(customers.length ? customers[0] : '');
      setReference('');
      setNotes('');
      setErrors([]);
    }
  }, [isOpen, locations, customers]);

  // Get available stock for selected product
  const availableStock = selectedProduct?.availableStock || 0;
  const hasInsufficientStock = quantity > availableStock;

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!selectedProduct) {
      validationErrors.push('Please select a product');
    }

    if (quantity <= 0) {
      validationErrors.push('Quantity must be greater than 0');
    }

    if (selectedProduct && quantity > availableStock) {
      validationErrors.push(`Insufficient stock. Only ${availableStock} available`);
    }

    if (!location) {
      validationErrors.push('Please select a location');
    }

    return validationErrors;
  };

  const handleSave = () => {
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (validationErrors.length > 0 || !selectedProduct) {
      return;
    }

    const request: CreateMovementRequest = {
      productId: selectedProduct.id,
      type: MovementType.OUT,
      quantity,
      reason,
      location,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      customer: reason === MovementReason.SALE ? customer : undefined,
    };

    onSave(request);
    onClose();
  };

  // Stock out reasons
  const stockOutReasons = [
    { value: MovementReason.SALE, label: 'Sale' },
    { value: MovementReason.RETURN, label: 'Return to Supplier' },
    { value: MovementReason.TRANSFER, label: 'Transfer Out' },
    { value: MovementReason.DAMAGE, label: 'Damaged' },
    { value: MovementReason.ADJUSTMENT, label: 'Adjustment' },
    { value: MovementReason.MANUAL, label: 'Manual Entry' }
  ];

  const getReasonIcon = (reason: MovementReason) => {
    switch (reason) {
      case MovementReason.DAMAGE:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Truck className="h-5 w-5 text-red-600" />
            <span>Record Stock Out</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Error Messages */}
          {errors.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                    <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                      {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Product Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Product</label>
            <ProductPicker
              value={selectedProduct}
              onSelect={setSelectedProduct}
              placeholder="Search and select a product..."
              showStockInfo={true}
              filterOutOfStock={true}
              className="w-full"
            />
          </div>

          {/* Product Details */}
          {selectedProduct && (
            <Card className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-red-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-red-700">SKU: {selectedProduct.sku || 'N/A'}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-red-600">Current Stock: {selectedProduct.availableStock || 0}</span>
                      <span className="text-red-600">Price: ${selectedProduct.selling_price}</span>
                    </div>
                  </div>
                  <Info className="h-4 w-4 text-red-600" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Movement Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Quantity</label>
              <div className="flex items-center">
                <Hash className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Enter quantity"
                  type="number"
                  min="1"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
              {hasInsufficientStock && (
                <p className="text-xs text-red-600">
                  Insufficient stock. Only {availableStock} available.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <div className="flex items-center">
                {getReasonIcon(reason)}
                <Select value={reason} onValueChange={(value) => setReason(value as MovementReason)}>
                  <SelectTrigger className="ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stockOutReasons.map(reasonOption => (
                      <SelectItem key={reasonOption.value} value={reasonOption.value}>
                        {reasonOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {locations.map(loc => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer (only for sales) */}
          {reason === MovementReason.SALE && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground mr-2" />
                <Select value={customer} onValueChange={setCustomer}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(cust => (
                      <SelectItem key={cust} value={cust}>{cust}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Reference and Notes */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reference # (Optional)</label>
              <div className="flex items-center">
                <FileText className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Invoice, return order, etc."
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (Optional)</label>
              <Textarea
                placeholder="Additional notes about this stock movement..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Warning for problematic reasons */}
          {[MovementReason.DAMAGE].includes(reason) && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                  <span className="text-sm text-amber-700">
                    This will reduce stock due to {reason.replace('_', ' ').toLowerCase()}. 
                    Please ensure this is documented properly.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!selectedProduct || quantity <= 0 || hasInsufficientStock}
              className="bg-red-600 hover:bg-red-700"
            >
              Record Stock Out
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

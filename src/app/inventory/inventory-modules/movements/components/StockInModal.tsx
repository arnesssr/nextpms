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
  Truck,
  Calendar,
  DollarSign,
  FileText,
  Hash,
  AlertTriangle,
  Info
} from 'lucide-react';

export interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateMovementRequest) => void;
  locations: string[];
  suppliers: string[];
}

export function StockInModal({ isOpen, onClose, onSave, locations, suppliers }: StockInModalProps) {
  const [selectedProduct, setSelectedProduct] = useState<ProductWithStock | null>(null);
  const [quantity, setQuantity] = useState(0);
  const [location, setLocation] = useState(locations.length ? locations[0] : '');
  const [reason, setReason] = useState<MovementReason>(MovementReason.PURCHASE);
  const [supplier, setSupplier] = useState(suppliers.length ? suppliers[0] : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [unitCost, setUnitCost] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setQuantity(0);
      setLocation(locations.length ? locations[0] : '');
      setReason(MovementReason.PURCHASE);
      setSupplier(suppliers.length ? suppliers[0] : '');
      setReference('');
      setNotes('');
      setUnitCost(0);
      setErrors([]);
    }
  }, [isOpen, locations, suppliers]);

  // Update unit cost when product is selected
  useEffect(() => {
    if (selectedProduct && selectedProduct.cost_price) {
      setUnitCost(selectedProduct.cost_price);
    }
  }, [selectedProduct]);

  // Calculate total cost
  const totalCost = quantity * unitCost;

  const validateForm = (): string[] => {
    const validationErrors: string[] = [];

    if (!selectedProduct) {
      validationErrors.push('Please select a product');
    }

    if (quantity <= 0) {
      validationErrors.push('Quantity must be greater than 0');
    }

    if (!location) {
      validationErrors.push('Please select a location');
    }

    if (unitCost < 0) {
      validationErrors.push('Unit cost cannot be negative');
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
      type: MovementType.IN,
      quantity,
      reason,
      location,
      reference: reference.trim() || undefined,
      notes: notes.trim() || undefined,
      unitCost: unitCost > 0 ? unitCost : undefined,
      supplier: reason === MovementReason.PURCHASE ? supplier : undefined,
    };

    onSave(request);
    onClose();
  };

  // Stock in reasons
  const stockInReasons = [
    { value: MovementReason.PURCHASE, label: 'Purchase' },
    { value: MovementReason.RETURN_FROM_CUSTOMER, label: 'Customer Return' },
    { value: MovementReason.TRANSFER_IN, label: 'Transfer In' },
    { value: MovementReason.PRODUCTION, label: 'Production' },
    { value: MovementReason.ADJUSTMENT_IN, label: 'Adjustment In' }
  ];

  const getReasonIcon = (reason: MovementReason) => {
    switch (reason) {
      case MovementReason.PURCHASE:
        return <Truck className="h-4 w-4 text-blue-500" />;
      case MovementReason.RETURN_FROM_CUSTOMER:
        return <Package className="h-4 w-4 text-green-500" />;
      case MovementReason.PRODUCTION:
        return <Package className="h-4 w-4 text-purple-500" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span>Record Stock In</span>
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
              className="w-full"
            />
          </div>

          {/* Product Details */}
          {selectedProduct && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-medium text-blue-900">{selectedProduct.name}</h4>
                    <p className="text-sm text-blue-700">SKU: {selectedProduct.sku || 'N/A'}</p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="text-blue-600">Current Stock: {selectedProduct.availableStock || 0}</span>
                      <span className="text-blue-600">Price: ${selectedProduct.selling_price}</span>
                    </div>
                  </div>
                  <Info className="h-4 w-4 text-blue-600" />
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
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Unit Cost</label>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Enter unit cost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitCost || ''}
                  onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Total Cost Display */}
          {quantity > 0 && unitCost > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-green-800">Total Cost:</span>
                <span className="text-lg font-bold text-green-600">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
            </div>
          )}

          {/* Reason and Location */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason</label>
              <div className="flex items-center">
                {getReasonIcon(reason)}
                <Select value={reason} onValueChange={(value) => setReason(value as MovementReason)}>
                  <SelectTrigger className="ml-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stockInReasons.map(reasonOption => (
                      <SelectItem key={reasonOption.value} value={reasonOption.value}>
                        {reasonOption.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

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
          </div>

          {/* Supplier (only for purchases) */}
          {reason === MovementReason.PURCHASE && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Supplier</label>
              <div className="flex items-center">
                <Truck className="h-4 w-4 text-muted-foreground mr-2" />
                <Select value={supplier} onValueChange={setSupplier}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(sup => (
                      <SelectItem key={sup} value={sup}>{sup}</SelectItem>
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
                  placeholder="PO number, invoice, etc."
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

          {/* Action Buttons */}
          <div className="flex space-x-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button 
              onClick={handleSave}
              disabled={!selectedProduct || quantity <= 0}
              className="bg-green-600 hover:bg-green-700"
            >
              Record Stock In
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

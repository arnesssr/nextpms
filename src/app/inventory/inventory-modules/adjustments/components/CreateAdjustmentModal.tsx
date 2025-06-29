'use client';

import { useState } from 'react';
import { CreateAdjustmentRequest, AdjustmentType, AdjustmentReason } from '../types/adjustments.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  MapPin, 
  Calculator,
  FileText,
  Hash,
  AlertTriangle
} from 'lucide-react';

export interface CreateAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateAdjustmentRequest) => void;
  locations: string[];
}

export function CreateAdjustmentModal({ isOpen, onClose, onSave, locations }: CreateAdjustmentModalProps) {
  const [productName, setProductName] = useState('');
  const [type, setType] = useState<AdjustmentType>(AdjustmentType.INCREASE);
  const [reason, setReason] = useState<AdjustmentReason>(AdjustmentReason.STOCK_FOUND);
  const [quantityBefore, setQuantityBefore] = useState(0);
  const [quantityAfter, setQuantityAfter] = useState(0);
  const [location, setLocation] = useState(locations.length ? locations[0] : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [batchNumber, setBatchNumber] = useState('');

  const handleSave = () => {
    if (!productName || quantityBefore < 0 || quantityAfter < 0 || !location) return;

    const request: CreateAdjustmentRequest = {
      productId: 'mock-product-id', // In a real app, this would be selected from a product picker
      type,
      reason,
      quantityBefore,
      quantityAfter,
      location,
      reference,
      notes,
      batchNumber: batchNumber || undefined,
    };

    onSave(request);
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setProductName('');
    setType(AdjustmentType.INCREASE);
    setReason(AdjustmentReason.STOCK_FOUND);
    setQuantityBefore(0);
    setQuantityAfter(0);
    setLocation(locations.length ? locations[0] : '');
    setReference('');
    setNotes('');
    setBatchNumber('');
  };

  const quantityChange = quantityAfter - quantityBefore;

  // Get available reasons based on adjustment type
  const getAvailableReasons = (adjustmentType: AdjustmentType) => {
    const increaseReasons = [
      { value: AdjustmentReason.STOCK_FOUND, label: 'Stock Found' },
      { value: AdjustmentReason.RETURN_FROM_CUSTOMER, label: 'Customer Return' },
      { value: AdjustmentReason.SUPPLIER_CREDIT, label: 'Supplier Credit' },
      { value: AdjustmentReason.PRODUCTION_YIELD, label: 'Production Yield' },
      { value: AdjustmentReason.COUNTING_ERROR, label: 'Counting Error' },
    ];

    const decreaseReasons = [
      { value: AdjustmentReason.DAMAGE, label: 'Damage' },
      { value: AdjustmentReason.THEFT, label: 'Theft' },
      { value: AdjustmentReason.EXPIRY, label: 'Expiry' },
      { value: AdjustmentReason.QUALITY_ISSUE, label: 'Quality Issue' },
      { value: AdjustmentReason.SHRINKAGE, label: 'Shrinkage' },
      { value: AdjustmentReason.SAMPLE_USED, label: 'Sample Used' },
      { value: AdjustmentReason.DISPOSAL, label: 'Disposal' },
    ];

    const recountReasons = [
      { value: AdjustmentReason.CYCLE_COUNT, label: 'Cycle Count' },
      { value: AdjustmentReason.PHYSICAL_INVENTORY, label: 'Physical Inventory' },
      { value: AdjustmentReason.SYSTEM_ERROR, label: 'System Error' },
      { value: AdjustmentReason.RECONCILIATION, label: 'Reconciliation' },
    ];

    switch (adjustmentType) {
      case AdjustmentType.INCREASE:
        return increaseReasons;
      case AdjustmentType.DECREASE:
        return decreaseReasons;
      case AdjustmentType.RECOUNT:
        return [...increaseReasons, ...decreaseReasons, ...recountReasons];
      default:
        return [...increaseReasons, ...decreaseReasons, ...recountReasons];
    }
  };

  // Update type based on quantity change
  const handleQuantityChange = (newQuantityAfter: number) => {
    setQuantityAfter(newQuantityAfter);
    const change = newQuantityAfter - quantityBefore;
    
    if (change > 0) {
      setType(AdjustmentType.INCREASE);
      if (!getAvailableReasons(AdjustmentType.INCREASE).find(r => r.value === reason)) {
        setReason(AdjustmentReason.STOCK_FOUND);
      }
    } else if (change < 0) {
      setType(AdjustmentType.DECREASE);
      if (!getAvailableReasons(AdjustmentType.DECREASE).find(r => r.value === reason)) {
        setReason(AdjustmentReason.DAMAGE);
      }
    } else {
      setType(AdjustmentType.RECOUNT);
    }
  };

  const handleTypeChange = (newType: AdjustmentType) => {
    setType(newType);
    const availableReasons = getAvailableReasons(newType);
    if (!availableReasons.find(r => r.value === reason)) {
      setReason(availableReasons[0].value);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Stock Adjustment</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Product Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="productName">Product Name</label>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Enter product name..."
                id="productName"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="quantityBefore">Current Quantity</label>
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Current stock..."
                  id="quantityBefore"
                  type="number"
                  value={quantityBefore}
                  onChange={(e) => setQuantityBefore(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="quantityAfter">New Quantity</label>
              <div className="flex items-center">
                <Calculator className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="New stock..."
                  id="quantityAfter"
                  type="number"
                  value={quantityAfter}
                  onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>

          {/* Quantity Change Display */}
          {quantityChange !== 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Change:</span>
                <span className={`font-semibold ${quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {quantityChange > 0 ? '+' : ''}{quantityChange} units
                </span>
              </div>
            </div>
          )}

          {/* Type and Reason */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="type">Adjustment Type</label>
              <Select value={type} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={AdjustmentType.INCREASE}>Increase</SelectItem>
                  <SelectItem value={AdjustmentType.DECREASE}>Decrease</SelectItem>
                  <SelectItem value={AdjustmentType.RECOUNT}>Recount</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="reason">Reason</label>
              <Select value={reason} onValueChange={(value) => setReason(value as AdjustmentReason)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableReasons(type).map(reasonOption => (
                    <SelectItem key={reasonOption.value} value={reasonOption.value}>
                      {reasonOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="location">Location</label>
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

          {/* Reference */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="reference">Reference #</label>
            <div className="flex items-center">
              <Hash className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Enter reference..."
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          {/* Batch Number */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="batchNumber">Batch Number (Optional)</label>
            <div className="flex items-center">
              <Package className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Enter batch number..."
                id="batchNumber"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="notes">Notes</label>
            <div className="flex items-start">
              <FileText className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
              <Textarea
                placeholder="Enter detailed notes about this adjustment..."
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Warning for significant decreases */}
          {quantityChange < -10 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm text-amber-700">
                  Large stock decrease detected. Please ensure this adjustment is accurate and properly documented.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave} disabled={!productName || quantityBefore < 0 || quantityAfter < 0 || !location}>
              Create Adjustment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

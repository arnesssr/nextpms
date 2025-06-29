'use client';

import { useState } from 'react';
import { CreateMovementRequest, MovementType, MovementReason } from '../types/movements.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  MapPin, 
  Users,
  Calendar,
  FileText,
  Hash,
  AlertTriangle
} from 'lucide-react';

export interface StockOutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateMovementRequest) => void;
  locations: string[];
  customers: string[];
}

export function StockOutModal({ isOpen, onClose, onSave, locations, customers }: StockOutModalProps) {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [location, setLocation] = useState(locations.length ? locations[0] : '');
  const [reason, setReason] = useState<MovementReason>(MovementReason.SALE);
  const [customer, setCustomer] = useState(customers.length ? customers[0] : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!productName || quantity <= 0 || !location) return;

    const request: CreateMovementRequest = {
      productId: 'mock-product-id', // In a real app, this would be fetched
      type: MovementType.OUT,
      quantity,
      reason,
      location,
      reference,
      notes,
      customer: reason === MovementReason.SALE ? customer : undefined,
    };

    onSave(request);
    onClose();
  };

  // Stock out reasons
  const stockOutReasons = [
    { value: MovementReason.SALE, label: 'Sale' },
    { value: MovementReason.RETURN_TO_SUPPLIER, label: 'Return to Supplier' },
    { value: MovementReason.TRANSFER_OUT, label: 'Transfer Out' },
    { value: MovementReason.DAMAGED, label: 'Damaged' },
    { value: MovementReason.EXPIRED, label: 'Expired' },
    { value: MovementReason.LOST, label: 'Lost' },
    { value: MovementReason.SAMPLE, label: 'Sample' },
    { value: MovementReason.INTERNAL_USE, label: 'Internal Use' },
    { value: MovementReason.ADJUSTMENT_OUT, label: 'Adjustment Out' }
  ];

  const getReasonIcon = (reason: MovementReason) => {
    switch (reason) {
      case MovementReason.DAMAGED:
      case MovementReason.EXPIRED:
      case MovementReason.LOST:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Stock Out</DialogTitle>
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

          {/* Quantity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="quantity">Quantity</label>
              <div className="flex items-center">
                <Hash className="h-4 w-4 text-muted-foreground mr-2" />
                <Input
                  placeholder="Enter quantity..."
                  id="quantity"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="unitOfMeasure">Unit of Measure</label>
              <Select value={unitOfMeasure} onValueChange={setUnitOfMeasure}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pcs">pcs</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="boxes">boxes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="reason">Reason</label>
            <div className="flex items-center">
              {getReasonIcon(reason)}
              <div className="ml-2 flex-1">
                <Select value={reason} onValueChange={(value) => setReason(value as MovementReason)}>
                  <SelectTrigger>
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

          {/* Customer (only for sales) */}
          {reason === MovementReason.SALE && (
            <div className="space-y-1">
              <label className="text-sm font-medium" htmlFor="customer">Customer</label>
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

          {/* Reference */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="reference">Reference #</label>
            <div className="flex items-center">
              <FileText className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Enter reference..."
                id="reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="notes">Notes</label>
            <div className="flex items-start">
              <Calendar className="h-4 w-4 text-muted-foreground mr-2 mt-0.5" />
              <Textarea
                placeholder="Enter any notes..."
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Warning for problematic reasons */}
          {[MovementReason.DAMAGED, MovementReason.EXPIRED, MovementReason.LOST].includes(reason) && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
                <span className="text-sm text-amber-700">
                  This will reduce stock due to {reason.replace('_', ' ').toLowerCase()}. 
                  Please ensure this is documented properly.
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 justify-end">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSave}>Save</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

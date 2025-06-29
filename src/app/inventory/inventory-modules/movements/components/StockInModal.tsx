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
  Truck,
  Calendar,
  DollarSign,
  FileText,
  Hash
} from 'lucide-react';

export interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (request: CreateMovementRequest) => void;
  locations: string[];
  suppliers: string[];
}

export function StockInModal({ isOpen, onClose, onSave, locations, suppliers }: StockInModalProps) {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState(0);
  const [unitOfMeasure, setUnitOfMeasure] = useState('pcs');
  const [location, setLocation] = useState(locations.length ? locations[0] : '');
  const [supplier, setSupplier] = useState(suppliers.length ? suppliers[0] : '');
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');
  const [unitCost, setUnitCost] = useState(0);

  const handleSave = () => {
    if (!productName || quantity <= 0 || !location) return;

    const request: CreateMovementRequest = {
      productId: 'mock-product-id', // In a real app, this would be fetched
      type: MovementType.IN,
      quantity,
      reason: MovementReason.PURCHASE,
      location,
      reference,
      notes,
      unitCost,
      supplier,
    };

    onSave(request);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Record Stock In</DialogTitle>
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

          {/* Supplier */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="supplier">Supplier</label>
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

          {/* Unit Cost */}
          <div className="space-y-1">
            <label className="text-sm font-medium" htmlFor="unitCost">Unit Cost</label>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                placeholder="Enter unit cost..."
                id="unitCost"
                type="number"
                step="0.01"
                value={unitCost}
                onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

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

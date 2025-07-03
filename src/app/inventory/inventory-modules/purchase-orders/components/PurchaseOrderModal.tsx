import { useState } from 'react';
import { Supplier, PurchaseOrderItem } from '../types/purchase-order.types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PurchaseOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
  products: PurchaseOrderItem[];
}

export default function PurchaseOrderModal({
  isOpen,
  onClose,
  suppliers,
  products
}: PurchaseOrderModalProps) {
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [selectedProducts, setSelectedProducts] = useState<{ id: string; quantity: number }[]>([]);
  const [notes, setNotes] = useState('');

  const handleSupplierChange = (value: string) => setSelectedSupplier(value);
  const handleProductSelection = (id: string) => {
    setSelectedProducts(prev =>
        prev.find(product => product.id === id)
          ? prev.filter(product => product.id !== id)
          : [...prev, { id, quantity: 1 }]
      );
  };

  const handleProductQuantityChange = (id: string, quantity: number) => {
    setSelectedProducts(prev =>
      prev.map(product =>
        product.id === id ? { ...product, quantity } : product
      )
    );
  }

  const handleSubmit = () => {
    // Implement the logic to create a purchase order using the backend API
    console.log('Creating purchase order:', {
      supplier: selectedSupplier,
      products: selectedProducts,
      notes
    });
    // Close the modal after submission
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Purchase Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedSupplier} onValueChange={handleSupplierChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a Supplier" />
            </SelectTrigger>
            <SelectContent>
              {suppliers.map(supplier => (
                <SelectItem key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div>
            {products.map(product => (
              <div key={product.id} className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedProducts.some(p => p.id === product.id)}
                  onChange={() => handleProductSelection(product.id)}
                />
                <span className="flex-1">{product.productName} (SKU: {product.productSku})</span>
                <Input
                  type="number"
                  value={selectedProducts.find(p => p.id === product.id)?.quantity || 0}
                  onChange={(e) => handleProductQuantityChange(product.id, parseInt(e.target.value))}
                  disabled={!selectedProducts.some(p => p.id === product.id)}
                  className="w-16"
                />
              </div>
            ))}
          </div>

          <Textarea
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full"
          />

          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Create Order</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}


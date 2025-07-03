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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle, MapPin, Package, ArrowRight, Truck, Info } from 'lucide-react';
import { InventoryItem } from '@/types';

interface ChangeLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onSuccess?: () => void;
}

interface Location {
  id: string;
  name: string;
  type: 'warehouse' | 'zone' | 'shelf';
  capacity?: number;
  currentItems?: number;
  isActive: boolean;
}

export function ChangeLocationModal({ isOpen, onClose, item, onSuccess }: ChangeLocationModalProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const [quantityToMove, setQuantityToMove] = useState<number>(0);
  const [moveReason, setMoveReason] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when item changes
  useEffect(() => {
    if (item) {
      setQuantityToMove(item.quantity || 0);
      setMoveReason('transfer');
      setNotes('');
      setSelectedLocationId('');
      setError(null);
      fetchLocations();
    }
  }, [item]);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      // Fetch warehouses as locations
      const response = await fetch('/api/warehouses');
      if (!response.ok) {
        throw new Error('Failed to fetch locations');
      }
      const data = await response.json();
      
      // Transform warehouses to location format
      const locationData = data.data?.map((warehouse: any) => ({
        id: warehouse.id,
        name: warehouse.name,
        type: 'warehouse' as const,
        capacity: warehouse.max_capacity,
        currentItems: warehouse.current_items || 0,
        isActive: warehouse.is_active
      })) || [];
      
      // Filter out current location and only show active locations
      const filteredLocations = locationData.filter((loc: Location) => 
        loc.isActive && loc.id !== item?.location
      );
      
      setLocations(filteredLocations);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch locations');
    } finally {
      setLoading(false);
    }
  };

  const selectedLocation = locations.find(loc => loc.id === selectedLocationId);
  const canMove = selectedLocationId && quantityToMove > 0 && quantityToMove <= (item?.quantity || 0);

  const handleMove = async () => {
    if (!item || !selectedLocation || !canMove) return;

    setSaving(true);
    setError(null);

    try {
      // Create a movement record
      const movementData = {
        inventory_item_id: item.id,
        product_id: item.productId || item.id,
        movement_type: 'transfer',
        quantity_change: 0, // For location change, quantity doesn't change
        quantity_before: item.quantity,
        quantity_after: item.quantity,
        from_location: item.location,
        to_location: selectedLocation.name,
        reason: moveReason,
        notes: notes,
        reference_number: `MOVE-${Date.now()}`,
        created_by: 'current_user' // You might want to get this from auth context
      };

      // Record the movement
      const movementResponse = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movementData)
      });

      if (!movementResponse.ok) {
        console.warn('Failed to record movement, but continuing with location change');
      }

      // Update the inventory item location
      const updateResponse = await fetch(`/api/inventory/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          location_id: selectedLocationId,
          location_name: selectedLocation.name,
          quantity_on_hand: quantityToMove
        })
      });

      if (!updateResponse.ok) {
        throw new Error('Failed to update item location');
      }

      console.log('Location changed successfully');
      onSuccess?.();
      onClose();
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change location');
    } finally {
      setSaving(false);
    }
  };

  const getMoveTypeColor = (reason: string) => {
    switch (reason) {
      case 'transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'rebalance': return 'bg-green-100 text-green-800 border-green-200';
      case 'consolidation': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maintenance': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            <span>Change Location</span>
          </DialogTitle>
          <DialogDescription>
            Move {item.product?.name} to a different location
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Item Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Item Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Product:</span>
                <span className="text-sm">{item.product?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">SKU:</span>
                <span className="text-sm">{item.product?.sku}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Location:</span>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  <MapPin className="h-3 w-3 mr-1" />
                  {item.location}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Available Quantity:</span>
                <span className="text-lg font-bold">{item.quantity}</span>
              </div>
            </CardContent>
          </Card>

          {/* Move Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Move Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Destination Location */}
              <div className="space-y-2">
                <Label htmlFor="location">Destination Location</Label>
                {loading ? (
                  <div className="flex items-center space-x-2 p-3 border rounded">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                    <span className="text-sm">Loading locations...</span>
                  </div>
                ) : (
                  <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{location.name}</span>
                            {location.capacity && (
                              <span className="text-xs text-muted-foreground ml-2">
                                {location.currentItems}/{location.capacity}
                              </span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Quantity to Move */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity to Move</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={item.quantity}
                  value={quantityToMove}
                  onChange={(e) => setQuantityToMove(Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum: {item.quantity} units available
                </p>
              </div>

              {/* Move Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Move</Label>
                <Select value={moveReason} onValueChange={setMoveReason}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="transfer">Stock Transfer</SelectItem>
                    <SelectItem value="rebalance">Inventory Rebalancing</SelectItem>
                    <SelectItem value="consolidation">Space Consolidation</SelectItem>
                    <SelectItem value="maintenance">Maintenance/Repair</SelectItem>
                    <SelectItem value="optimization">Space Optimization</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any additional notes about this move..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Move Preview */}
          {selectedLocation && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Move Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-blue-600 border-blue-200">
                      <MapPin className="h-3 w-3 mr-1" />
                      {item.location}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                    <Badge variant="outline" className="text-green-600 border-green-200">
                      <MapPin className="h-3 w-3 mr-1" />
                      {selectedLocation.name}
                    </Badge>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{quantityToMove} units</div>
                    <Badge className={getMoveTypeColor(moveReason)}>
                      <Truck className="h-3 w-3 mr-1" />
                      {moveReason.charAt(0).toUpperCase() + moveReason.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                {selectedLocation.capacity && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Info className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-yellow-800">
                        Destination capacity: {selectedLocation.currentItems + quantityToMove}/{selectedLocation.capacity} after move
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-red-600 text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleMove} 
            disabled={saving || !canMove}
          >
            {saving ? 'Moving...' : `Move to ${selectedLocation?.name || 'Location'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

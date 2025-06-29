'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  MoreHorizontal, 
  Edit, 
  Copy, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Package,
  MapPin,
  Clock,
  Plus,
  Minus
} from 'lucide-react';
import { InventoryItem, Product } from '@/types';

interface EnhancedInventoryItem extends InventoryItem {
  product?: Product;
}

interface InventoryTableProps {
  inventory: EnhancedInventoryItem[];
  onStockAdjustment: (item: InventoryItem) => void;
}

export function InventoryTable({ inventory, onStockAdjustment }: InventoryTableProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const getStockStatus = (item: EnhancedInventoryItem) => {
    if (item.quantity === 0) {
      return {
        status: 'out-of-stock',
        label: 'Out of Stock',
        color: 'bg-red-100 text-red-800 border-red-200',
        icon: <AlertTriangle className="h-3 w-3" />
      };
    }
    if (item.quantity <= item.lowStockThreshold) {
      return {
        status: 'low-stock',
        label: 'Low Stock',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        icon: <TrendingDown className="h-3 w-3" />
      };
    }
    return {
      status: 'in-stock',
      label: 'In Stock',
      color: 'bg-green-100 text-green-800 border-green-200',
      icon: <TrendingUp className="h-3 w-3" />
    };
  };

  const getStockProgress = (item: EnhancedInventoryItem) => {
    const maxStock = item.lowStockThreshold * 3; // Assume 3x threshold is "full"
    return Math.min((item.quantity / maxStock) * 100, 100);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === inventory.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(inventory.map(item => item.id));
    }
  };

  const handleQuickAdjustment = (item: EnhancedInventoryItem, type: 'increment' | 'decrement') => {
    // TODO: Implement quick stock adjustment
    console.log('Quick adjustment:', item.id, type);
  };

  const handleReorderPoint = (item: EnhancedInventoryItem) => {
    // TODO: Implement reorder point calculation
    console.log('Setting reorder point for:', item.id);
  };

  return (
    <div className="space-y-4">
      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="flex items-center space-x-2 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <span className="text-sm text-blue-800">
            {selectedItems.length} item(s) selected
          </span>
          <Button size="sm" variant="outline">
            Bulk Adjust Stock
          </Button>
          <Button size="sm" variant="outline">
            Update Thresholds
          </Button>
          <Button size="sm" variant="outline">
            Export Selected
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => setSelectedItems([])}
          >
            Clear Selection
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <input
                  type="checkbox"
                  checked={selectedItems.length === inventory.length && inventory.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Reserved</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="w-[120px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inventory.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  No inventory items found
                </TableCell>
              </TableRow>
            ) : (
              inventory.map((item) => {
                const stockStatus = getStockStatus(item);
                const stockProgress = getStockProgress(item);
                const itemValue = item.quantity * (item.product?.price || 0);
                
                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(item.id)}
                        onChange={() => handleSelectItem(item.id)}
                        className="rounded border-gray-300"
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={item.product?.images[0]} alt={item.product?.name} />
                          <AvatarFallback>
                            {item.product?.name?.substring(0, 2).toUpperCase() || 'PR'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{item.product?.name || 'Unknown Product'}</div>
                          <div className="text-sm text-muted-foreground">
                            SKU: {item.product?.sku || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`${stockStatus.color} flex items-center gap-1 w-fit`}
                      >
                        {stockStatus.icon}
                        {stockStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.quantity}</span>
                          <span className="text-sm text-muted-foreground">
                            / {item.lowStockThreshold} min
                          </span>
                        </div>
                        <Progress 
                          value={stockProgress} 
                          className="h-2"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      {item.reservedQuantity > 0 ? (
                        <Badge variant="outline" className="text-blue-600 border-blue-200">
                          {item.reservedQuantity} reserved
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{item.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatPrice(itemValue)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span className="text-sm">{formatDate(item.lastUpdated)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        {/* Quick adjustment buttons */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuickAdjustment(item, 'decrement')}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleQuickAdjustment(item, 'increment')}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        
                        {/* More actions dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-7 w-7 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(item.id)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onStockAdjustment(item)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Adjust Stock
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleReorderPoint(item)}>
                              <Package className="mr-2 h-4 w-4" />
                              Set Reorder Point
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <TrendingUp className="mr-2 h-4 w-4" />
                              View History
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="mr-2 h-4 w-4" />
                              Change Location
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination would go here */}
      {inventory.length > 0 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Showing {inventory.length} item(s)</span>
          {/* Add pagination controls here when needed */}
        </div>
      )}
    </div>
  );
}

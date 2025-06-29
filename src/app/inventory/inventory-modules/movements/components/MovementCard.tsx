'use client';

import { Movement, MovementType, MovementReason } from '../types/movements.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  ArrowDown, 
  ArrowLeftRight, 
  Trash2, 
  Eye,
  Package,
  User,
  MapPin,
  FileText,
  Calendar,
  Hash,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';

interface MovementCardProps {
  movement: Movement;
  onDelete?: (id: string) => void;
  onView?: (movement: Movement) => void;
  showActions?: boolean;
  compact?: boolean;
}

export function MovementCard({ 
  movement, 
  onDelete, 
  onView, 
  showActions = true,
  compact = false 
}: MovementCardProps) {
  const getMovementTypeIcon = (type: MovementType) => {
    switch (type) {
      case MovementType.IN:
        return <ArrowUp className="h-4 w-4" />;
      case MovementType.OUT:
        return <ArrowDown className="h-4 w-4" />;
      case MovementType.TRANSFER:
        return <ArrowLeftRight className="h-4 w-4" />;
      case MovementType.ADJUSTMENT:
        return <Package className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getMovementTypeColor = (type: MovementType) => {
    switch (type) {
      case MovementType.IN:
        return 'bg-green-100 text-green-800 border-green-200';
      case MovementType.OUT:
        return 'bg-red-100 text-red-800 border-red-200';
      case MovementType.TRANSFER:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case MovementType.ADJUSTMENT:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonLabel = (reason: MovementReason) => {
    const labels: Record<MovementReason, string> = {
      [MovementReason.PURCHASE]: 'Purchase',
      [MovementReason.RETURN_FROM_CUSTOMER]: 'Customer Return',
      [MovementReason.TRANSFER_IN]: 'Transfer In',
      [MovementReason.PRODUCTION]: 'Production',
      [MovementReason.ADJUSTMENT_IN]: 'Adjustment In',
      [MovementReason.SALE]: 'Sale',
      [MovementReason.RETURN_TO_SUPPLIER]: 'Return to Supplier',
      [MovementReason.TRANSFER_OUT]: 'Transfer Out',
      [MovementReason.DAMAGED]: 'Damaged',
      [MovementReason.EXPIRED]: 'Expired',
      [MovementReason.LOST]: 'Lost',
      [MovementReason.ADJUSTMENT_OUT]: 'Adjustment Out',
      [MovementReason.SAMPLE]: 'Sample',
      [MovementReason.INTERNAL_USE]: 'Internal Use'
    };
    return labels[reason] || reason;
  };

  const formatQuantityChange = () => {
    const sign = movement.type === MovementType.IN ? '+' : '-';
    return `${sign}${movement.quantity} ${movement.unitOfMeasure}`;
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getMovementTypeColor(movement.type)}`}>
                {getMovementTypeIcon(movement.type)}
              </div>
              <div>
                <p className="font-medium text-sm">{movement.productName}</p>
                <p className="text-xs text-muted-foreground">{movement.productSku}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`font-semibold text-sm ${
                movement.type === MovementType.IN ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatQuantityChange()}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(movement.timestamp), 'MMM dd, HH:mm')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full ${getMovementTypeColor(movement.type)}`}>
              {getMovementTypeIcon(movement.type)}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{movement.productName}</h4>
              <p className="text-sm text-muted-foreground">{movement.productSku}</p>
              <Badge variant="outline" className="mt-1">
                {getReasonLabel(movement.reason)}
              </Badge>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(movement)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(movement.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Quantity Change */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Quantity Change</p>
              <p className={`text-xl font-bold ${
                movement.type === MovementType.IN ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatQuantityChange()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Stock Level</p>
              <p className="text-lg font-semibold">
                {movement.beforeQuantity} → {movement.afterQuantity}
              </p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{movement.location}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">User</p>
              <p className="text-sm font-medium">{movement.userName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="text-sm font-medium">
                {format(new Date(movement.timestamp), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          {movement.totalCost && (
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Cost</p>
                <p className="text-sm font-medium">${movement.totalCost.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reference and Notes */}
        {(movement.reference || movement.notes) && (
          <div className="space-y-2 pt-4 border-t">
            {movement.reference && (
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="text-sm font-medium">{movement.reference}</p>
                </div>
              </div>
            )}
            
            {movement.notes && (
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{movement.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        {(movement.supplier || movement.customer || movement.batchNumber) && (
          <div className="grid grid-cols-1 gap-2 pt-4 border-t mt-4">
            {movement.supplier && (
              <div>
                <span className="text-xs text-muted-foreground">Supplier: </span>
                <span className="text-sm font-medium">{movement.supplier}</span>
              </div>
            )}
            
            {movement.customer && (
              <div>
                <span className="text-xs text-muted-foreground">Customer: </span>
                <span className="text-sm font-medium">{movement.customer}</span>
              </div>
            )}
            
            {movement.batchNumber && (
              <div>
                <span className="text-xs text-muted-foreground">Batch: </span>
                <span className="text-sm font-medium">{movement.batchNumber}</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

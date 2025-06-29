'use client';

import { Adjustment, AdjustmentType, AdjustmentReason, AdjustmentStatus } from '../types/adjustments.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowUp, 
  ArrowDown, 
  RotateCcw, 
  Trash2, 
  Eye,
  Edit,
  Check,
  X,
  Package,
  User,
  MapPin,
  FileText,
  Calendar,
  Hash,
  DollarSign,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format } from 'date-fns';

interface AdjustmentCardProps {
  adjustment: Adjustment;
  onDelete?: (id: string) => void;
  onEdit?: (adjustment: Adjustment) => void;
  onView?: (adjustment: Adjustment) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showActions?: boolean;
  compact?: boolean;
  canApprove?: boolean;
}

export function AdjustmentCard({ 
  adjustment, 
  onDelete, 
  onEdit,
  onView, 
  onApprove,
  onReject,
  showActions = true,
  compact = false,
  canApprove = false
}: AdjustmentCardProps) {
  const getAdjustmentTypeIcon = (type: AdjustmentType) => {
    switch (type) {
      case AdjustmentType.INCREASE:
        return <ArrowUp className="h-4 w-4" />;
      case AdjustmentType.DECREASE:
        return <ArrowDown className="h-4 w-4" />;
      case AdjustmentType.RECOUNT:
        return <RotateCcw className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getAdjustmentTypeColor = (type: AdjustmentType) => {
    switch (type) {
      case AdjustmentType.INCREASE:
        return 'bg-green-100 text-green-800 border-green-200';
      case AdjustmentType.DECREASE:
        return 'bg-red-100 text-red-800 border-red-200';
      case AdjustmentType.RECOUNT:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: AdjustmentStatus) => {
    switch (status) {
      case AdjustmentStatus.PENDING:
        return <Clock className="h-4 w-4" />;
      case AdjustmentStatus.APPROVED:
        return <CheckCircle className="h-4 w-4" />;
      case AdjustmentStatus.REJECTED:
        return <XCircle className="h-4 w-4" />;
      case AdjustmentStatus.DRAFT:
        return <Edit className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: AdjustmentStatus) => {
    switch (status) {
      case AdjustmentStatus.PENDING:
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case AdjustmentStatus.APPROVED:
        return 'bg-green-100 text-green-800 border-green-200';
      case AdjustmentStatus.REJECTED:
        return 'bg-red-100 text-red-800 border-red-200';
      case AdjustmentStatus.DRAFT:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReasonLabel = (reason: AdjustmentReason) => {
    const labels: Record<AdjustmentReason, string> = {
      [AdjustmentReason.STOCK_FOUND]: 'Stock Found',
      [AdjustmentReason.RETURN_FROM_CUSTOMER]: 'Customer Return',
      [AdjustmentReason.SUPPLIER_CREDIT]: 'Supplier Credit',
      [AdjustmentReason.PRODUCTION_YIELD]: 'Production Yield',
      [AdjustmentReason.COUNTING_ERROR]: 'Counting Error',
      [AdjustmentReason.DAMAGE]: 'Damage',
      [AdjustmentReason.THEFT]: 'Theft',
      [AdjustmentReason.EXPIRY]: 'Expiry',
      [AdjustmentReason.QUALITY_ISSUE]: 'Quality Issue',
      [AdjustmentReason.SHRINKAGE]: 'Shrinkage',
      [AdjustmentReason.SAMPLE_USED]: 'Sample Used',
      [AdjustmentReason.DISPOSAL]: 'Disposal',
      [AdjustmentReason.CYCLE_COUNT]: 'Cycle Count',
      [AdjustmentReason.PHYSICAL_INVENTORY]: 'Physical Inventory',
      [AdjustmentReason.SYSTEM_ERROR]: 'System Error',
      [AdjustmentReason.RECONCILIATION]: 'Reconciliation'
    };
    return labels[reason] || reason;
  };

  const formatQuantityChange = () => {
    const sign = adjustment.quantityChange >= 0 ? '+' : '';
    return `${sign}${adjustment.quantityChange} ${adjustment.unitOfMeasure}`;
  };

  const formatCostImpact = () => {
    if (!adjustment.costImpact) return null;
    const sign = adjustment.costImpact >= 0 ? '+' : '';
    return `${sign}$${Math.abs(adjustment.costImpact).toFixed(2)}`;
  };

  const isPendingApproval = adjustment.status === AdjustmentStatus.PENDING;
  const canEdit = adjustment.status === AdjustmentStatus.DRAFT || adjustment.status === AdjustmentStatus.REJECTED;
  const canDelete = adjustment.status === AdjustmentStatus.DRAFT || adjustment.status === AdjustmentStatus.REJECTED;

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getAdjustmentTypeColor(adjustment.type)}`}>
                {getAdjustmentTypeIcon(adjustment.type)}
              </div>
              <div>
                <p className="font-medium text-sm">{adjustment.productName}</p>
                <p className="text-xs text-muted-foreground">{adjustment.productSku}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className={getStatusColor(adjustment.status)}>
                {getStatusIcon(adjustment.status)}
                <span className="ml-1 capitalize">{adjustment.status}</span>
              </Badge>
              <div className="text-right">
                <p className={`font-semibold text-sm ${
                  adjustment.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatQuantityChange()}
                </p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(adjustment.createdAt), 'MMM dd')}
                </p>
              </div>
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
            <div className={`p-3 rounded-full ${getAdjustmentTypeColor(adjustment.type)}`}>
              {getAdjustmentTypeIcon(adjustment.type)}
            </div>
            <div>
              <h4 className="font-semibold text-lg">{adjustment.productName}</h4>
              <p className="text-sm text-muted-foreground">{adjustment.productSku}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">
                  {getReasonLabel(adjustment.reason)}
                </Badge>
                <Badge variant="outline" className={getStatusColor(adjustment.status)}>
                  {getStatusIcon(adjustment.status)}
                  <span className="ml-1 capitalize">{adjustment.status}</span>
                </Badge>
              </div>
            </div>
          </div>
          
          {showActions && (
            <div className="flex space-x-2">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(adjustment)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              {canEdit && onEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(adjustment)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canApprove && isPendingApproval && onApprove && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApprove(adjustment.id)}
                  className="text-green-600 hover:text-green-700"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {canApprove && isPendingApproval && onReject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onReject(adjustment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(adjustment.id)}
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
                adjustment.quantityChange >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatQuantityChange()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Stock Level</p>
              <p className="text-lg font-semibold">
                {adjustment.quantityBefore} → {adjustment.quantityAfter}
              </p>
            </div>
          </div>
        </div>

        {/* Cost Impact */}
        {adjustment.costImpact && (
          <div className="mb-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Cost Impact</p>
                <p className={`text-lg font-semibold ${
                  adjustment.costImpact >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCostImpact()}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Location</p>
              <p className="text-sm font-medium">{adjustment.location}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created By</p>
              <p className="text-sm font-medium">{adjustment.userName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">
                {format(new Date(adjustment.createdAt), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>

          {adjustment.approvedBy && (
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Approved By</p>
                <p className="text-sm font-medium">{adjustment.approvedBy}</p>
              </div>
            </div>
          )}
        </div>

        {/* Reference and Notes */}
        {(adjustment.reference || adjustment.notes) && (
          <div className="space-y-2 pt-4 border-t">
            {adjustment.reference && (
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="text-sm font-medium">{adjustment.reference}</p>
                </div>
              </div>
            )}
            
            {adjustment.notes && (
              <div className="flex items-start space-x-2">
                <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-xs text-muted-foreground">Notes</p>
                  <p className="text-sm">{adjustment.notes}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Additional Info */}
        {adjustment.batchNumber && (
          <div className="pt-4 border-t mt-4">
            <div>
              <span className="text-xs text-muted-foreground">Batch: </span>
              <span className="text-sm font-medium">{adjustment.batchNumber}</span>
            </div>
          </div>
        )}

        {/* Warning for negative adjustments */}
        {adjustment.quantityChange < 0 && [
          AdjustmentReason.DAMAGE, 
          AdjustmentReason.THEFT, 
          AdjustmentReason.EXPIRY
        ].includes(adjustment.reason) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
            <div className="flex items-center">
              <AlertTriangle className="h-4 w-4 text-amber-600 mr-2" />
              <span className="text-sm text-amber-700">
                Stock reduction due to {adjustment.reason.replace('_', ' ').toLowerCase()}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

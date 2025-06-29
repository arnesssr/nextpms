'use client';

import { useState } from 'react';
import { Adjustment, AdjustmentFilter, AdjustmentType, AdjustmentReason, AdjustmentStatus } from '../types/adjustments.types';
import { AdjustmentCard } from './AdjustmentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Download,
  Calendar,
  X,
  ArrowUp,
  ArrowDown,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface AdjustmentsListProps {
  adjustments: Adjustment[];
  loading?: boolean;
  onRefresh?: () => void;
  onFilter?: (filter: AdjustmentFilter) => void;
  onDelete?: (id: string) => void;
  onEdit?: (adjustment: Adjustment) => void;
  onView?: (adjustment: Adjustment) => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  showStats?: boolean;
  compact?: boolean;
  canApprove?: boolean;
}

export function AdjustmentsList({
  adjustments,
  loading = false,
  onRefresh,
  onFilter,
  onDelete,
  onEdit,
  onView,
  onApprove,
  onReject,
  showStats = true,
  compact = false,
  canApprove = false
}: AdjustmentsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<AdjustmentType | 'all'>('all');
  const [reasonFilter, setReasonFilter] = useState<AdjustmentReason | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<AdjustmentStatus | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique locations from adjustments
  const locations = [...new Set(adjustments.map(a => a.location))];

  // Apply filters
  const applyFilters = () => {
    const filter: AdjustmentFilter = {};

    if (searchTerm) {
      filter.search = searchTerm;
    }

    if (typeFilter !== 'all') {
      filter.type = typeFilter as AdjustmentType;
    }

    if (reasonFilter !== 'all') {
      filter.reason = reasonFilter as AdjustmentReason;
    }

    if (statusFilter !== 'all') {
      filter.status = statusFilter as AdjustmentStatus;
    }

    if (locationFilter !== 'all') {
      filter.location = locationFilter;
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      switch (dateFilter) {
        case 'today':
          filter.dateFrom = startOfDay(now);
          filter.dateTo = endOfDay(now);
          break;
        case 'week':
          filter.dateFrom = startOfDay(subDays(now, 7));
          filter.dateTo = endOfDay(now);
          break;
        case 'month':
          filter.dateFrom = startOfDay(subDays(now, 30));
          filter.dateTo = endOfDay(now);
          break;
      }
    }

    onFilter?.(filter);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setReasonFilter('all');
    setStatusFilter('all');
    setLocationFilter('all');
    setDateFilter('all');
    onFilter?.({});
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || reasonFilter !== 'all' || statusFilter !== 'all' || locationFilter !== 'all' || dateFilter !== 'all';

  // Calculate stats
  const stats = {
    total: adjustments.length,
    pending: adjustments.filter(a => a.status === AdjustmentStatus.PENDING).length,
    approved: adjustments.filter(a => a.status === AdjustmentStatus.APPROVED).length,
    rejected: adjustments.filter(a => a.status === AdjustmentStatus.REJECTED).length,
    increases: adjustments.filter(a => a.quantityChange > 0).length,
    decreases: adjustments.filter(a => a.quantityChange < 0).length,
    totalCostImpact: adjustments.reduce((sum, a) => sum + (a.costImpact || 0), 0)
  };

  const getTypeLabel = (type: AdjustmentType) => {
    const labels = {
      [AdjustmentType.INCREASE]: 'Increase',
      [AdjustmentType.DECREASE]: 'Decrease',
      [AdjustmentType.RECOUNT]: 'Recount'
    };
    return labels[type];
  };

  const getReasonLabel = (reason: AdjustmentReason) => {
    const labels = {
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
    return labels[reason];
  };

  const getStatusLabel = (status: AdjustmentStatus) => {
    const labels = {
      [AdjustmentStatus.PENDING]: 'Pending',
      [AdjustmentStatus.APPROVED]: 'Approved',
      [AdjustmentStatus.REJECTED]: 'Rejected',
      [AdjustmentStatus.DRAFT]: 'Draft'
    };
    return labels[status];
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Increases</p>
                  <p className="text-2xl font-bold text-green-600">{stats.increases}</p>
                </div>
                <ArrowUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Decreases</p>
                  <p className="text-2xl font-bold text-red-600">{stats.decreases}</p>
                </div>
                <ArrowDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cost Impact</p>
                  <p className={`text-xl font-bold ${stats.totalCostImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${Math.abs(stats.totalCostImpact).toLocaleString()}
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${stats.totalCostImpact >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Adjustment History</CardTitle>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2">
                    {[searchTerm, typeFilter !== 'all', reasonFilter !== 'all', statusFilter !== 'all', locationFilter !== 'all', dateFilter !== 'all']
                      .filter(Boolean).length}
                  </Badge>
                )}
              </Button>
              {onRefresh && (
                <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Search */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search adjustments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
            <Button onClick={applyFilters}>Search</Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters}>
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.values(AdjustmentType).map(type => (
                      <SelectItem key={type} value={type}>
                        {getTypeLabel(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Reason</label>
                <Select value={reasonFilter} onValueChange={setReasonFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Reasons</SelectItem>
                    {Object.values(AdjustmentReason).map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {getReasonLabel(reason)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {Object.values(AdjustmentStatus).map(status => (
                      <SelectItem key={status} value={status}>
                        {getStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Location</label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    {locations.map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">Last 7 Days</SelectItem>
                    <SelectItem value="month">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {/* Adjustments List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading adjustments...</span>
              </div>
            ) : adjustments.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No adjustments found</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              adjustments.map((adjustment) => (
                <AdjustmentCard
                  key={adjustment.id}
                  adjustment={adjustment}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                  onApprove={onApprove}
                  onReject={onReject}
                  compact={compact}
                  canApprove={canApprove}
                />
              ))
            )}
          </div>

          {/* Results Summary */}
          {adjustments.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {adjustments.length} adjustment{adjustments.length !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

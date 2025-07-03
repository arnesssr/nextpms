'use client';

import { useState } from 'react';
import { Movement, MovementFilter, MovementType, MovementReason } from '../types/movements.types';
import { MovementCard } from './MovementCard';
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
  TrendingDown
} from 'lucide-react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';

interface MovementsListProps {
  movements: Movement[];
  loading?: boolean;
  onRefresh?: () => void;
  onFilter?: (filter: MovementFilter) => void;
  onDelete?: (id: string) => void;
  onView?: (movement: Movement) => void;
  showStats?: boolean;
  compact?: boolean;
}

export function MovementsList({
  movements,
  loading = false,
  onRefresh,
  onFilter,
  onDelete,
  onView,
  showStats = true,
  compact = false
}: MovementsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<MovementType | 'all'>('all');
  const [reasonFilter, setReasonFilter] = useState<MovementReason | 'all'>('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique locations from movements
  const locations = [...new Set(movements.map(m => m.location))];

  // Apply filters
  const applyFilters = () => {
    const filter: MovementFilter = {};

    if (searchTerm) {
      filter.search = searchTerm;
    }

    if (typeFilter !== 'all') {
      filter.type = typeFilter as MovementType;
    }

    if (reasonFilter !== 'all') {
      filter.reason = reasonFilter as MovementReason;
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
    setLocationFilter('all');
    setDateFilter('all');
    onFilter?.({});
  };

  const hasActiveFilters = searchTerm || typeFilter !== 'all' || reasonFilter !== 'all' || locationFilter !== 'all' || dateFilter !== 'all';

  // Calculate stats
  const stats = {
    total: movements.length,
    stockIn: movements.filter(m => m.type === MovementType.IN).length,
    stockOut: movements.filter(m => m.type === MovementType.OUT).length,
    transfers: movements.filter(m => m.type === MovementType.TRANSFER).length,
    adjustments: movements.filter(m => m.type === MovementType.ADJUSTMENT).length,
    totalValue: movements.reduce((sum, m) => sum + (m.totalCost || 0), 0)
  };

  const getMovementTypeLabel = (type: MovementType) => {
    const labels = {
      [MovementType.IN]: 'Stock In',
      [MovementType.OUT]: 'Stock Out',
      [MovementType.TRANSFER]: 'Transfer',
      [MovementType.ADJUSTMENT]: 'Adjustment'
    };
    return labels[type];
  };

  const getReasonLabel = (reason: MovementReason) => {
    const labels = {
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
    return labels[reason];
  };

  const exportToCSV = () => {
    const headers = [
      'Date',
      'Item',
      'Type',
      'Reason',
      'Quantity',
      'Unit Cost',
      'Total Cost',
      'Location',
      'User',
      'Reference',
      'Supplier/Customer',
      'Notes'
    ];

    const csvData = movements.map(movement => [
      format(new Date(movement.timestamp), 'yyyy-MM-dd HH:mm:ss'),
      movement.productName || movement.productId,
      getMovementTypeLabel(movement.type),
      getReasonLabel(movement.reason),
      movement.quantity,
      movement.unitCost || 0,
      movement.totalCost || 0,
      movement.location,
      movement.userName || movement.userId,
      movement.reference || '',
      movement.supplier || movement.customer || '',
      movement.notes || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `movements-export-${format(new Date(), 'yyyy-MM-dd')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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
                  <p className="text-sm font-medium text-muted-foreground">Stock In</p>
                  <p className="text-2xl font-bold text-green-600">{stats.stockIn}</p>
                </div>
                <ArrowUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Stock Out</p>
                  <p className="text-2xl font-bold text-red-600">{stats.stockOut}</p>
                </div>
                <ArrowDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Transfers</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.transfers}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Adjustments</p>
                  <p className="text-2xl font-bold text-amber-600">{stats.adjustments}</p>
                </div>
                <Calendar className="h-8 w-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold">${stats.totalValue.toLocaleString()}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Movement History</CardTitle>
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
                    {[searchTerm, typeFilter !== 'all', reasonFilter !== 'all', locationFilter !== 'all', dateFilter !== 'all']
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
              <Button variant="outline" size="sm" onClick={exportToCSV}>
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
                placeholder="Search movements..."
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-2 block">Movement Type</label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {Object.values(MovementType).map(type => (
                      <SelectItem key={type} value={type}>
                        {getMovementTypeLabel(type)}
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
                    {Object.values(MovementReason).map(reason => (
                      <SelectItem key={reason} value={reason}>
                        {getReasonLabel(reason)}
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

          {/* Movements List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading movements...</span>
              </div>
            ) : movements.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No movements found</p>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-2">
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              movements.map((movement) => (
                <MovementCard
                  key={movement.id}
                  movement={movement}
                  onDelete={onDelete}
                  onView={onView}
                  compact={compact}
                />
              ))
            )}
          </div>

          {/* Results Summary */}
          {movements.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Showing {movements.length} movement{movements.length !== 1 ? 's' : ''}
                {hasActiveFilters && ' (filtered)'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

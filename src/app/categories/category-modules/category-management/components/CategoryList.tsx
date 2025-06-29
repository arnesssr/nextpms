'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Grid, 
  List, 
  MoreVertical,
  ChevronDown,
  Download,
  Upload,
  Trash2,
  Edit,
  Eye,
  Copy,
  Archive,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCategories } from '../hooks/useCategories';
import { 
  Category, 
  CategoryFilters, 
  CategoryListProps, 
  CategoryViewMode,
  CategorySortField,
  CategorySortOrder 
} from '../types';

// We'll create these components next
import CategoryCard from './CategoryCard';
import Loading from './Loading';
import EmptyState from './EmptyState';
import ErrorBoundary from './ErrorBoundary';

export const CategoryList: React.FC<CategoryListProps> = ({
  onCreateCategory,
  onEditCategory,
  onDeleteCategory,
  onViewCategory,
  filters: initialFilters,
  showActions = true
}) => {
  const {
    categories,
    loading,
    error,
    stats,
    fetchCategories,
    deleteCategory,
    fetchStats
  } = useCategories();

  // State for UI controls
  const [viewMode, setViewMode] = useState<CategoryViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<CategorySortField>('name');
  const [sortOrder, setSortOrder] = useState<CategorySortOrder>('asc');
  const [activeFilters, setActiveFilters] = useState<CategoryFilters>(initialFilters || {});
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  // Fetch categories on component mount and when filters change
  useEffect(() => {
    const filters: CategoryFilters = {
      ...activeFilters,
      search: searchQuery || undefined,
      sort_by: sortField,
      sort_order: sortOrder,
      limit: 20 // Adjust as needed
    };
    
    fetchCategories(filters);
    fetchStats();
  }, [searchQuery, sortField, sortOrder, activeFilters, fetchCategories, fetchStats]);

  // Memoized filtered and sorted categories
  const processedCategories = useMemo(() => {
    let filtered = [...categories];

    // Apply client-side filtering if needed
    if (activeFilters.is_active !== undefined) {
      filtered = filtered.filter(cat => cat.is_active === activeFilters.is_active);
    }

    if (activeFilters.is_featured !== undefined) {
      filtered = filtered.filter(cat => cat.is_featured === activeFilters.is_featured);
    }

    if (activeFilters.parent_id !== undefined) {
      filtered = filtered.filter(cat => cat.parent_id === activeFilters.parent_id);
    }

    return filtered;
  }, [categories, activeFilters]);

  // Handle search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handle sorting
  const handleSort = (field: CategorySortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Handle filters
  const handleFilterChange = (key: keyof CategoryFilters, value: any) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setSearchQuery('');
  };

  // Handle category actions
  const handleDelete = async (categoryId: string) => {
    if (window.confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
      try {
        await deleteCategory(categoryId);
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedCategories.length === 0) return;

    switch (action) {
      case 'delete':
        if (window.confirm(`Delete ${selectedCategories.length} categories?`)) {
          // Implement bulk delete
          console.log('Bulk delete:', selectedCategories);
        }
        break;
      case 'activate':
        console.log('Bulk activate:', selectedCategories);
        break;
      case 'deactivate':
        console.log('Bulk deactivate:', selectedCategories);
        break;
    }
    setSelectedCategories([]);
  };

  // Handle category selection
  const handleCategorySelect = (categoryId: string, selected: boolean) => {
    if (selected) {
      setSelectedCategories(prev => [...prev, categoryId]);
    } else {
      setSelectedCategories(prev => prev.filter(id => id !== categoryId));
    }
  };

  const selectAllCategories = () => {
    if (selectedCategories.length === processedCategories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories(processedCategories.map(cat => cat.id));
    }
  };

  if (loading && categories.length === 0) {
    return <Loading message="Loading categories..." />;
  }

  if (error) {
    return (
      <ErrorBoundary 
        message={error} 
        onRetry={() => fetchCategories(activeFilters)} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
          <p className="text-gray-600">
            {stats ? (
              `${stats.total_categories} total categories, ${stats.active_categories} active`
            ) : (
              'Manage your product categories'
            )}
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {onCreateCategory && (
            <Button onClick={onCreateCategory}>
              <Plus className="mr-2 h-4 w-4" />
              Create Category
            </Button>
          )}
        </div>
      </div>

      {/* Search and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <Input
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Quick Filters */}
              <Select
                value={activeFilters.is_active?.toString() || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('is_active', value === 'all' ? undefined : value === 'true')
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="true">Active</SelectItem>
                  <SelectItem value="false">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={activeFilters.parent_id || 'all'}
                onValueChange={(value) => 
                  handleFilterChange('parent_id', value === 'all' ? undefined : (value === 'root' ? '' : value))
                }
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Parent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Parents</SelectItem>
                  <SelectItem value="root">Root Categories</SelectItem>
                  {categories
                    .filter(cat => cat.level === 0)
                    .map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => setShowFilterPanel(!showFilterPanel)}
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* View Controls */}
            <div className="flex gap-4 items-center">
              {/* Sort */}
              <Select
                value={`${sortField}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split('-') as [CategorySortField, CategorySortOrder];
                  setSortField(field);
                  setSortOrder(order);
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="product_count-desc">Most Products</SelectItem>
                  <SelectItem value="product_count-asc">Fewest Products</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid size={16} />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List size={16} />
                </Button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchQuery || Object.keys(activeFilters).length > 0) && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary">
                  Search: {searchQuery}
                </Badge>
              )}
              {activeFilters.is_active !== undefined && (
                <Badge variant="secondary">
                  Status: {activeFilters.is_active ? 'Active' : 'Inactive'}
                </Badge>
              )}
              {activeFilters.parent_id && (
                <Badge variant="secondary">
                  Parent: {categories.find(c => c.id === activeFilters.parent_id)?.name}
                </Badge>
              )}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear all
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedCategories.length > 0 && showActions && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {selectedCategories.length} categories selected
                </span>
                <Button variant="ghost" size="sm" onClick={selectAllCategories}>
                  {selectedCategories.length === processedCategories.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                >
                  Activate
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                >
                  <Archive className="mr-2 h-4 w-4" />
                  Deactivate
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Display */}
      {processedCategories.length === 0 ? (
        <EmptyState 
          title="No categories found"
          message="Create your first category to get started"
          onAction={onCreateCategory}
          actionLabel="Create Category"
        />
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
        }>
          {processedCategories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              viewMode={viewMode}
              onEdit={onEditCategory}
              onDelete={handleDelete}
              onView={onViewCategory}
              showActions={showActions}
              isSelected={selectedCategories.includes(category.id)}
              onSelect={(selected) => handleCategorySelect(category.id, selected)}
            />
          ))}
        </div>
      )}

      {/* Loading overlay for additional loads */}
      {loading && categories.length > 0 && (
        <div className="flex justify-center py-4">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading more categories...</span>
          </div>
        </div>
      )}
    </div>
  );
};

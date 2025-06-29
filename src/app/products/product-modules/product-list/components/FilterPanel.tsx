// FilterPanel.tsx
import React, { useState } from 'react';
import { Filter } from 'lucide-react';
import { ProductStatus } from '../../product-catalog/types';

interface FilterPanelProps {
  onFilter: (filters: Record<string, any>) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ onFilter }) => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<ProductStatus | ''>('');

  const handleFilter = () => {
    const filters: Record<string, any> = {};
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedStatus) filters.status = selectedStatus;
    
    onFilter(filters);
  };

  return (
    <div className="flex gap-2">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Categories</option>
        <option value="electronics">Electronics</option>
        <option value="clothing">Clothing</option>
        <option value="books">Books</option>
        <option value="home">Home & Garden</option>
      </select>
      
      <select
        value={selectedStatus}
        onChange={(e) => setSelectedStatus(e.target.value as ProductStatus | '')}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="discontinued">Discontinued</option>
      </select>
      
      <button
        onClick={handleFilter}
        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center space-x-2"
      >
        <Filter size={16} />
        <span>Filter</span>
      </button>
    </div>
  );
};

export default FilterPanel;

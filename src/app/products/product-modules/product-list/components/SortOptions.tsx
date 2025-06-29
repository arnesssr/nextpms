// SortOptions.tsx
import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface SortOptionsProps {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
}

const SortOptions: React.FC<SortOptionsProps> = ({ sortBy, sortOrder, onSortChange }) => {
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'price', label: 'Price' },
    { value: 'stock', label: 'Stock' },
    { value: 'created_at', label: 'Date Added' },
  ];

  const handleSortByChange = (newSortBy: string) => {
    if (newSortBy === sortBy) {
      // Toggle sort order if same field
      onSortChange(sortBy, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with ascending order
      onSortChange(newSortBy, 'asc');
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <ArrowUpDown size={16} className="text-gray-400" />
      <select
        value={sortBy}
        onChange={(e) => handleSortByChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label} {sortBy === option.value && (sortOrder === 'asc' ? '↑' : '↓')}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SortOptions;

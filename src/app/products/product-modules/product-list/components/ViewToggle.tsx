// ViewToggle.tsx
import React from 'react';
import { Grid, List } from 'lucide-react';

interface ViewToggleProps {
  viewMode: 'grid' | 'list';
  onViewChange: (mode: 'grid' | 'list') => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ viewMode, onViewChange }) => {
  return (
    <div className="flex bg-gray-100 rounded-lg p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
          viewMode === 'grid'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Grid size={16} />
        <span className="ml-1 text-sm">Grid</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`flex items-center px-3 py-2 rounded-md transition-colors ${
          viewMode === 'list'
            ? 'bg-white shadow-sm text-gray-900'
            : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <List size={16} />
        <span className="ml-1 text-sm">List</span>
      </button>
    </div>
  );
};

export default ViewToggle;

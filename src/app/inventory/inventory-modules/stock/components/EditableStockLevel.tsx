'use client';

import { useState } from 'react';
import { Check, X, Edit3 } from 'lucide-react';

interface EditableStockLevelProps {
  value: number | null;
  label: string;
  onSave: (newValue: number) => Promise<boolean>;
  min?: number;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}

export default function EditableStockLevel({
  value,
  label,
  onSave,
  min = 0,
  max = 999999,
  placeholder = "Not Set",
  disabled = false
}: EditableStockLevelProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string>(value?.toString() || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    if (disabled) return;
    setIsEditing(true);
    setEditValue(value?.toString() || '');
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditValue(value?.toString() || '');
    setError(null);
  };

  const handleSave = async () => {
    const numValue = parseInt(editValue);
    
    // Validation
    if (editValue && (isNaN(numValue) || numValue < min || numValue > max)) {
      setError(`Value must be between ${min} and ${max}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const success = await onSave(numValue || 0);
      if (success) {
        setIsEditing(false);
      } else {
        setError('Failed to save');
      }
    } catch (err) {
      setError('Error saving value');
      console.error('Error saving stock level:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const displayValue = value && value > 0 ? value.toString() : placeholder;

  if (isEditing) {
    return (
      <div className="flex items-center space-x-1">
        <input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyPress}
          className={`w-16 px-1 py-0.5 text-xs border rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent ${
            error ? 'border-red-300' : 'border-gray-300'
          }`}
          min={min}
          max={max}
          placeholder="0"
          autoFocus
          disabled={isLoading}
        />
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="p-0.5 text-green-600 hover:text-green-800 disabled:opacity-50"
          title="Save"
        >
          <Check className="h-3 w-3" />
        </button>
        <button
          onClick={handleCancel}
          disabled={isLoading}
          className="p-0.5 text-red-600 hover:text-red-800 disabled:opacity-50"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
        {error && (
          <div className="absolute mt-6 text-xs text-red-600 bg-white border border-red-200 rounded px-2 py-1 shadow-lg z-10">
            {error}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 group">
      <span className={`text-xs ${value && value > 0 ? 'text-gray-900' : 'text-gray-400'}`}>
        {label}: {displayValue}
      </span>
      {!disabled && (
        <button
          onClick={handleEdit}
          className="opacity-0 group-hover:opacity-100 p-0.5 text-gray-400 hover:text-gray-600 transition-opacity"
          title={`Edit ${label.toLowerCase()}`}
        >
          <Edit3 className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}

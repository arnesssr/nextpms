'use client';

import { useState } from 'react';
import { SidebarLayout } from '@/components/layout/Sidebar';
import { CategoryModuleTabs } from './components/CategoryModuleTabs';
import { Category, CategoryFormData } from './category-modules/category-management/types';
import { useCategories } from './category-modules/category-management/hooks/useCategories';
import { CategoryForm } from './category-modules/category-management/components';

export default function CategoriesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const { createCategory, updateCategory } = useCategories();

  const handleCreateCategory = () => {
    setShowCreateForm(true);
    setFormError(null);
  };

  const handleCreateSubmit = async (categoryData: CategoryFormData) => {
    setFormLoading(true);
    setFormError(null);
    try {
      await createCategory(categoryData);
      setShowCreateForm(false);
      // Show success message or refresh data
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to create category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowEditForm(true);
    setFormError(null);
  };

  const handleEditSubmit = async (categoryData: CategoryFormData) => {
    if (!editingCategory) return;
    
    setFormLoading(true);
    setFormError(null);
    try {
      await updateCategory(editingCategory.id, categoryData);
      setShowEditForm(false);
      setEditingCategory(null);
      // Show success message or refresh data
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to update category');
    } finally {
      setFormLoading(false);
    }
  };

  const handleViewCategory = (category: Category) => {
    console.log('Viewing category:', category);
    // TODO: Implement category view logic
  };

  const handleDeleteCategory = (categoryId: string) => {
    console.log('Deleting category:', categoryId);
    // TODO: Implement category deletion logic
  };

  const handleCancelForm = () => {
    setShowCreateForm(false);
    setShowEditForm(false);
    setEditingCategory(null);
    setFormError(null);
  };

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <CategoryModuleTabs 
          onCreateCategory={handleCreateCategory}
          onEditCategory={handleEditCategory}
          onViewCategory={handleViewCategory}
          onDeleteCategory={handleDeleteCategory}
        />
        
        {/* Create Category Form Modal */}
        <CategoryForm
          open={showCreateForm}
          onSubmit={handleCreateSubmit}
          onCancel={handleCancelForm}
          isLoading={formLoading}
          error={formError}
        />
        
        {/* Edit Category Form Modal */}
        <CategoryForm
          open={showEditForm}
          category={editingCategory}
          onSubmit={handleEditSubmit}
          onCancel={handleCancelForm}
          isLoading={formLoading}
          error={formError}
        />
      </div>
    </SidebarLayout>
  );
}

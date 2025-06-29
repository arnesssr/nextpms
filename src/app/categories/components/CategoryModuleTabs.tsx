'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderTree, 
  Tags, 
  BarChart3, 
  Settings,
  Target
} from 'lucide-react';

// Import module components
import { CategoryList } from '../category-modules/category-management/components/CategoryList';
import { Category } from '../category-modules/category-management/types';

interface CategoryModuleTabsProps {
  onCreateCategory?: () => void;
  onEditCategory?: (category: Category) => void;
  onViewCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
}

const categoryModules = [
  {
    id: 'management',
    label: 'Category Management',
    icon: FolderTree,
    description: 'Create, edit, and organize your category hierarchy'
  },
  {
    id: 'assignment',
    label: 'Category Assignment',
    icon: Tags,
    description: 'Assign and manage product-category relationships'
  },
  {
    id: 'analytics',
    label: 'Category Analytics',
    icon: BarChart3,
    description: 'View category performance and insights'
  },
  {
    id: 'settings',
    label: 'Category Settings',
    icon: Settings,
    description: 'Configure category rules and templates'
  }
];

export const CategoryModuleTabs: React.FC<CategoryModuleTabsProps> = ({
  onCreateCategory,
  onEditCategory,
  onViewCategory,
  onDeleteCategory
}) => {
  const [activeTab, setActiveTab] = useState('management');

  const renderTabContent = (moduleId: string) => {
    switch (moduleId) {
      case 'management':
        return (
          <CategoryList
            onCreateCategory={onCreateCategory}
            onEditCategory={onEditCategory}
            onViewCategory={onViewCategory}
            onDeleteCategory={onDeleteCategory}
            showActions={true}
          />
        );
      
      case 'assignment':
        return (
          <div className="text-center py-16">
            <Tags className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Category Assignment</h3>
            <p className="text-muted-foreground mb-4">
              Manage product-category relationships and bulk assignments
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Bulk assign categories to products</p>
              <p>• Category selector components</p>
              <p>• Product-category mapping tools</p>
            </div>
          </div>
        );
      
      case 'analytics':
        return (
          <div className="text-center py-16">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Category Analytics</h3>
            <p className="text-muted-foreground mb-4">
              Analyze category performance and product distribution
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Category performance metrics</p>
              <p>• Product distribution charts</p>
              <p>• Sales analytics by category</p>
            </div>
          </div>
        );
      
      case 'settings':
        return (
          <div className="text-center py-16">
            <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Category Settings</h3>
            <p className="text-muted-foreground mb-4">
              Configure category rules, templates, and global settings
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>• Category validation rules</p>
              <p>• Pre-defined category templates</p>
              <p>• Hierarchy depth settings</p>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="text-center py-12">
            <FolderTree className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Module content not available</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4 gap-1 h-auto p-1">
          {categoryModules.map((module) => {
            const IconComponent = module.icon;
            return (
              <TabsTrigger
                key={module.id}
                value={module.id}
                className="flex flex-col items-center justify-center py-3 px-4 space-y-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <IconComponent size={18} />
                <span className="text-xs font-medium hidden sm:block">{module.label}</span>
                <span className="text-xs text-muted-foreground sm:hidden">{module.label.split(' ')[0]}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Tab Content Description */}
        <div className="mt-4">
          {categoryModules.map((module) => (
            <div key={module.id} className={activeTab === module.id ? 'block' : 'hidden'}>
              <div className="flex items-center space-x-2 mb-4">
                <module.icon size={20} className="text-primary" />
                <div>
                  <h3 className="text-lg font-semibold">{module.label}</h3>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Content */}
        {categoryModules.map((module) => (
          <TabsContent key={module.id} value={module.id} className="mt-6">
            {renderTabContent(module.id)}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

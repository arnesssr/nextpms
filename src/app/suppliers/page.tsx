'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Users, Plus, BarChart3, Settings, FileText, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SidebarLayout } from '@/components/layout/Sidebar';

export default function SuppliersPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const supplierModules = [
    {
      title: 'Supplier Management',
      description: 'Manage all your suppliers, contacts, and relationships',
      href: '/suppliers/supplier-modules/supplier-management',
      icon: Users,
      color: 'bg-blue-500',
      stats: {
        total: '150',
        active: '142',
        pending: '8'
      }
    }
  ];

  const quickActions = [
    {
      title: 'Add New Supplier',
      description: 'Register a new supplier',
      icon: Plus,
      action: () => {
        // Navigate to supplier management and trigger create modal
        window.location.href = '/suppliers/supplier-modules/supplier-management?action=create';
      }
    },
    {
      title: 'Supplier Reports',
      description: 'View supplier performance reports',
      icon: BarChart3,
      action: () => {
        // Navigate to reports
        window.location.href = '/suppliers/supplier-modules/supplier-management?tab=reports';
      }
    },
    {
      title: 'Supplier Settings',
      description: 'Configure supplier preferences',
      icon: Settings,
      action: () => {
        // Navigate to settings
        window.location.href = '/suppliers/supplier-modules/supplier-management?tab=settings';
      }
    },
    {
      title: 'Import Suppliers',
      description: 'Bulk import supplier data',
      icon: FileText,
      action: () => {
        // Navigate to import
        window.location.href = '/suppliers/supplier-modules/supplier-management?action=import';
      }
    }
  ];

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Suppliers</h2>
          <p className="text-muted-foreground">
            Manage your supplier relationships and procurement processes
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/suppliers/supplier-modules/supplier-management?action=import'}
          >
            <FileText className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button 
            size="sm"
            onClick={() => window.location.href = '/suppliers/supplier-modules/supplier-management?action=create'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Supplier
          </Button>
        </div>
        {/* Search and Filter Bar */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">150</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900">142</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Review</p>
                  <p className="text-2xl font-bold text-gray-900">8</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-900">4.2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Modules */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Supplier Modules</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {supplierModules.map((module, index) => {
              const IconComponent = module.icon;
              return (
                <Link key={index} href={module.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader>
                      <div className="flex items-center">
                        <div className={`p-3 rounded-lg ${module.color}`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                          <CardDescription>{module.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total: <span className="font-semibold">{module.stats.total}</span></span>
                        <span className="text-green-600">Active: <span className="font-semibold">{module.stats.active}</span></span>
                        <span className="text-yellow-600">Pending: <span className="font-semibold">{module.stats.pending}</span></span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Card 
                  key={index} 
                  className="hover:shadow-md transition-shadow cursor-pointer"
                  onClick={action.action}
                >
                  <CardContent className="p-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="p-3 bg-gray-100 rounded-lg mb-3">
                        <IconComponent className="w-6 h-6 text-gray-600" />
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </SidebarLayout>
  );
}

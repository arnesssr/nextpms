'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Settings, 
  Download,
  Upload,
  Target
} from 'lucide-react';
import { PricingDashboard } from './components/PricingDashboard';

export default function PricingManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleBulkImport = () => {
    console.log('Import pricing data from CSV/Excel');
    // Implement bulk import functionality
  };

  const handleBulkExport = () => {
    console.log('Export pricing data to CSV/Excel');
    // Implement bulk export functionality
  };

  const handlePricingRules = () => {
    console.log('Open pricing rules configuration');
    // Implement pricing rules management
  };

  const handleMarginAnalysis = () => {
    console.log('Open detailed margin analysis');
    // Implement detailed margin analysis
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkImport}
          >
            <Upload className="mr-2 h-4 w-4" />
            Import Prices
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleBulkExport}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Prices
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handlePricingRules}
          >
            <Settings className="mr-2 h-4 w-4" />
            Pricing Rules
          </Button>
          
          <Button onClick={handleMarginAnalysis}>
            <Target className="mr-2 h-4 w-4" />
            Margin Analysis
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Pricing Rules
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <PricingDashboard />
        </TabsContent>

        {/* Pricing Calculator Tab */}
        <TabsContent value="calculator" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Pricing Calculator
                </CardTitle>
                <CardDescription>
                  Calculate optimal prices based on cost and target margins
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Cost Price</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Target Margin (%)</label>
                      <input 
                        type="number" 
                        placeholder="30" 
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Competitor Price</label>
                      <input 
                        type="number" 
                        placeholder="0.00" 
                        className="w-full mt-1 p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Market Position</label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option>Premium (+10%)</option>
                        <option>Competitive (0%)</option>
                        <option>Value (-5%)</option>
                      </select>
                    </div>
                  </div>

                  <Button className="w-full">
                    Calculate Optimal Price
                  </Button>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Results</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Optimal Price:</span>
                        <span className="font-mono">$0.00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Profit Margin:</span>
                        <span className="font-mono">0.0%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Markup:</span>
                        <span className="font-mono">0.0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bulk Price Calculator</CardTitle>
                <CardDescription>
                  Apply pricing formulas to multiple products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Update Type</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>Percentage increase</option>
                      <option>Percentage decrease</option>
                      <option>Fixed amount increase</option>
                      <option>Fixed amount decrease</option>
                      <option>Set target margin</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Value</label>
                    <input 
                      type="number" 
                      placeholder="5.0" 
                      className="w-full mt-1 p-2 border rounded-md"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Apply to</label>
                    <select className="w-full mt-1 p-2 border rounded-md">
                      <option>All products</option>
                      <option>Selected category</option>
                      <option>Low margin products</option>
                      <option>Custom selection</option>
                    </select>
                  </div>

                  <Button className="w-full" variant="outline">
                    Preview Changes
                  </Button>
                  
                  <Button className="w-full">
                    Apply Bulk Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>


        {/* Pricing Rules Tab */}
        <TabsContent value="rules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Automated Pricing Rules
              </CardTitle>
              <CardDescription>
                Set up automated pricing rules based on costs, competition, and margins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Settings className="mx-auto h-12 w-12 mb-4" />
                <p>Pricing rules engine will be implemented here</p>
                <p className="text-sm">Configure automatic price adjustments and rules</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

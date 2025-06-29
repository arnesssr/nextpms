'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Download,
  Eye,
  Calendar,
  Filter,
  PieChart,
  LineChart,
  FileSpreadsheet,
  Mail,
  Clock
} from "lucide-react";

interface Report {
  id: string;
  name: string;
  description: string;
  type: 'stock' | 'movement' | 'financial' | 'analytics';
  format: 'PDF' | 'Excel' | 'CSV';
  lastGenerated: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'on-demand';
  status: 'ready' | 'generating' | 'scheduled' | 'error';
  size?: string;
}

export default function InventoryReportsComponent() {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState('last-30-days');
  const [reportFormat, setReportFormat] = useState('PDF');
  
  const [reports] = useState<Report[]>([
    {
      id: '1',
      name: 'Stock Level Summary',
      description: 'Current stock levels across all locations',
      type: 'stock',
      format: 'PDF',
      lastGenerated: '2024-01-15 09:30:00',
      frequency: 'daily',
      status: 'ready',
      size: '2.3 MB'
    },
    {
      id: '2',
      name: 'Movement Analytics',
      description: 'Detailed analysis of stock movements and trends',
      type: 'movement',
      format: 'Excel',
      lastGenerated: '2024-01-15 08:45:00',
      frequency: 'weekly',
      status: 'ready',
      size: '4.7 MB'
    },
    {
      id: '3',
      name: 'Low Stock Alert Report',
      description: 'Items approaching reorder levels',
      type: 'analytics',
      format: 'PDF',
      lastGenerated: '2024-01-15 10:15:00',
      frequency: 'daily',
      status: 'ready',
      size: '1.8 MB'
    },
    {
      id: '4',
      name: 'Financial Valuation',
      description: 'Total inventory value and cost analysis',
      type: 'financial',
      format: 'Excel',
      lastGenerated: '2024-01-14 23:45:00',
      frequency: 'monthly',
      status: 'generating',
      size: '5.2 MB'
    },
    {
      id: '5',
      name: 'ABC Analysis Report',
      description: 'Product categorization by value and volume',
      type: 'analytics',
      format: 'PDF',
      lastGenerated: '2024-01-13 16:20:00',
      frequency: 'quarterly',
      status: 'scheduled',
      size: '3.1 MB'
    },
    {
      id: '6',
      name: 'Supplier Performance',
      description: 'Analysis of supplier delivery and quality metrics',
      type: 'analytics',
      format: 'Excel',
      lastGenerated: '2024-01-12 14:30:00',
      frequency: 'monthly',
      status: 'error',
      size: '2.9 MB'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <FileText className="h-4 w-4 text-green-500" />;
      case 'generating': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'scheduled': return <Calendar className="h-4 w-4 text-yellow-500" />;
      case 'error': return <FileText className="h-4 w-4 text-red-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800 border-green-200';
      case 'generating': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'stock': return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'movement': return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'financial': return <PieChart className="h-5 w-5 text-purple-500" />;
      case 'analytics': return <LineChart className="h-5 w-5 text-orange-500" />;
      default: return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FileText className="h-4 w-4" />;
      case 'Excel': return <FileSpreadsheet className="h-4 w-4" />;
      case 'CSV': return <FileSpreadsheet className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const readyReports = reports.filter(r => r.status === 'ready').length;
  const generatingReports = reports.filter(r => r.status === 'generating').length;
  const scheduledReports = reports.filter(r => r.status === 'scheduled').length;
  const errorReports = reports.filter(r => r.status === 'error').length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <FileText className="h-8 w-8 mr-3 text-green-600" />
            Inventory Reports
          </h1>
          <p className="text-muted-foreground">
            Generate and manage comprehensive inventory reports and analytics
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Ready</p>
                <p className="text-2xl font-bold text-green-600">{readyReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Generating</p>
                <p className="text-2xl font-bold text-blue-600">{generatingReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Scheduled</p>
                <p className="text-2xl font-bold text-yellow-600">{scheduledReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm font-medium">Errors</p>
                <p className="text-2xl font-bold text-red-600">{errorReports}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Report Generator */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Generator</CardTitle>
          <CardDescription>
            Generate custom reports with specific parameters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="report-type">Report Type</Label>
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger>
                  <SelectValue placeholder="Select report type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stock-summary">Stock Summary</SelectItem>
                  <SelectItem value="movement-analysis">Movement Analysis</SelectItem>
                  <SelectItem value="financial-report">Financial Report</SelectItem>
                  <SelectItem value="abc-analysis">ABC Analysis</SelectItem>
                  <SelectItem value="supplier-performance">Supplier Performance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date-range">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7-days">Last 7 days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 days</SelectItem>
                  <SelectItem value="this-year">This year</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="format">Format</Label>
              <Select value={reportFormat} onValueChange={setReportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="Excel">Excel</SelectItem>
                  <SelectItem value="CSV">CSV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button className="w-full">
                <FileText className="h-4 w-4 mr-2" />
                Generate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>
            Pre-configured report templates for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="h-24 flex-col">
              <BarChart3 className="h-6 w-6 mb-2 text-blue-500" />
              <span className="font-medium">Stock Valuation</span>
              <span className="text-xs text-muted-foreground">Current inventory value</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <TrendingUp className="h-6 w-6 mb-2 text-green-500" />
              <span className="font-medium">Movement Trends</span>
              <span className="text-xs text-muted-foreground">Stock flow analysis</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <TrendingDown className="h-6 w-6 mb-2 text-red-500" />
              <span className="font-medium">Low Stock Alert</span>
              <span className="text-xs text-muted-foreground">Reorder recommendations</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <PieChart className="h-6 w-6 mb-2 text-purple-500" />
              <span className="font-medium">ABC Analysis</span>
              <span className="text-xs text-muted-foreground">Product categorization</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <LineChart className="h-6 w-6 mb-2 text-orange-500" />
              <span className="font-medium">Demand Forecast</span>
              <span className="text-xs text-muted-foreground">Future demand prediction</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col">
              <FileSpreadsheet className="h-6 w-6 mb-2 text-indigo-500" />
              <span className="font-medium">Custom Report</span>
              <span className="text-xs text-muted-foreground">Build your own</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Available Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Available Reports</CardTitle>
          <CardDescription>
            Previously generated reports and scheduled reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(report.type)}
                    <div>
                      <h3 className="font-semibold">{report.name}</h3>
                      <p className="text-sm text-muted-foreground">{report.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusIcon(report.status)}
                      <span className="ml-1 capitalize">{report.status}</span>
                    </Badge>
                    {report.status === 'ready' && (
                      <div className="flex space-x-1">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Type:</span>
                    <br />
                    <span className="capitalize">{report.type}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Format:</span>
                    <br />
                    <div className="flex items-center space-x-1">
                      {getFormatIcon(report.format)}
                      <span>{report.format}</span>
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Frequency:</span>
                    <br />
                    <span className="capitalize">{report.frequency}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Last Generated:</span>
                    <br />
                    {report.lastGenerated}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Size:</span>
                    <br />
                    {report.size}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Automated Reporting</CardTitle>
          <CardDescription>
            Configure automatic report generation and distribution
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-6 w-6 text-blue-500" />
                <div>
                  <h4 className="font-medium">Daily Stock Report</h4>
                  <p className="text-sm text-muted-foreground">Automated daily stock level summary</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Mail className="h-6 w-6 text-purple-500" />
                <div>
                  <h4 className="font-medium">Weekly Management Summary</h4>
                  <p className="text-sm text-muted-foreground">Weekly executive dashboard report</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingDown className="h-6 w-6 text-red-500" />
                <div>
                  <h4 className="font-medium">Low Stock Alerts</h4>
                  <p className="text-sm text-muted-foreground">Instant notifications for reorder points</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  Paused
                </Badge>
                <Button size="sm" variant="outline">Configure</Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Create New Schedule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

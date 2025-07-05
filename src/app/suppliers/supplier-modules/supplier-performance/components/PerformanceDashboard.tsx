'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { usePerformanceDashboard } from '../hooks/useSupplierPerformance';

export function PerformanceDashboard() {
  const { dashboardData, loading, error } = usePerformanceDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading performance dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No performance data available</p>
      </div>
    );
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'average':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Suppliers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.topPerformers.map((supplier) => (
              <div key={supplier.supplierId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{supplier.supplierName}</h3>
                  <div className="flex items-center mt-1">
                    <Badge className={getRatingColor(supplier.rating)}>
                      {supplier.rating.charAt(0).toUpperCase() + supplier.rating.slice(1)}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {supplier.period}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{supplier.overallScore}</div>
                  <div className="flex items-center text-sm">
                    <span className={supplier.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {supplier.trend > 0 ? '+' : ''}{supplier.trend}
                    </span>
                    <span className="ml-1 text-muted-foreground">vs previous</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dashboardData.averageScores.map(metric => ({
                  name: metric.metricName,
                  score: metric.averageScore,
                  target: dashboardData.metrics.find(m => m.metricId === metric.metricId)?.target || 0
                }))}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#8884d8" name="Average Score" />
                <Bar dataKey="target" fill="#82ca9d" name="Target" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dashboardData.overallTrend}
                margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis domain={[70, 90]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="averageScore" 
                  stroke="#8884d8" 
                  name="Average Score"
                  activeDot={{ r: 8 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Underperforming Suppliers */}
      <Card>
        <CardHeader>
          <CardTitle>Suppliers Needing Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.underperformers.map((supplier) => (
              <div key={supplier.supplierId} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{supplier.supplierName}</h3>
                  <div className="flex items-center mt-1">
                    <Badge className={getRatingColor(supplier.rating)}>
                      {supplier.rating.charAt(0).toUpperCase() + supplier.rating.slice(1)}
                    </Badge>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {supplier.period}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{supplier.overallScore}</div>
                  <div className="flex items-center text-sm">
                    <span className={supplier.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                      {supplier.trend > 0 ? '+' : ''}{supplier.trend}
                    </span>
                    <span className="ml-1 text-muted-foreground">vs previous</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
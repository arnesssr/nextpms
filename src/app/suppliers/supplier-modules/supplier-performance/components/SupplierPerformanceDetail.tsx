'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useSupplierPerformance } from '../hooks/useSupplierPerformance';

interface SupplierPerformanceDetailProps {
  supplierId: string;
}

export function SupplierPerformanceDetail({ supplierId }: SupplierPerformanceDetailProps) {
  const { performance, history, loading, error } = useSupplierPerformance(supplierId);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading supplier performance data...</p>
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

  if (!performance || !history) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>No performance data available for this supplier</p>
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Supplier Performance Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold">{performance.supplierName}</h2>
              <div className="flex items-center mt-2">
                <Badge className={getRatingColor(performance.rating)}>
                  {performance.rating.charAt(0).toUpperCase() + performance.rating.slice(1)}
                </Badge>
                <span className="ml-2 text-sm text-muted-foreground">
                  {performance.period}
                </span>
              </div>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <div className="text-3xl font-bold">
                <span className={getScoreColor(performance.overallScore)}>
                  {performance.overallScore}
                </span>
                <span className="text-sm text-muted-foreground ml-2">/ 100</span>
              </div>
              <div className="flex items-center justify-center md:justify-end mt-1">
                <span className={performance.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                  {performance.trend > 0 ? '+' : ''}{performance.trend}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">
                  vs previous period
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    cx="50%" 
                    cy="50%" 
                    outerRadius="80%" 
                    data={performance.metrics.map(metric => ({
                      subject: metric.metricName,
                      score: metric.normalizedScore,
                      target: 100
                    }))}
                  >
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar 
                      name="Score" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      fill="#8884d8" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Target" 
                      dataKey="target" 
                      stroke="#82ca9d" 
                      fill="#82ca9d" 
                      fillOpacity={0.2} 
                    />
                    <Legend />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.metrics.map((metric) => (
                  <div key={metric.metricId} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium">{metric.metricName}</h3>
                        <p className="text-sm text-muted-foreground">
                          Target: {metric.target}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`text-2xl font-bold ${getScoreColor(metric.normalizedScore)}`}>
                          {metric.score}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Score: {metric.normalizedScore} / 100
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getScoreColor(metric.normalizedScore).replace('text-', 'bg-')}`}
                        style={{ width: `${metric.normalizedScore}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={history.history}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8884d8" 
                      name="Performance Score"
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
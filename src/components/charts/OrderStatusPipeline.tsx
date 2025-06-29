'use client';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { 
  Clock, 
  CheckCircle, 
  Package, 
  Truck, 
  Home,
  XCircle,
  ArrowRight
} from 'lucide-react';

interface OrderStatusPipelineProps {
  statusCounts: {
    pending: number;
    confirmed: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
  };
}

export function OrderStatusPipeline({ statusCounts }: OrderStatusPipelineProps) {
  const pipelineSteps = [
    {
      status: 'pending',
      label: 'Pending',
      icon: Clock,
      color: 'bg-gray-500',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      count: statusCounts.pending,
      description: 'Awaiting confirmation'
    },
    {
      status: 'confirmed',
      label: 'Confirmed',
      icon: CheckCircle,
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      count: statusCounts.confirmed,
      description: 'Order confirmed'
    },
    {
      status: 'processing',
      label: 'Processing',
      icon: Package,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
      count: statusCounts.processing,
      description: 'Being prepared'
    },
    {
      status: 'shipped',
      label: 'Shipped',
      icon: Truck,
      color: 'bg-purple-500',
      textColor: 'text-purple-700',
      bgColor: 'bg-purple-50',
      count: statusCounts.shipped,
      description: 'In transit'
    },
    {
      status: 'delivered',
      label: 'Delivered',
      icon: Home,
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      count: statusCounts.delivered,
      description: 'Successfully delivered'
    }
  ];

  const totalActiveOrders = pipelineSteps.reduce((sum, step) => sum + step.count, 0);

  const getStepWidth = (count: number) => {
    if (totalActiveOrders === 0) return 0;
    return Math.max((count / totalActiveOrders) * 100, 10); // Minimum 10% width for visibility
  };

  return (
    <div className="space-y-6">
      {/* Pipeline Visualization */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          {pipelineSteps.map((step, index) => (
            <div key={step.status} className="flex items-center">
              {/* Step Circle */}
              <div className={`
                flex items-center justify-center w-12 h-12 rounded-full
                ${step.count > 0 ? step.color : 'bg-gray-200'}
                text-white shadow-lg z-10 relative
              `}>
                <step.icon className="w-6 h-6" />
              </div>
              
              {/* Connector Line */}
              {index < pipelineSteps.length - 1 && (
                <div className="flex-1 h-1 bg-gray-200 mx-4 relative">
                  <ArrowRight className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Step Labels and Counts */}
        <div className="flex items-start justify-between">
          {pipelineSteps.map((step) => (
            <div key={step.status} className="text-center w-24">
              <div className="space-y-1">
                <p className="text-sm font-medium">{step.label}</p>
                <Badge 
                  variant="outline" 
                  className={`${step.textColor} ${step.bgColor} border-current`}
                >
                  {step.count}
                </Badge>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bars */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Order Distribution</h4>
        {pipelineSteps.map((step) => (
          <div key={step.status} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <step.icon className={`w-4 h-4 ${step.textColor}`} />
                <span>{step.label}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">{step.count}</span>
                <span className="text-muted-foreground">
                  ({totalActiveOrders > 0 ? Math.round((step.count / totalActiveOrders) * 100) : 0}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${step.color}`}
                style={{ width: `${getStepWidth(step.count)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Cancelled Orders */}
      {statusCounts.cancelled > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Cancelled Orders</span>
            </div>
            <Badge variant="outline" className="text-red-600 bg-red-50 border-red-200">
              {statusCounts.cancelled}
            </Badge>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t">
        <div className="text-center">
          <p className="text-2xl font-bold">{totalActiveOrders}</p>
          <p className="text-sm text-muted-foreground">Active Orders</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">{statusCounts.delivered}</p>
          <p className="text-sm text-muted-foreground">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold">
            {totalActiveOrders > 0 
              ? Math.round((statusCounts.delivered / (totalActiveOrders + statusCounts.delivered)) * 100)
              : 0}%
          </p>
          <p className="text-sm text-muted-foreground">Success Rate</p>
        </div>
      </div>
    </div>
  );
}

'use client';

import { ComposedChart, Line, Area, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendForecast } from '../types';

interface ForecastChartProps {
  data: TrendForecast[];
}

export function ForecastChart({ data }: ForecastChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip formatter={(value) => [formatCurrency(value as number)]} />
          <Legend />
          <Area 
            type="monotone" 
            dataKey="upperBound" 
            fill="#8884d8" 
            stroke="#8884d8" 
            fillOpacity={0.1} 
            name="Upper Bound" 
          />
          <Area 
            type="monotone" 
            dataKey="lowerBound" 
            fill="#8884d8" 
            stroke="#8884d8" 
            fillOpacity={0.1} 
            name="Lower Bound" 
          />
          <Line 
            type="monotone" 
            dataKey="actual" 
            stroke="#ff7300" 
            name="Actual" 
            strokeWidth={2} 
          />
          <Line 
            type="monotone" 
            dataKey="forecast" 
            stroke="#8884d8" 
            name="Forecast" 
            strokeWidth={2} 
            strokeDasharray="5 5" 
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CustomerRetentionData } from '../types';

interface CustomerRetentionChartProps {
  data: CustomerRetentionData[];
}

export function CustomerRetentionChart({ data }: CustomerRetentionChartProps) {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
          <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
          <Tooltip />
          <Legend />
          <Bar yAxisId="left" dataKey="rate" name="Retention Rate (%)" fill="#8884d8" />
          <Bar yAxisId="right" dataKey="newCustomers" name="New Customers" fill="#82ca9d" />
          <Bar yAxisId="right" dataKey="churnedCustomers" name="Churned Customers" fill="#ff8042" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
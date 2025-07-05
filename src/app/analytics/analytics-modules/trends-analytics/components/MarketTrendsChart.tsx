'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { MarketTrend } from '../types';

interface MarketTrendsChartProps {
  data: MarketTrend[];
}

export function MarketTrendsChart({ data }: MarketTrendsChartProps) {
  // Combine all data points into a single array for the chart
  const chartData = data[0].data.map((item) => {
    const result: any = { date: item.date };
    
    data.forEach((trend) => {
      const matchingPoint = trend.data.find((point) => point.date === item.date);
      if (matchingPoint) {
        result[trend.name] = matchingPoint.value;
      }
    });
    
    return result;
  });

  // Generate a unique color for each trend
  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c'];

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          
          {data.map((trend, index) => (
            <Line
              key={trend.name}
              type="monotone"
              dataKey={trend.name}
              stroke={COLORS[index % COLORS.length]}
              activeDot={{ r: 8 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
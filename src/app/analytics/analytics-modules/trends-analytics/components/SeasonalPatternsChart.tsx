'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { SeasonalPattern } from '../types';

interface SeasonalPatternsChartProps {
  data: SeasonalPattern[];
}

export function SeasonalPatternsChart({ data }: SeasonalPatternsChartProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip 
            formatter={(value, name, props) => {
              if (name === 'value') return [`${value}%`, 'Current'];
              if (name === 'previousValue') return [`${value}%`, 'Previous'];
              return [value, name];
            }}
          />
          <Legend />
          <Bar dataKey="previousValue" name="Previous Period" fill="#8884d8" opacity={0.6} />
          <Bar dataKey="value" name="Current Period" fill="#82ca9d">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
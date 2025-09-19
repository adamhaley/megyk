'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AnalyticsChartProps {
  title: string;
  subtitle?: string;
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  centerText?: {
    main: string;
    sub: string;
  };
}

const renderCustomizedLabel = (entry: unknown, centerText?: { main: string; sub: string }) => {
  if (!centerText) return null;
  
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-gray-900 text-2xl font-bold"
    >
      <tspan x="50%" dy="-0.5em" className="text-3xl font-bold">
        {centerText.main}
      </tspan>
      <tspan x="50%" dy="1.5em" className="text-sm text-gray-500 font-normal">
        {centerText.sub}
      </tspan>
    </text>
  );
};

export default function AnalyticsChart({ title, subtitle, data, centerText }: AnalyticsChartProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 h-80">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
      </div>
      
      <div className="h-64 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={centerText ? 60 : 0}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value, name) => [`${value}%`, name]} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
            {centerText && renderCustomizedLabel(null, centerText)}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
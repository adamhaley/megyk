'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

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
      style={{ fill: '#111827', fontSize: '24px', fontWeight: 'bold' }}
    >
      <tspan x="50%" dy="-0.5em" style={{ fontSize: '32px', fontWeight: 'bold' }}>
        {centerText.main}
      </tspan>
      <tspan x="50%" dy="1.5em" style={{ fontSize: '14px', fill: '#6b7280', fontWeight: 'normal' }}>
        {centerText.sub}
      </tspan>
    </text>
  );
};




export default function AnalyticsChart({ title, subtitle, data, centerText }: AnalyticsChartProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ height: 288, position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="53%"
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
                wrapperStyle={{ fontSize: '12px', bottom: 20 }}
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
              {centerText && renderCustomizedLabel(null, centerText)}
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}
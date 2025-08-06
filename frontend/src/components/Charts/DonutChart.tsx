import React from 'react';

interface DonutChartProps {
  data: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  size?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ data, size = 120 }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-32 bg-gray-50 rounded-lg">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  const colors = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // yellow
    '#ef4444', // red
    '#8b5cf6', // purple
    '#06b6d4', // cyan
  ];

  const radius = size / 2;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  let cumulativePercentage = 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Status</h3>
      
      <div className="flex items-center gap-6">
        {/* Donut Chart */}
        <div className="relative">
          <svg
            height={size}
            width={size}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <circle
              stroke="#f3f4f6"
              fill="transparent"
              strokeWidth={strokeWidth}
              r={normalizedRadius}
              cx={radius}
              cy={radius}
            />
            
            {/* Data segments */}
            {data.map((item, index) => {
              const strokeDasharray = `${(item.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativePercentage * circumference / 100;
              cumulativePercentage += item.percentage;
              
              return (
                <circle
                  key={item.status}
                  stroke={colors[index % colors.length]}
                  fill="transparent"
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-300 hover:stroke-opacity-80"
                  strokeLinecap="round"
                />
              );
            })}
          </svg>
          
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">
                {data.reduce((sum, item) => sum + item.count, 0)}
              </div>
              <div className="text-xs text-gray-500">Total Orders</div>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex-1">
          {data.map((item, index) => (
            <div key={item.status} className="flex items-center justify-between mb-2 last:mb-0">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-sm text-gray-700">{item.status}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">{item.count}</span>
                <span className="text-xs text-gray-500">({item.percentage}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DonutChart;

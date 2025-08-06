import React from 'react';

interface SalesChartProps {
  data: Array<{
    date: string;
    amount: number;
    orderCount: number;
  }>;
  height?: number;
}

const SalesChart: React.FC<SalesChartProps> = ({ data, height = 200 }) => {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No sales data available</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount));
  const maxOrders = Math.max(...data.map(d => d.orderCount));

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Sales Trend</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Orders</span>
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height }}>
        <svg width="100%" height="100%" className="overflow-visible">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Revenue bars */}
          {data.map((item, index) => {
            const barHeight = maxAmount > 0 ? (item.amount / maxAmount) * (height - 40) : 0;
            const x = (index / (data.length - 1)) * 90 + 5;
            
            return (
              <g key={`revenue-${index}`}>
                <rect
                  x={`${x}%`}
                  y={height - barHeight - 20}
                  width="6"
                  height={barHeight}
                  fill="#3b82f6"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                  rx="2"
                />
                <text
                  x={`${x + 1}%`}
                  y={height - 5}
                  fontSize="10"
                  fill="#666"
                  textAnchor="middle"
                  className="text-xs"
                >
                  {new Date(item.date).getDate()}
                </text>
              </g>
            );
          })}
          
          {/* Order count line */}
          <path
            d={data.map((item, index) => {
              const y = maxOrders > 0 ? height - 20 - (item.orderCount / maxOrders) * (height - 40) : height - 20;
              const x = (index / (data.length - 1)) * 90 + 5;
              return `${index === 0 ? 'M' : 'L'} ${x}% ${y}`;
            }).join(' ')}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            className="drop-shadow-sm"
          />
          
          {/* Order count points */}
          {data.map((item, index) => {
            const y = maxOrders > 0 ? height - 20 - (item.orderCount / maxOrders) * (height - 40) : height - 20;
            const x = (index / (data.length - 1)) * 90 + 5;
            
            return (
              <circle
                key={`orders-${index}`}
                cx={`${x}%`}
                cy={y}
                r="3"
                fill="#10b981"
                className="drop-shadow-sm hover:r-4 transition-all"
              />
            );
          })}
        </svg>
        
        {/* Tooltip on hover (simplified) */}
        <div className="absolute inset-0 flex items-end justify-between px-2 pb-6 pointer-events-none">
          {data.map((item, index) => (
            <div key={index} className="relative group">
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap mb-2">
                ${item.amount.toFixed(0)} | {item.orderCount} orders
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesChart;

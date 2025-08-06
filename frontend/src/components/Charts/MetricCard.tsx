import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'indigo';
  size?: 'sm' | 'md' | 'lg';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  color = 'blue',
  size = 'md'
}) => {
  const colorClasses = {
    blue: {
      bg: 'bg-blue-50',
      icon: 'text-blue-600',
      accent: 'border-blue-200',
    },
    green: {
      bg: 'bg-green-50',
      icon: 'text-green-600',
      accent: 'border-green-200',
    },
    yellow: {
      bg: 'bg-yellow-50',
      icon: 'text-yellow-600',
      accent: 'border-yellow-200',
    },
    red: {
      bg: 'bg-red-50',
      icon: 'text-red-600',
      accent: 'border-red-200',
    },
    purple: {
      bg: 'bg-purple-50',
      icon: 'text-purple-600',
      accent: 'border-purple-200',
    },
    indigo: {
      bg: 'bg-indigo-50',
      icon: 'text-indigo-600',
      accent: 'border-indigo-200',
    },
  };

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const isPositiveChange = typeof change === 'number' && change >= 0;
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border ${colorClasses[color].accent} ${sizeClasses[size]} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className={`font-bold text-gray-900 ${size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-2xl' : 'text-xl'}`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          
          {typeof change === 'number' && (
            <div className="flex items-center mt-2">
              <span 
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isPositiveChange 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                <svg
                  className={`w-3 h-3 mr-1 ${isPositiveChange ? 'transform rotate-0' : 'transform rotate-180'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                {Math.abs(change)}%
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500 ml-2">{changeLabel}</span>
              )}
            </div>
          )}
        </div>
        
        {icon && (
          <div className={`${colorClasses[color].bg} p-3 rounded-lg ${colorClasses[color].icon}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;

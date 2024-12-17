import React from 'react';

interface StatusFiltersProps {
  label: string;
  options: string[];
  selectedOption: string;
  onChange: (value: string) => void;
}

const StatusFilters: React.FC<StatusFiltersProps> = ({
  label,
  options,
  selectedOption,
  onChange,
}) => {
  return (
    <div className='flex'>
      <label htmlFor='status-filter' className='sr-only'>
        {label}
      </label>
      <select
        id='status-filter'
        className='flex py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-nezeza_light_blue focus:border-nezeza_light_blue'
        value={selectedOption}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusFilters;

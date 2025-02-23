import React from 'react';

interface DateFiltersProps {
  label?: string;
  startDate: string; // Start date value in ISO format (or any date string format you're using)
  endDate: string; // End date value in ISO format
  onStartDateChange: (value: string) => void; // Callback for start date changes
  onEndDateChange: (value: string) => void; // Callback for end date changes
}

const DateFilters: React.FC<DateFiltersProps> = ({
  label,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => {
  return (
    <div className='flex flex-col md:flex-row items-center gap-4'>
      <label htmlFor='date-filter' className='sr-only'>
        {label}
      </label>
      <div className='flex items-center gap-2'>
        <input
          type='date'
          id='start-date'
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className='py-2 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-nezeza_light_blue focus:border-nezeza_light_blue'
          placeholder='Start Date'
        />
        <span className='text-nezeza_gray_600'>to</span>
        <input
          type='date'
          id='end-date'
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className='py-2 px-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-nezeza_light_blue focus:border-nezeza_light_blue'
          placeholder='End Date'
        />
      </div>
    </div>
  );
};

export default DateFilters;

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
    <div className='flex flex-col md:flex-row items-center gap-2 sm:gap-4'>
      <label htmlFor='date-filter' className='sr-only'>
        {label}
      </label>
      <div className='flex items-center sm:gap-2'>
        <input
          type='date'
          id='start-date'
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className='sm:py-2 sm:px-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-vesoko_background focus:border-vesoko_background'
          placeholder='Start Date'
        />
        <span className='text-vesoko_gray_600'>to</span>
        <input
          type='date'
          id='end-date'
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className='sm:py-2 sm:px-2 text-xs sm:text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring focus:ring-vesoko_background focus:border-vesoko_background'
          placeholder='End Date'
        />
      </div>
    </div>
  );
};

export default DateFilters;

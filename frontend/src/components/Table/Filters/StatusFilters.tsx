import DropdownInputSearchable from '@/components/FormInputs/DropdownInputSearchable';
import React from 'react';

interface StatusFiltersProps {
  label: string;
  options: {
    value: string;
    label: string;
  }[];
  selectedOption?: { value: string; label: string } | null;
  onChange?: (value: { value: string; label: string } | null) => void;
}

const StatusFilters: React.FC<StatusFiltersProps> = ({
  label,
  options,
  selectedOption,
  onChange,
}) => {
  const handleChange = (value: { value: string; label: string } | null) => {
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className='flex flex-grow'>
      <DropdownInputSearchable
        label={label}
        id='status-filter'
        name='status-filter'
        options={options}
        onChange={handleChange}
        value={selectedOption}
        className='w-full max-w-xs sm:max-w-md text-center'
      />
    </div>
  );
};

export default StatusFilters;

import React from 'react'
import { FieldValues, UseFormGetValues } from 'react-hook-form';

interface ReviewInputItemProps {
  label: string;
  fieldName: string;
  getValues: UseFormGetValues<FieldValues>;
  className?: string;
}
const ReviewInputItem = ({
  label,
  fieldName,
  getValues,
  className = '',
}: ReviewInputItemProps) => {
  return (
    <p className={`${className}`}>
      <span className='text-gray-500'>{label}:</span>{' '}
      <span className='font-semibold'>{getValues(`${fieldName}`)}</span>
    </p>
  );
};

export default ReviewInputItem
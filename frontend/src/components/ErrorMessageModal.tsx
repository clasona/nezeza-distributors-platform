import React from 'react'

interface ErrorMessageModalProps {
  errorMessage: string;
}
const ErrorMessageModal = ({ errorMessage }: ErrorMessageModalProps) => {
  return (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-md'>
      {errorMessage}
    </div>
  );
};

export default ErrorMessageModal;
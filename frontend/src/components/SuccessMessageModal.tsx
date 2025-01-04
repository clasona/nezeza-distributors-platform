import React from 'react'

interface SuccessMessageModalProps {
  successMessage: string;
}
const SuccessMessageModal = ({ successMessage }: SuccessMessageModalProps) => {
  return (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-md shadow-md'>
      {successMessage}
    </div>
  );
};

export default SuccessMessageModal;
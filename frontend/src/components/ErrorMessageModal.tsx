import React, { useEffect, useState } from 'react';

interface ErrorMessageModalProps {
  errorMessage: string;
}
const ErrorMessageModal = ({ errorMessage }: ErrorMessageModalProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    // Cleanup the timer when the component unmounts or if successMessage changes
    return () => clearTimeout(timer);
  }, [errorMessage]);

  if (!isVisible) {
    return null; // Don't render anything if not visible
  }
  return (
    <div className='fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-md shadow-md'>
      {errorMessage}
    </div>
  );
};

export default ErrorMessageModal;

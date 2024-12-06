import React from 'react';
import { Plus } from 'lucide-react';

interface SubmitButtonProps {
  isLoading: boolean;
  buttonTitle: string;
  loadingButtonTitle?: string;
}
const SubmitButton = ({
  isLoading = false,
  buttonTitle,
  loadingButtonTitle,
}: SubmitButtonProps) => {
  return (
    <div className='sm:col-span-1'>
      {isLoading ? (
        <button
          type='submit'
          disabled
          className='items-center px-5 py-2.5 mt-4 sm:mt-6 test-sm font-medium text-center 
                  text-white bg-green-500 hover:bg-green-700 rounded-lg fpcus:ring-4 focus:ring-green-200 focus:outline-none
                  mr-2 inline-flex'
        >
          <svg
            aria-hidden='true'
            role='status'
            className='inline w-4 h-4 mr-3 text-white animate-spin'
            viewBox='0 0 100 101'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M100 50.5C100 78.1974 77.6142 100 50 100C22.3858 100 0 78.1974 0 50.5C0 22.8026 22.3858 0 50 0C77.6142 0 100 22.8026 100 50.5ZM9.08144 50.5C9.08144 74.2719 27.8063 92 50 92C72.1937 92 90.9186 74.2719 90.9186 50.5C90.9186 26.7281 72.1937 9 50 9C27.8063 9 9.08144 26.7281 9.08144 50.5Z'
              fill='#E5E7EB'
            />
            <path
              d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.9962 15.1192 80.8826 10.7237 74.8466 7.55336C68.8106 4.38303 61.9826 2.51562 55.0006 2.08051C48.0185 1.64539 41.0513 2.65102 34.5681 5.04828C32.2404 5.9531 31.0239 8.57609 31.7644 10.9735C32.5048 13.3709 35.0343 14.6029 37.3792 13.8041C42.6558 11.9617 48.1635 11.295 53.5822 11.7688C58.713 12.2201 63.7281 13.8223 68.2864 16.482C72.8446 19.1418 76.859 22.8065 80.1043 27.313C82.6057 30.7196 84.5582 34.4845 85.8911 38.459C86.694 40.8217 89.5423 41.9079 91.9676 39.0409Z'
              fill='currentColor'
            />
          </svg>

          {loadingButtonTitle}
        </button>
      ) : (
        <button
          type='submit'
          className='inline-flex items-center px-5 py-2.5 mt-4 sm:mt-6 test-sm font-medium text-center 
                  text-white bg-green-500 rounded-lg fpcus:ring-4 focus:ring-green-200'
        >
          <Plus className='w-5 h-5 mr-2' />
          {buttonTitle}
        </button>
      )}
    </div>
  );
};
export default SubmitButton;

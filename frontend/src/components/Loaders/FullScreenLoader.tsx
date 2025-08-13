import React from 'react'

const FullScreenLoader = () => {
  return (
    <div className='fixed inset-0 flex items-center justify-center bg-white dark:bg-gray-900'>
      {' '}
      {/* Full-screen loader */}
      {/* You can customize the loader here */}
      <div className='animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-500 dark:border-blue-500'></div>
      {/* Or use an image: <Image src="/path/to/your/loader.gif" alt="Loading..." /> */}
      {/* Or a text message: <p>Loading...</p> */}
    </div>
  );
}

export default FullScreenLoader
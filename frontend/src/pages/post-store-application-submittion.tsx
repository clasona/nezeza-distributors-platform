
const PostStoreApplicationsubmission = () => {
  return (
    <div className='w-full bg-gray-100 min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        <div className='w-full bg-white p-6 rounded-lg shadow-lg'>
          <div className='text-center mt-6'>
            <h1 className='text-2xl font-semibold text-center text-gray-800 mb-4'>
              Thank you for submitting your store details!
            </h1>
            <p className='mt-4 text-gray-600'>
              We will review your application and inform you within 3-5 days. In
              the meantime, you can login and start browsing products.
            </p>
            <button
              className='mt-6 px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_yellow hover:text-black transition-colors duration-300'
              onClick={() => (window.location.href = '/login')}
              // className='px-6 py-2 bg-blue-600 text-white rounded-md justify-center hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
            >
              Take me to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

PostStoreApplicationsubmission.noLayout = true;
export default PostStoreApplicationsubmission;

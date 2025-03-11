
const PostStoreApplicationsubmission = () => {
  return (
        <div className='w-full p-6 rounded-lg '>
          <div className='text-center mt-6'>
            <h1 className='text-2xl font-semibold text-center text-gray-800 mb-4'>
              Thank you for submitting your store details!
            </h1>
            <p className='mt-4 text-gray-600'>
              We will review your application and get back to you within 3-5 days. In
              the meantime, you can browsing through the products on our platform.
            </p>
            <button
              className='mt-6 px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_green_600 hover:text-black transition-colors duration-300'
              onClick={() => (window.location.href = '/')}
            >
              Take me to home
            </button>
          </div>
      </div>
  );
};

// PostStoreApplicationsubmission.noLayout = true;
export default PostStoreApplicationsubmission;

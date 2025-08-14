const BrowseOrSetupStore = () => {
  return (
    <div className='w-full bg-gray-100 min-h-screen flex items-center justify-center'>
      <div className='bg-vesoko_background p-4'>
        <div className='w-full bg-white p-6 rounded-lg shadow-lg'>
          <h1 className='text-2xl font-semibold text-center text-gray-800 mb-4'>
            Welcome! Where to next?
          </h1>
          <div className='text-center'>
            <button
              className='px-4 py-2 rounded-md bg-vesoko_primary text-white hover:bg-vesoko_primary hover:text-black transition-colors duration-300'
              onClick={() => (window.location.href = '/')}
            >
              Browse Products
            </button>
          </div>
          <p className='mt-4 text-center text-gray-600'>OR</p>
          <div className='text-center mt-4'>
            <button
              className='px-4 py-2 rounded-md bg-vesoko_primary text-white hover:bg-vesoko_primary hover:text-black transition-colors duration-300'
              onClick={() => (window.location.href = '/setup-store')}
            >
              Setup Store
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

BrowseOrSetupStore.noLayout = true;
export default BrowseOrSetupStore;

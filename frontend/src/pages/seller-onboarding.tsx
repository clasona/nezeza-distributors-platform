const SellerOnboarding = () => {
  return (
    <div className='w-screen h-screen flex flex-col bg-nezeza_powder_blue gap-2 items-center justify-center py-20 px-4 sm:px-6'>
      <div className='text-center mt-6'>
        <h1 className='text-2xl font-semibold text-nezeza_gray_800 mb-2'>
          Sell on Nezeza Platform
        </h1>
        <p className='text-nezeza_gray_600'>
          Do you already have a seller account?
        </p>
        <div className='mt-6 flex justify-center gap-4'>
          <button
            className='px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_green_800 transition-colors duration-300'
            onClick={() => (window.location.href = '/login')}
          >
            Yes, Login
          </button>
          <button
            className='px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_green_800 transition-colors duration-300'
            onClick={() => (window.location.href = '/select-store-type')}
          >
            No, Apply Now
          </button>
        </div>
        <p className='mt-4 text-nezeza_gray_800 font-semibold'>
          Store applications take 48 hours for approval.
        </p>
      </div>
    </div>
  );
};
SellerOnboarding.noLayout = true;
export default SellerOnboarding;

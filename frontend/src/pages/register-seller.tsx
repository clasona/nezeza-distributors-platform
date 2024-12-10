import React, { useEffect, useState } from 'react';

const RegisterSellerPage = () => {
  // TODO: put all these together as in this link: https://github.com/pawelborkar/react-login-form/blob/master/src/App.js
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  // TODO: add repeat password
  // const [businessType, setBusinessType] = useState(''); //TODO: make this choice
  const [errorMessage, setErrorMessage] = useState('');
  // const [successMessage, setSuccessMessage] = useState('');
  const [verificationPrompt, setVerificationPrompt] = useState(false); // **New state for verification message**
  //initialize registerData as an object
  const [registerData, setRegisterData] = useState<any | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (password !== repeatPassword) {
      setErrorMessage("Passwords don't match");
      return;
    }

    try {
      const response = await fetch(
        'http://localhost:8000/api/v1/auth/register',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            password,
            // businessType,
          }),
        }
      );
      const registerResponseData = await response.json();
      const verificationToken = registerResponseData.verificationToken;
      // console.log(response)
      // console.log(response.ok)
      if (!response.ok) {
        // setSuccessMessage(''); // Clear any previous error message
        setErrorMessage(registerResponseData.msg);
        //TODO: - Do not redirect
        // TODO: - Modify the error messages to make them more informative
      } else {
        setErrorMessage(''); // Clear any previous error message
        setRegisterData(registerData);

        setVerificationPrompt(true); // **Trigger verification prompt**

        // const verifyEmailResponse = await fetch(
        //   'http://localhost:8000/api/v1/auth/verify-email',
        //   {
        //     method: 'POST',
        //     headers: {
        //       'Content-Type': 'application/json',
        //     },
        //     body: JSON.stringify({
        //       verificationToken,
        //       email,
        //     }),
        //   }
        // );
        // const verifyEmailResponseData = await verifyEmailResponse.json();
        // // console.log(response)
        // // console.log(response.ok)
        // if (!verifyEmailResponse.ok) {
        //   // setSuccessMessage(''); // Clear any previous error message
        //   setErrorMessage(verifyEmailResponseData.msg);
        // } else {
        //   setVerificationPrompt(true); // **Trigger verification prompt**
        // }
      }
    } catch (error) {
      setErrorMessage('An error occurred. Please try again.');
      //add other errors, such as unauthorized, etc
    }
  };

  return (
    // change this to center the form
    // <div className="w-full px-12 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
    // <div className='w-full min-h-screen flex items-center justify-center bg-gray-100'>
    <div className='w-full bg-gray-100 min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        {/* <div className='bg-white shadow-lg rounded-lg p-6'> */}
        {/* TODO: add shadow such as: shadow-lg shadow-nezeza_light_blue-200 */}
        <form
          onSubmit={handleSubmit}
          className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue mb-4'>
            Create a Nezeza account
          </h2>
          {/* Form Fields */}
          {!verificationPrompt ? (
            <>
              <div className='mb-2'>
                <label className='block text-gray-700' htmlFor='firstName'>
                  First Name:
                </label>
                <input
                  className='w-full p-2 py-1 rounded-md border border-gray-300 border-nezeza_light focus:border-nezeza_yellow focus:outline-none'
                  type='text'
                  placeholder='(ex: Adrien)'
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className='mb-2'>
                <label className='block text-gray-700' htmlFor='lastName'>
                  Last Name:
                </label>
                <input
                  className='w-full p-2 py-1 rounded-md border border-gray-300 focus:border-nezeza_yellow focus:outline-none'
                  type='text'
                  placeholder='(ex: Sibomana)'
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>

              <div className='mb-2'>
                <label className='block text-gray-700' htmlFor='email'>
                  Email:
                </label>
                <input
                  className='w-full p-2 py-1 rounded-md border border-gray-300 focus:border-nezeza_yellow focus:outline-none'
                  type='email'
                  placeholder='Enter your email'
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className='mb-2'>
                <label className='block text-gray-700' htmlFor='password'>
                  Password:
                </label>
                <input
                  className='w-full p-2 py-1 rounded-md border border-gray-300 focus:border-nezeza_yellow focus:outline-none'
                  type='password'
                  placeholder='Enter your password'
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700'>Repeat Password:</label>
                <input
                  type='password'
                  placeholder='Repeat your password'
                  className='w-full p-2 py-1 rounded-md border border-gray-300 focus:border-nezeza_yellow focus:outline-none'
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  required
                />
              </div>
              {/* <div className='flex items-center gap-2'>
          <label htmlFor='businessType'>Business Type:</label>

          <select
            className='rounded-md border-[2px] border-nezeza_light'
            onChange={(e) => setBusinessType(e.target.value)}
            required
          >
            <option value=''>Select type</option>
            <option value='E-commerce Marketplace'>
              E-commerce Marketplace
            </option>{' '}
            <option value='manufacturing'>Manufacturing</option>
            <option value='wholesale'>Wholesale</option>
            <option value='retail'>Retail</option>
            <option value='customer'>Customer</option>
          </select>
        </div> */}
              <button
                type='submit'
                className='w-full h-10 rounded-md font-medium bg-nezeza_dark_blue text-white hover:bg-nezeza_yellow 
            hover:text-black transition-colors duration-300 mt-2'
              >
                Signup
              </button>

              {errorMessage && (
                <p className='mt-4 text-center text-nezeza_red_600'>
                  {errorMessage}
                </p>
              )}
              <p className='text-center mt-6 text-gray-600'>
                Already have an account?{' '}
                <a
                  className='text-nezeza_yellow hover:text-nezeza_dark_blue hoverunderline transition-colors
            cursor-pointer duration-250'
                  href='http://localhost:3000/login'
                >
                  Signin
                </a>
              </p>
            </>
          ) : (
            //TODO: Add a resend email button
            // **Email verification prompt**
            <div className='text-center mt-6'>
              <h3 className='text-xl font-semibold text-nezeza_green_600'>
                Verify Your Email
              </h3>
              <p className='mt-4 text-gray-600'>
                We've sent a verification link to <strong>{email}</strong>.
                Please check your inbox and follow the instructions to verify
                your email.
              </p>
              <button
                className='mt-6 px-4 py-2 rounded-md bg-nezeza_dark_blue text-white hover:bg-nezeza_yellow hover:text-black transition-colors duration-300'
                onClick={() => (window.location.href = '/login')} // Redirect to store setup page
              >
                Continue to Login
              </button>
            </div>
          )}
        </form>
      </div>
      {/* </div> */}
    </div>
  );
};

RegisterSellerPage.noLayout = true; // remove root layout from this page
export default RegisterSellerPage;

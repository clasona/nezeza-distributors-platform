import ErrorMessageModal from '@/components/ErrorMessageModal';
import SubmitButton from '@/components/FormInputs/SubmitButton';
import TextInput from '@/components/FormInputs/TextInput';
import SuccessMessageModal from '@/components/SuccessMessageModal';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { registerUser } from '@/utils/user/registerUser';

const RegisterSellerPage = () => {
  // TODO: put all these together as in this link: https://github.com/pawelborkar/react-login-form/blob/master/src/App.js
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  // TODO: add repeat password
  // const [storeType, setStoreType] = useState(''); //TODO: make this choice
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationPrompt, setVerificationPrompt] = useState(false);
  //initialize registerData as an object
  const [registerData, setRegisterData] = useState<any | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    const userData = { ...data };
    try {
      if (password !== repeatPassword) {
        setErrorMessage("Passwords don't match");
        return;
      }

      const response = await registerUser(userData);
      setErrorMessage('');
      setSuccessMessage('User registered successfully.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setVerificationPrompt(true); // **Trigger verification prompt**

      //initialize store attached to current user with default values
      //       const initStoreData = {
      //         storeName: '',
      //         email:'',
      //         address: '',
      //         description: '',
      //         isActive: false,
      //         storeType: '',
      //       }
    } catch (error) {
      setErrorMessage('Error registering user.');
    }
  };

  return (
    <div className='w-full bg-gray-100 min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        {/* <div className='bg-white shadow-lg rounded-lg p-6'> */}
        {/* TODO: add shadow such as: shadow-lg shadow-nezeza_light_blue-200 */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className='w-full max-w-md bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue mb-4'>
            Create a Nezeza account
          </h2>
          {/* Form Fields */}
          {!verificationPrompt ? (
            <>
              <div className='mb-2'>
                <TextInput
                  label='First Name'
                  id='firstName'
                  name='firstName'
                  register={register}
                  errors={errors}
                  type='text'
                />
              </div>
              <div className='mb-2'>
                <TextInput
                  label='Last Name'
                  id='lastName'
                  name='lastName'
                  register={register}
                  errors={errors}
                  type='text'
                />
              </div>
              <div className='mb-2'>
                <TextInput
                  label='Email'
                  id='email'
                  name='email'
                  register={register}
                  errors={errors}
                  type='email'
                />
              </div>
              <div className='mb-2'>
                <TextInput
                  label='Password'
                  id='password'
                  name='password'
                  register={register}
                  errors={errors}
                  type='password'
                />
              </div>
              <div className='mb-4'>
                <TextInput
                  label='Repeat Password'
                  id='repeatPassword'
                  name='repeatPassword'
                  register={register}
                  errors={errors}
                  type='password'
                />
              </div>
              <div className='flex items-center justify-center'>
                {successMessage && (
                  <SuccessMessageModal successMessage={successMessage} />
                )}
                {errorMessage && (
                  <ErrorMessageModal errorMessage={errorMessage} />
                )}
                {/* {errorMessage && <p className='text-red-600'>{errorMessage}</p>} */}
                <SubmitButton
                  isLoading={false}
                  buttonTitle='Signup'
                  loadingButtonTitle='Registering user...'
                />
              </div>

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
    </div>
  );
};

RegisterSellerPage.noLayout = true; // remove root layout from this page
export default RegisterSellerPage;

import { signIn } from 'next-auth/react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loginData, setLoginData] = useState<any | null>(null);

  const handleGoogleLogin = async () => {
    try {
      await signIn('google', { callbackUrl: '/browse-or-setup-store' });
    } catch (error) {
      console.error('Error during Google login:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        credentials: 'include',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const loginData = await response.json();
      if (!response.ok) {
        setErrorMessage(loginData.msg);
        setSuccessMessage('');
      } else {
        setLoginData(loginData);
        setErrorMessage('');
        setSuccessMessage('Login successful. Redirecting to home page...');
        setTimeout(
          () => (window.location.href = '/browse-or-setup-store'),
          2000
        );
      }
    } catch (error) {
      console.error('Error fetching login data:', error);
    }
  };

  return (
    <div className='w-full bg-gray-100 min-h-screen flex items-center justify-center'>
      <div className='bg-nezeza_light_blue p-4'>
        <form
          onSubmit={handleSubmit}
          className='w-full bg-white p-6 rounded-lg shadow-lg'
        >
          <h2 className='text-2xl font-bold text-center text-nezeza_dark_blue mb-4'>
            Login to Nezeza
          </h2>
          <div className='mb-2'>
            <label className='block text-gray-700' htmlFor='email'>
              Email:
            </label>
            <input
              className='w-full p-2 py-1 rounded-md border border-gray-300 border-nezeza_light focus:border-nezeza_yellow focus:outline-none'
              type='email'
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className='mb-2'>
            <label className='block text-gray-700' htmlFor='password'>
              Password:
            </label>
            <input
              className='w-full p-2 py-1 rounded-md border border-gray-300 border-nezeza_light focus:border-nezeza_yellow focus:outline-none'
              type='password'
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type='submit'
            className='w-full h-10 rounded-md font-medium bg-nezeza_dark_blue text-white hover:bg-nezeza_yellow hover:text-black transition-colors duration-300 mt-2'
          >
            Login
          </button>

          <button
            type='button'
            onClick={handleGoogleLogin}
            className='w-full h-10 rounded-md font-medium bg-red-500 text-white hover:bg-red-600 transition-colors duration-300 mt-2'
          >
            Login with Google
          </button>

          {errorMessage && (
            <p className='mt-4 text-center text-red-500'>{errorMessage}</p>
          )}
          <p className='text-center mt-6 text-gray-600'>
            New to Nezeza?{' '}
            <a
              className='text-nezeza_yellow hover:text-nezeza_dark_blue hoverunderline transition-colors cursor-pointer duration-250'
              href='http://localhost:3000/register'
            >
              Signup
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

LoginPage.noLayout = true;

export default LoginPage;

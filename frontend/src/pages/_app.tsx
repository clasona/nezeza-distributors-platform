import RootLayout from '@/components/RootLayout';
import { persistor, store } from '@/redux/store';
import '@/styles/globals.css';
import { SessionProvider } from 'next-auth/react';
import type { AppProps as NextAppProps } from 'next/app';
import { Provider } from 'react-redux';
import 'react-responsive-carousel/lib/styles/carousel.min.css'; //for live banner
import { PersistGate } from 'redux-persist/integration/react';

//extend AppProps type to add a noLayout property
type AppProps = NextAppProps & {
  Component: NextAppProps['Component'] & { noLayout?: boolean };
};

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  const NoLayout = Component.noLayout; //returned from pages where we dont want the root layout to be applied

  return (
    <div>
      <Provider store={store}>
        {/* for persisting redux store state data when refreshed */}
        <PersistGate loading={null} persistor={persistor}>
          <SessionProvider session={session}>
            <div className='bg-gray-300'>
              {/* <RootLayout>
                <Component {...pageProps} />
              </RootLayout>{' '} */}
              {NoLayout ? (
                <Component {...pageProps} />
              ) : (
                <RootLayout>
                  <Component {...pageProps} />
                </RootLayout>
              )}
            </div>
          </SessionProvider>
        </PersistGate>
      </Provider>
    </div>
  );
}

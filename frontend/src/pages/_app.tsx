import RootLayout from "@/components/RootLayout";
import "@/styles/globals.css";
import type { AppProps as NextAppProps } from 'next/app';
import "react-responsive-carousel/lib/styles/carousel.min.css"; //for live banner
import { Provider } from 'react-redux'; 
import {store, persistor  } from "@/store/store";
import { PersistGate } from 'redux-persist/integration/react';
import { SessionProvider } from "next-auth/react";

//extend AppProps type to add a noLayout property
type AppProps = NextAppProps & {
  Component: NextAppProps['Component'] & { noLayout?: boolean };
};

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
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

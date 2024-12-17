'use client';

import React from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';

const Providers = ({
  children,
}: React.ComponentProps<typeof ThemeProvider>) => {
  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='dark'
      enableSystem
      disableTransitionOnChange
    >
      <Toaster position='top-center' reverseOrder={false} />

      {children}
    </ThemeProvider>
  );
};

export default Providers;

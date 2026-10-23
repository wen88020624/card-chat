'use client';

import { SessionProvider } from 'next-auth/react';
import CssBaseline from '@mui/joy/CssBaseline';
import InitColorSchemeScript from '@mui/joy/InitColorSchemeScript';
import { CssVarsProvider } from '@mui/joy/styles';
import store from '@redux/store';
import { Provider } from 'react-redux';
import '@/app/globals.scss';
import NavBar from '@/components/NavBar/NavBar';
import theme from '@styles/theme';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body>
        <InitColorSchemeScript defaultMode="light" />
        <SessionProvider>
          <Provider store={store}>
            <CssVarsProvider theme={theme} defaultMode="light">
              <CssBaseline />
              <NavBar />
              <main>{children}</main>
            </CssVarsProvider>
          </Provider>
        </SessionProvider>
      </body>
    </html>
  );
}

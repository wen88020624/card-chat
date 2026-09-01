'use client';

import { Provider } from 'react-redux';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import store from '@redux/store';
import '@/app/globals.scss';
import NavBar from '@/components/NavBar/NavBar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Provider store={store}>
          <CssVarsProvider>
            <CssBaseline />
            <NavBar />
            <main>{children}</main>
          </CssVarsProvider>
        </Provider>
      </body>
    </html>
  );
}

// import './globals.css';
import { ReactNode } from 'react';
import Navbar from '../componenets/navbar';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme'; // Import the theme

export const metadata = {
  title: 'My App',
  description: 'Generated by Next.js',
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{metadata.title}</title>
      </head>
      <body>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Navbar />
        {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

// components/Navbar.js
"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { usePathname } from 'next/navigation';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { styled } from '@mui/system';
import Link from 'next/link';

const StyledButton = styled(Button)(({ theme, active }) => ({
  color: active ? theme.palette.error.main : theme.palette.success.main,
  borderBottom: active ? `2px solid ${theme.palette.error.main}` : 'none',
  '&:hover': {
    borderBottom: `2px solid ${theme.palette.primary.main}`,
  },
}));

const Navbar = () => {

  const pathname = usePathname();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          Sowtex
        </Typography>
        <Link href="/" passHref>
          <StyledButton active={pathname === '/'}>Product Search</StyledButton>
        </Link>
        <Link href="/image" passHref>
          <StyledButton active={pathname === '/image'}>Image</StyledButton>
        </Link>
        <Link href="/profile" passHref>
          <StyledButton active={pathname === '/profile'}>Profile</StyledButton>
        </Link>
        <Link href="/gemini" passHref>
          <StyledButton active={pathname === '/gemini'}>Gemini</StyledButton>
        </Link>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

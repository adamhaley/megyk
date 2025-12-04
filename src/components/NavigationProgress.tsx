'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import NProgress from 'nprogress';
import LinearProgress from '@mui/material/LinearProgress';
import Box from '@mui/material/Box';

// Configure NProgress
if (typeof window !== 'undefined') {
  NProgress.configure({ 
    showSpinner: false,
    trickleSpeed: 100,
    minimum: 0.08,
  });
}

// Custom NProgress component using MUI LinearProgress
export default function NavigationProgress() {
  const pathname = usePathname();

  useEffect(() => {
    NProgress.done();
  }, [pathname]);

  return null;
}

// Component to show at top of layout
export function TopLoadingBar() {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [pathname]);

  if (!loading) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      <LinearProgress />
    </Box>
  );
}


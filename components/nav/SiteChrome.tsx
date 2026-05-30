'use client';

import { usePathname } from 'next/navigation';
import SiteHeader from '@/components/nav/SiteHeader';

const HIDE_HEADER_PREFIXES = ['/admin', '/login'];

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const hideHeader = HIDE_HEADER_PREFIXES.some((p) => pathname.startsWith(p));

  return (
    <>
      {!hideHeader && <SiteHeader />}
      {children}
    </>
  );
}

import { ReactNode } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

type Props = {
  children: ReactNode;
};

// Since we have a `not-found.tsx` file this layout file
// is required, even if it's just passing children through.
export default function RootLayout({ children }: Props) {
  return children;
}
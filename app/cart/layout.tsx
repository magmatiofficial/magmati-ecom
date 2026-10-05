import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Shopping Bag & Checkout | MAGMATI',
  description: 'Review your selected items and proceed to secure checkout on MAGMATI.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

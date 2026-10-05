import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Account & Customer Dashboard | MAGMATI',
  description: 'Manage your profile, order history, addresses, and account settings on MAGMATI.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

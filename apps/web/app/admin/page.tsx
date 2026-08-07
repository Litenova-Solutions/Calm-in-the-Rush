import AdminClient from './AdminClient';

export const metadata = {
  title: 'Local admin | Calm in the Rush',
  robots: { index: false, follow: false },
};
export const dynamic = 'force-dynamic';

export default function AdminPage() {
  return <AdminClient />;
}

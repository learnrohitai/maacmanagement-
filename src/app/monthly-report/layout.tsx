'use client';

import Layout from '@/components/layout/Layout';

export default function MonthlyReportLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Layout>{children}</Layout>;
}

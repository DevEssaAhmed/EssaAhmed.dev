import type { Metadata } from "next";
import AdminProviders from "./AdminProviders";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="admin-shell min-h-screen bg-[#f6f7f9] dark:bg-[#0e0f12] text-zinc-900 dark:text-zinc-100 antialiased selection:bg-primary/20 selection:text-primary transition-colors duration-200">
      <AdminProviders>{children}</AdminProviders>
    </div>
  );
}

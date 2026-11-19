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
    <div className="min-h-screen bg-[#f6f7f9] text-zinc-900 antialiased selection:bg-zinc-900/10 selection:text-zinc-900">
      <AdminProviders>{children}</AdminProviders>
    </div>
  );
}

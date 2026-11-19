export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="w-full animate-page-enter">{children}</div>;
}

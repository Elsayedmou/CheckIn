export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="text-sm font-semibold mb-2">{title}</div>
      <div>{children}</div>
    </div>
  );
}

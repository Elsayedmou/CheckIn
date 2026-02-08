export function AlertBadge({ level, text }: { level: "OK" | "WARNING" | "DANGER"; text: string }) {
  const cls =
    level === "OK"
      ? "bg-green-50 text-green-700 border-green-200"
      : level === "WARNING"
      ? "bg-yellow-50 text-yellow-700 border-yellow-200"
      : "bg-red-50 text-red-700 border-red-200";
  return <span className={`inline-flex items-center px-2 py-1 rounded-md border text-xs ${cls}`}>{text}</span>;
}

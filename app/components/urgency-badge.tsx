export function UrgencyBadge({ score }: { score: number }) {
  const color =
    score >= 8
      ? "border-red-200 bg-red-50 text-red-700"
      : score >= 6
      ? "border-orange-200 bg-orange-50 text-orange-700"
      : score >= 4
      ? "border-yellow-200 bg-yellow-50 text-yellow-700"
      : "border-green-200 bg-green-50 text-green-700";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {score}
    </span>
  );
}

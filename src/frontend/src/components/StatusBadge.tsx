import { Badge } from "@/components/ui/badge";
import type { BookingStatus } from "../backend.d";

const statusConfig: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className:
      "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  accepted: {
    label: "Accepted",
    className: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
  },
  inProgress: {
    label: "In Progress",
    className: "bg-teal-100 text-teal-800 border-teal-200 hover:bg-teal-100",
  },
  completed: {
    label: "Completed",
    className:
      "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
  },
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  const config = statusConfig[status] ?? { label: status, className: "" };
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${config.className}`}
    >
      {config.label}
    </Badge>
  );
}

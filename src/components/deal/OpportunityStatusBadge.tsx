import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<string, { label: string; className: string }> = {
  open: {
    label: "Open",
    className: "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200",
  },
  won: {
    label: "Won",
    className:
      "bg-green-100 text-green-700 hover:bg-green-100 border-green-200",
  },
  lost: {
    label: "Lost",
    className: "bg-red-100 text-red-700 hover:bg-red-100 border-red-200",
  },
  abandoned: {
    label: "Abandoned",
    className: "bg-gray-100 text-gray-500 hover:bg-gray-100 border-gray-200",
  },
};

interface OpportunityStatusBadgeProps {
  status: string;
  className?: string;
}

export function OpportunityStatusBadge({
  status,
  className,
}: OpportunityStatusBadgeProps) {
  const config = statusStyles[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-500",
  };

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}

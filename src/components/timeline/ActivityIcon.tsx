"use client";

import {
  Mail,
  MessageSquare,
  Phone,
  StickyNote,
  CheckSquare,
  Calendar,
  DollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { TimelineItemType } from "@/types/timeline";

const iconConfig: Record<
  TimelineItemType,
  { icon: typeof Mail; className: string; bg: string }
> = {
  email: { icon: Mail, className: "text-blue-600", bg: "bg-blue-100" },
  sms: { icon: MessageSquare, className: "text-green-600", bg: "bg-green-100" },
  call: { icon: Phone, className: "text-amber-600", bg: "bg-amber-100" },
  note: { icon: StickyNote, className: "text-gray-600", bg: "bg-gray-100" },
  task: { icon: CheckSquare, className: "text-purple-600", bg: "bg-purple-100" },
  appointment: { icon: Calendar, className: "text-teal-600", bg: "bg-teal-100" },
  opportunity: { icon: DollarSign, className: "text-emerald-600", bg: "bg-emerald-100" },
};

interface ActivityIconProps {
  type: TimelineItemType;
  className?: string;
}

export function ActivityIcon({ type, className }: ActivityIconProps) {
  const config = iconConfig[type];
  const Icon = config.icon;
  return (
    <div
      className={cn(
        "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
        config.bg,
        className
      )}
    >
      <Icon className={cn("h-4 w-4", config.className)} />
    </div>
  );
}

export function getTypeLabel(type: TimelineItemType): string {
  const labels: Record<TimelineItemType, string> = {
    email: "Email",
    sms: "SMS",
    call: "Call",
    note: "Note",
    task: "Task",
    appointment: "Meeting",
    opportunity: "Opportunity",
  };
  return labels[type];
}

export function getTypeBorderColor(type: TimelineItemType): string {
  const colors: Record<TimelineItemType, string> = {
    email: "border-l-blue-500",
    sms: "border-l-green-500",
    call: "border-l-amber-500",
    note: "border-l-gray-400",
    task: "border-l-purple-500",
    appointment: "border-l-teal-500",
    opportunity: "border-l-emerald-500",
  };
  return colors[type];
}

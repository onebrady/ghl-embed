export type TimelineItemType =
  | "email"
  | "sms"
  | "call"
  | "note"
  | "task"
  | "appointment"
  | "opportunity";

export type TimelineFilterValue = "all" | TimelineItemType;

export interface TimelineItem {
  id: string;
  type: TimelineItemType;
  timestamp: string; // ISO 8601
  title: string;
  preview: string;
  direction?: "inbound" | "outbound";
  status?: string;
  metadata: Record<string, unknown>;
  raw: unknown;
}

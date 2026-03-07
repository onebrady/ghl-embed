import type {
  GHLMessage,
  GHLNote,
  GHLTask,
  GHLAppointment,
  GHLOpportunity,
} from "@/lib/ghl/types";
import type { TimelineItem, TimelineItemType, TimelineFilterValue } from "@/types/timeline";

function truncate(text: string, maxLength = 120): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "\u2026";
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim();
}

// ─── Message Type Mapping ───

const EMAIL_TYPES = new Set([
  "TYPE_EMAIL",
  "TYPE_CAMPAIGN_EMAIL",
  "TYPE_CUSTOM_EMAIL",
  "TYPE_CUSTOM_PROVIDER_EMAIL",
]);

const SMS_TYPES = new Set([
  "TYPE_SMS",
  "TYPE_CAMPAIGN_SMS",
  "TYPE_CUSTOM_SMS",
  "TYPE_CUSTOM_PROVIDER_SMS",
]);

const CALL_TYPES = new Set([
  "TYPE_CALL",
  "TYPE_CAMPAIGN_CALL",
  "TYPE_IVR_CALL",
  "TYPE_CUSTOM_CALL",
]);

function getMessageTimelineType(messageType: string): TimelineItemType | null {
  if (EMAIL_TYPES.has(messageType)) return "email";
  if (SMS_TYPES.has(messageType)) return "sms";
  if (CALL_TYPES.has(messageType)) return "call";
  return null;
}

function getMessageTitle(type: TimelineItemType, direction: "inbound" | "outbound"): string {
  const labels: Record<TimelineItemType, string> = {
    email: "Email",
    sms: "SMS",
    call: "Call",
    note: "Note",
    task: "Task",
    appointment: "Appointment",
    opportunity: "Opportunity",
  };
  const dirLabel = direction === "inbound" ? "Received" : "Sent";
  return `${labels[type]} ${dirLabel}`;
}

// ─── Normalizers ───

function normalizeMessages(messages: GHLMessage[]): TimelineItem[] {
  const items: TimelineItem[] = [];

  for (const msg of messages) {
    const type = getMessageTimelineType(msg.messageType);
    if (!type) continue;

    const bodyText = msg.body ? stripHtml(msg.body) : "";

    items.push({
      id: msg.id,
      type,
      timestamp: msg.dateAdded,
      title: getMessageTitle(type, msg.direction),
      preview: bodyText ? truncate(bodyText) : "(No content)",
      direction: msg.direction,
      status: msg.status,
      metadata: {
        conversationId: msg.conversationId,
        contentType: msg.contentType,
        attachments: msg.attachments,
        source: msg.source,
      },
      raw: msg,
    });
  }

  return items;
}

function normalizeNotes(notes: GHLNote[]): TimelineItem[] {
  return notes.map((note) => ({
    id: note.id,
    type: "note" as const,
    timestamp: note.dateAdded || new Date().toISOString(),
    title: "Note",
    preview: truncate(stripHtml(note.body)),
    metadata: {
      userId: note.userId,
    },
    raw: note,
  }));
}

function normalizeTasks(tasks: GHLTask[]): TimelineItem[] {
  return tasks.map((task) => ({
    id: task.id,
    type: "task" as const,
    timestamp: task.dueDate || new Date().toISOString(),
    title: task.title,
    preview: task.body ? truncate(stripHtml(task.body)) : `Due: ${task.dueDate ?? "No date"}`,
    status: task.completed ? "completed" : "pending",
    metadata: {
      assignedTo: task.assignedTo,
      completed: task.completed,
      dueDate: task.dueDate,
    },
    raw: task,
  }));
}

function normalizeAppointments(appointments: GHLAppointment[]): TimelineItem[] {
  return appointments.map((apt) => ({
    id: apt.id,
    type: "appointment" as const,
    timestamp: apt.startTime || apt.dateAdded || new Date().toISOString(),
    title: apt.title || "Appointment",
    preview: apt.notes ? truncate(stripHtml(apt.notes)) : formatTimeRange(apt.startTime, apt.endTime),
    status: apt.appointmentStatus || apt.status,
    metadata: {
      calendarId: apt.calendarId,
      startTime: apt.startTime,
      endTime: apt.endTime,
      address: apt.address,
    },
    raw: apt,
  }));
}

function formatTimeRange(start?: string, end?: string): string {
  if (!start) return "No time set";
  const startDate = new Date(start);
  const timeStr = startDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  if (!end) return timeStr;
  const endDate = new Date(end);
  const endTimeStr = endDate.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${timeStr} - ${endTimeStr}`;
}

function normalizeOpportunities(opportunities: GHLOpportunity[]): TimelineItem[] {
  return opportunities.map((opp) => ({
    id: opp.id,
    type: "opportunity" as const,
    timestamp: opp.createdAt || new Date().toISOString(),
    title: opp.name,
    preview: opp.monetaryValue
      ? `$${opp.monetaryValue.toLocaleString()} \u2014 ${opp.status}`
      : opp.status,
    status: opp.status,
    metadata: {
      pipelineId: opp.pipelineId,
      pipelineStageId: opp.pipelineStageId,
      monetaryValue: opp.monetaryValue,
      assignedTo: opp.assignedTo,
    },
    raw: opp,
  }));
}

// ─── Aggregation ───

export interface TimelineSources {
  messages: GHLMessage[];
  notes: GHLNote[];
  tasks: GHLTask[];
  appointments: GHLAppointment[];
  opportunities: GHLOpportunity[];
}

export function aggregateTimeline(sources: TimelineSources): TimelineItem[] {
  const all = [
    ...normalizeMessages(sources.messages),
    ...normalizeNotes(sources.notes),
    ...normalizeTasks(sources.tasks),
    ...normalizeAppointments(sources.appointments),
    ...normalizeOpportunities(sources.opportunities),
  ];

  return all.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function filterTimeline(
  items: TimelineItem[],
  filter: TimelineFilterValue
): TimelineItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.type === filter);
}

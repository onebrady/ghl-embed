"use client";

import { useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { ChevronDown, ChevronUp, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ActivityIcon, getTypeLabel, getTypeBorderColor } from "./ActivityIcon";
import type { TimelineItem as TimelineItemData } from "@/types/timeline";
import type { GHLNote, GHLTask, GHLAppointment, GHLOpportunity, GHLMessage } from "@/lib/ghl/types";
import type { DealEmail } from "@/lib/supabase/deal-emails";

interface TimelineItemProps {
  item: TimelineItemData;
}

export function TimelineItem({ item }: TimelineItemProps) {
  const [expanded, setExpanded] = useState(false);

  const relativeTime = formatDistanceToNow(new Date(item.timestamp), {
    addSuffix: true,
  });
  const fullDate = format(new Date(item.timestamp), "MMM d, yyyy 'at' h:mm a");

  return (
    <div
      className={cn(
        "rounded-lg border border-l-2 transition-colors hover:bg-muted/30",
        getTypeBorderColor(item.type),
        expanded && "bg-muted/20"
      )}
    >
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 p-3 text-left"
      >
        <ActivityIcon type={item.type} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              {getTypeLabel(item.type)}
            </span>
            {item.direction && (
              <DirectionBadge direction={item.direction} />
            )}
            {item.status && (
              <StatusBadge status={item.status} type={item.type} />
            )}
          </div>
          <p className="mt-0.5 text-sm font-medium">{item.title}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {item.preview}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span className="text-[11px] text-muted-foreground" title={fullDate}>
            {relativeTime}
          </span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-3 py-3 pl-14">
          <ExpandedDetail item={item} fullDate={fullDate} />
        </div>
      )}
    </div>
  );
}

function DirectionBadge({ direction }: { direction: "inbound" | "outbound" }) {
  return (
    <Badge variant="outline" className="h-4 gap-0.5 px-1 text-[10px]">
      {direction === "inbound" ? (
        <>
          <ArrowDownLeft className="h-2.5 w-2.5" />
          In
        </>
      ) : (
        <>
          <ArrowUpRight className="h-2.5 w-2.5" />
          Out
        </>
      )}
    </Badge>
  );
}

function StatusBadge({ status, type }: { status: string; type: string }) {
  let variant: "default" | "secondary" | "outline" | "destructive" = "secondary";

  if (status === "completed" || status === "won" || status === "delivered" || status === "read" || status === "showed" || status === "confirmed") {
    variant = "default";
  } else if (status === "failed" || status === "lost" || status === "noshow" || status === "cancelled") {
    variant = "destructive";
  }

  // Don't show redundant statuses
  if (type === "note") return null;

  return (
    <Badge variant={variant} className="h-4 px-1 text-[10px]">
      {status}
    </Badge>
  );
}

function ExpandedDetail({ item, fullDate }: { item: TimelineItemData; fullDate: string }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs text-muted-foreground">{fullDate}</p>

      {item.type === "email" || item.type === "sms" || item.type === "call" ? (
        <MessageDetail message={item.raw as GHLMessage} />
      ) : item.type === "deal_email" ? (
        <DealEmailDetail email={item.raw as DealEmail} />
      ) : item.type === "note" ? (
        <NoteDetail note={item.raw as GHLNote} />
      ) : item.type === "task" ? (
        <TaskDetail task={item.raw as GHLTask} />
      ) : item.type === "appointment" ? (
        <AppointmentDetail appointment={item.raw as GHLAppointment} />
      ) : item.type === "opportunity" ? (
        <OpportunityDetail opportunity={item.raw as GHLOpportunity} />
      ) : null}
    </div>
  );
}

function MessageDetail({ message }: { message: GHLMessage }) {
  const body = message.body ?? "";
  const isHtml = body.includes("<") && body.includes(">");

  return (
    <div className="space-y-1">
      {message.source && (
        <p className="text-xs text-muted-foreground">
          Source: {message.source}
        </p>
      )}
      {isHtml ? (
        <div
          className="prose prose-sm max-h-96 max-w-none overflow-y-auto rounded border bg-background p-3 text-xs"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm">{body || "(No content)"}</p>
      )}
      {message.attachments && message.attachments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {message.attachments.length} attachment(s)
        </p>
      )}
    </div>
  );
}

function NoteDetail({ note }: { note: GHLNote }) {
  return (
    <div className="whitespace-pre-wrap text-sm">
      {note.body}
    </div>
  );
}

function TaskDetail({ task }: { task: GHLTask }) {
  return (
    <div className="space-y-1">
      {task.body && (
        <p className="whitespace-pre-wrap text-sm">{task.body}</p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {task.dueDate && (
          <span>Due: {format(new Date(task.dueDate), "MMM d, yyyy")}</span>
        )}
        <span>Status: {task.completed ? "Completed" : "Pending"}</span>
        {task.assignedTo && <span>Assigned: {task.assignedTo}</span>}
      </div>
    </div>
  );
}

function AppointmentDetail({ appointment }: { appointment: GHLAppointment }) {
  return (
    <div className="space-y-1">
      {appointment.notes && (
        <p className="whitespace-pre-wrap text-sm">{appointment.notes}</p>
      )}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {appointment.startTime && (
          <span>
            Start: {format(new Date(appointment.startTime), "MMM d, yyyy h:mm a")}
          </span>
        )}
        {appointment.endTime && (
          <span>
            End: {format(new Date(appointment.endTime), "h:mm a")}
          </span>
        )}
        {appointment.address && <span>Location: {appointment.address}</span>}
        {(appointment.appointmentStatus || appointment.status) && (
          <span>Status: {appointment.appointmentStatus || appointment.status}</span>
        )}
      </div>
    </div>
  );
}

function OpportunityDetail({ opportunity }: { opportunity: GHLOpportunity }) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        {opportunity.monetaryValue !== undefined && (
          <span>Value: ${opportunity.monetaryValue.toLocaleString()}</span>
        )}
        <span>Status: {opportunity.status}</span>
        {opportunity.source && <span>Source: {opportunity.source}</span>}
        {opportunity.createdAt && (
          <span>
            Created: {format(new Date(opportunity.createdAt), "MMM d, yyyy")}
          </span>
        )}
      </div>
    </div>
  );
}

function DealEmailDetail({ email }: { email: DealEmail }) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span>
          From: {email.from_name ? `${email.from_name} <${email.from_email}>` : email.from_email}
        </span>
        <span>
          To: {email.to_emails.map((r) => r.name || r.email).join(", ")}
        </span>
        {email.cc_emails.length > 0 && (
          <span>
            CC: {email.cc_emails.map((r) => r.name || r.email).join(", ")}
          </span>
        )}
      </div>
      {email.subject && (
        <p className="text-sm font-medium">{email.subject}</p>
      )}
      {email.body_html ? (
        <div
          className="prose prose-sm max-h-96 max-w-none overflow-y-auto rounded border bg-background p-3 text-xs"
          dangerouslySetInnerHTML={{ __html: email.body_html }}
        />
      ) : (
        <p className="whitespace-pre-wrap text-sm">
          {email.body_text || "(No content)"}
        </p>
      )}
      {email.attachments.length > 0 && (
        <p className="text-xs text-muted-foreground">
          {email.attachments.length} attachment(s)
        </p>
      )}
    </div>
  );
}

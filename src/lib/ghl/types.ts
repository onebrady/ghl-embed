// ─── Contact ───

export interface GHLContact {
  id: string;
  locationId?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  address1?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  timezone?: string;
  source?: string;
  tags?: string[];
  dnd?: boolean;
  dndSettings?: Record<string, GHLDndSetting>;
  assignedTo?: string;
  dateOfBirth?: string;
  dateAdded?: string;
  dateUpdated?: string;
  lastActivity?: string;
  customFields?: GHLCustomFieldValue[];
  businessId?: string;
}

export interface GHLDndSetting {
  status: "active" | "inactive" | "permanent";
  message?: string;
}

export interface GHLCustomFieldValue {
  id: string;
  value?: string;
}

export interface GHLContactListItem {
  id: string;
  locationId?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  phone?: string;
  companyName?: string;
  source?: string;
  dateAdded?: string;
  lastActivity?: string;
  tags?: string[];
  customFields?: GHLCustomFieldValue[];
}

export interface GHLUpdateContactBody {
  firstName?: string | null;
  lastName?: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  address1?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string;
  website?: string | null;
  timezone?: string | null;
  country?: string;
  source?: string | null;
  tags?: string[];
  dnd?: boolean;
  assignedTo?: string | null;
  customFields?: { id?: string; key?: string; field_value?: string | string[] }[];
}

// ─── Custom Fields ───

export interface GHLCustomFieldDefinition {
  id: string;
  name: string;
  fieldKey: string;
  dataType: string;
  placeholder?: string;
  position?: number;
  picklistOptions?: string[];
  picklistImageOptions?: string[];
  isAllowedCustomOption?: boolean;
  isMultiFileAllowed?: boolean;
  maxFileLimit?: number;
  locationId?: string;
  model?: string;
  parentId?: string;
}

// ─── Location ───

export interface GHLLocation {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  website?: string;
  timezone?: string;
  companyId?: string;
  business?: { name?: string };
}

// ─── API Response Wrappers ───

export interface GHLContactResponse {
  contact: GHLContact;
}

export interface GHLContactsListResponse {
  contacts: GHLContactListItem[];
  count: number;
}

export interface GHLContactUpdateResponse {
  succeded: boolean; // GHL API typo — this is intentional
  contact: GHLContact;
}

export interface GHLCustomFieldsResponse {
  customFields: GHLCustomFieldDefinition[];
}

export interface GHLLocationResponse {
  location: GHLLocation;
}

export interface GHLLocationsSearchResponse {
  locations: GHLLocation[];
}

// ─── Conversation ───

export interface GHLConversation {
  id: string;
  contactId: string;
  locationId: string;
  lastMessageBody?: string;
  lastMessageType?: string;
  lastMessageDate?: string;
  type?: string;
  unreadCount?: number;
  fullName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
}

export interface GHLConversationsSearchResponse {
  conversations: GHLConversation[];
  total: number;
}

// ─── Message ───

export interface GHLMessage {
  id: string;
  type?: number;
  messageType: string;
  locationId: string;
  contactId: string;
  conversationId: string;
  dateAdded: string;
  body?: string;
  direction: 'inbound' | 'outbound';
  status?: string;
  contentType?: string;
  attachments?: string[];
  source?: string;
  userId?: string;
  meta?: Record<string, unknown>;
}

export interface GHLMessagesResponse {
  messages: {
    lastMessageId: string;
    nextPage: boolean;
    messages: GHLMessage[];
  };
}

// ─── Note ───

export interface GHLNote {
  id: string;
  body: string;
  userId?: string;
  dateAdded?: string;
  contactId?: string;
}

export interface GHLNotesListResponse {
  notes: GHLNote[];
}

export interface GHLCreateNoteBody {
  body: string;
  userId?: string;
}

export interface GHLCreateNoteResponse {
  note: GHLNote;
}

// ─── Task ───

export interface GHLTask {
  id: string;
  title: string;
  body?: string;
  assignedTo?: string;
  dueDate?: string;
  completed?: boolean;
  contactId?: string;
}

export interface GHLTasksListResponse {
  tasks: GHLTask[];
}

export interface GHLCreateTaskBody {
  title: string;
  body?: string;
  dueDate: string;
  completed: boolean;
  assignedTo?: string;
}

export interface GHLCreateTaskResponse {
  task: GHLTask;
}

// ─── Appointment ───

export interface GHLAppointment {
  id: string;
  calendarId?: string;
  status?: string;
  title?: string;
  assignedUserId?: string;
  notes?: string;
  startTime?: string;
  endTime?: string;
  address?: string;
  locationId?: string;
  contactId?: string;
  appointmentStatus?: string;
  dateAdded?: string;
  dateUpdated?: string;
}

export interface GHLAppointmentsResponse {
  events: GHLAppointment[];
}

// ─── Pipeline & Stage ───

export interface GHLPipelineStage {
  id: string;
  name: string;
  position?: number;
  showInFunnel?: boolean;
  showInPieChart?: boolean;
}

export interface GHLPipeline {
  id: string;
  name: string;
  stages: GHLPipelineStage[];
  showInFunnel?: boolean;
  showInPieChart?: boolean;
  locationId?: string;
}

export interface GHLPipelinesResponse {
  pipelines: GHLPipeline[];
}

// ─── Opportunity ───

export type GHLOpportunityStatus = "open" | "won" | "lost" | "abandoned";

export interface GHLOpportunityContact {
  id: string;
  name?: string;
  companyName?: string;
  email?: string;
  phone?: string;
  tags?: string[];
}

export interface GHLOpportunity {
  id: string;
  name: string;
  monetaryValue?: number;
  pipelineId?: string;
  pipelineStageId?: string;
  assignedTo?: string;
  status: string;
  source?: string;
  lastStatusChangeAt?: string;
  lastStageChangeAt?: string;
  lastActionDate?: string;
  createdAt?: string;
  updatedAt?: string;
  contactId?: string;
  locationId?: string;
  contact?: GHLOpportunityContact;
  customFields?: GHLCustomFieldValue[];
}

export interface GHLOpportunityResponse {
  opportunity: GHLOpportunity;
}

export interface GHLOpportunitiesSearchResponse {
  opportunities: GHLOpportunity[];
  meta?: { total?: number; currentPage?: number; nextPage?: number };
}

export interface GHLUpdateOpportunityBody {
  pipelineId?: string;
  name?: string;
  pipelineStageId?: string;
  status?: string;
  monetaryValue?: number;
  assignedTo?: string;
  customFields?: { id?: string; key?: string; field_value?: string | string[] }[];
}

export interface GHLUpdateOpportunityResponse {
  opportunity: GHLOpportunity;
}

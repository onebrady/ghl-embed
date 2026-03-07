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

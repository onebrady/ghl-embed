import { createClient } from "./client";

export interface CustomAssociation {
  id: string;
  ghl_location_id: string;
  source_type: string;
  source_id: string;
  target_type: string;
  target_id: string;
  association_type: string;
  label?: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export type AssociationRecordType = "contact" | "opportunity" | "company";

export async function getAssociationsForRecord(
  locationId: string,
  recordType: AssociationRecordType,
  recordId: string
): Promise<CustomAssociation[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("custom_associations")
    .select("*")
    .eq("ghl_location_id", locationId)
    .or(
      `and(source_type.eq.${recordType},source_id.eq.${recordId}),and(target_type.eq.${recordType},target_id.eq.${recordId})`
    );

  if (error) throw error;
  return data ?? [];
}

export async function createAssociation(
  association: Omit<CustomAssociation, "id" | "created_at">
): Promise<CustomAssociation> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("custom_associations")
    .insert(association)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAssociation(id: string): Promise<void> {
  const supabase = createClient();

  const { error } = await supabase
    .from("custom_associations")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

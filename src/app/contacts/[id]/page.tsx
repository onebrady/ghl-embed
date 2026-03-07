import { ContactRecordView } from "@/components/contact/ContactRecordView";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ContactRecordView contactId={id} />;
}

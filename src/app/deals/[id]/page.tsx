import { DealRecordView } from "@/components/deal/DealRecordView";

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <DealRecordView opportunityId={id} />;
}

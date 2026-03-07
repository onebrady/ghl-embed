import { DealsDataTable } from "@/components/list/DealsDataTable";

export default function DealsPage() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Deals</h1>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <DealsDataTable />
      </div>
    </div>
  );
}

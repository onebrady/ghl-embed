import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function ContactNotFound() {
  return (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex max-w-md flex-col items-center gap-4 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <FileQuestion className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Contact not found</h2>
          <p className="text-sm text-muted-foreground">
            This contact may have been deleted or you may not have access.
          </p>
        </div>
        <Link
          href="/contacts"
          className="inline-flex h-7 items-center justify-center gap-1 rounded-lg border border-border bg-background px-2.5 text-[0.8rem] font-medium hover:bg-muted hover:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50"
        >
          Back to Contacts
        </Link>
      </div>
    </div>
  );
}

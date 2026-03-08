"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { preload } from "swr";
import { useContacts } from "@/hooks/useContacts";
import { ContactsFilterBar } from "./ContactsFilterBar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { format, parseISO } from "date-fns";
import type { GHLContactListItem } from "@/lib/ghl/types";

function getDisplayName(contact: GHLContactListItem): string {
  if (contact.firstName || contact.lastName) {
    return [contact.firstName, contact.lastName].filter(Boolean).join(" ");
  }
  return contact.name || contact.email || "Unknown";
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return format(parseISO(iso), "MMM d, yyyy");
  } catch {
    return iso;
  }
}

export function ContactsDataTable() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { contacts, count, isLoading, error } = useContacts({
    query: searchQuery || undefined,
    limit: 50,
  });

  const fetcher = useCallback(
    (url: string) =>
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
        return res.json();
      }),
    []
  );

  const handleRowHover = useCallback(
    (contactId: string) => {
      preload(`/api/ghl/contacts/${contactId}`, fetcher);
    },
    [fetcher]
  );

  return (
    <div className="space-y-4">
      <ContactsFilterBar onSearch={setSearchQuery} total={count} />

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          Failed to load contacts. Please try again.
        </div>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[220px]">Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="w-[120px]">Date Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : contacts.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="h-32 text-center text-muted-foreground"
                >
                  {searchQuery ? "No contacts match your search." : "No contacts found."}
                </TableCell>
              </TableRow>
            ) : (
              contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/contacts/${contact.id}`)}
                  onMouseEnter={() => handleRowHover(contact.id)}
                >
                  <TableCell className="font-medium">
                    {getDisplayName(contact)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.email || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.phone || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {contact.source || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(contact.tags ?? []).slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {(contact.tags ?? []).length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{(contact.tags ?? []).length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(contact.dateAdded)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type SortingState,
  type ColumnDef,
} from "@tanstack/react-table";
import { useMetadata, useMatchesByYear } from "@/hooks/use-data";
import { formatDate, formatDuration } from "@/lib/data";
import { LEVEL_LABELS, type Match } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search } from "lucide-react";

const SURFACE_BADGE_STYLES: Record<string, string> = {
  Hard: "bg-blue-600/15 text-blue-600 border-blue-600/20",
  Clay: "bg-orange-600/15 text-orange-600 border-orange-600/20",
  Grass: "bg-green-600/15 text-green-600 border-green-600/20",
  Carpet: "bg-purple-600/15 text-purple-600 border-purple-600/20",
};

export default function ExplorePage() {
  const { data: metadata, loading: metaLoading } = useMetadata();

  const latestYear = metadata?.available_years?.[metadata.available_years.length - 1] ?? null;
  const [selectedYear, setSelectedYear] = useState<number | null>(null);


  const activeYear = selectedYear ?? latestYear;

  const { data: matches, loading: matchesLoading } = useMatchesByYear(activeYear);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo<ColumnDef<Match>[]>(
    () => [
      {
        accessorKey: "td",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="text-muted-foreground text-xs">
            {formatDate(getValue<number | null>())}
          </span>
        ),
      },
      {
        accessorKey: "tn",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Tournament
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue<string>()}</span>
        ),
      },
      {
        accessorKey: "sf",
        header: "Surface",
        cell: ({ getValue }) => {
          const sf = getValue<string | null>();
          if (!sf) return <span className="text-muted-foreground">—</span>;
          return (
            <Badge
              variant="outline"
              className={SURFACE_BADGE_STYLES[sf] ?? ""}
            >
              {sf}
            </Badge>
          );
        },
        filterFn: "equalsString",
      },
      {
        accessorKey: "tl",
        header: "Level",
        cell: ({ getValue }) => {
          const tl = getValue<string>();
          return (
            <span className="text-xs">{LEVEL_LABELS[tl] ?? tl}</span>
          );
        },
      },
      {
        accessorKey: "rd",
        header: "Round",
        cell: ({ getValue }) => (
          <span className="text-xs">{getValue<string | null>() ?? "—"}</span>
        ),
      },
      {
        accessorKey: "wn",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Winner
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <span className="font-medium">{row.original.wn}</span>
            {row.original.wc && (
              <span className="ml-1.5 text-muted-foreground text-xs">
                {row.original.wc}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "ln",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Loser
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }) => (
          <div>
            <span>{row.original.ln}</span>
            {row.original.lc && (
              <span className="ml-1.5 text-muted-foreground text-xs">
                {row.original.lc}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: "sc",
        header: "Score",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs">
            {getValue<string | null>() ?? "—"}
          </span>
        ),
        enableSorting: false,
      },
      {
        accessorKey: "mi",
        header: ({ column }) => (
          <Button
            variant="ghost"
            size="sm"
            className="-ml-3 h-8"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ getValue }) => (
          <span className="text-xs text-muted-foreground">
            {formatDuration(getValue<number | null>())}
          </span>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: matches ?? [],
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 50 },
    },
  });

  const isLoading = metaLoading || matchesLoading;

  if (metaLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-10 w-48 rounded-md bg-muted/50 animate-pulse mb-2" />
          <div className="h-5 w-72 rounded-md bg-muted/50 animate-pulse" />
        </div>
        <div className="h-12 w-full rounded-md bg-muted/50 animate-pulse" />
        <div className="h-[600px] w-full rounded-xl bg-muted/50 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Explore</h1>
        <p className="text-muted-foreground">
          Browse and search match-level data across the ATP Tour
        </p>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Select
            value={String(activeYear ?? "")}
            onValueChange={(v) => setSelectedYear(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {metadata?.available_years
                ?.slice()
                .reverse()
                .map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>

          {!isLoading && matches && (
            <span className="text-sm text-muted-foreground">
              {table.getFilteredRowModel().rows.length.toLocaleString()} matches
            </span>
          )}
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search players, tournaments..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Data Table */}
      <Card>
        <CardContent className="p-0">
          {matchesLoading ? (
            <div className="flex h-96 items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
                <span className="text-sm text-muted-foreground">
                  Loading {activeYear} matches…
                </span>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No matches found.
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!matchesLoading && matches && matches.length > 0 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table"
import { Edit, ChevronDown, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Report } from "@/types/report"
import { formatCurrency } from "@/lib/utils"
import { DeleteAlert } from "@/components/delete-alert"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ReportDetail } from "@/components/report-detail"

interface ReportsTableProps {
  reports: Report[]
  onEdit: (report: Report) => void
  onDelete: (id: string) => void
}

export function ReportsTable({ reports, onEdit, onDelete }: ReportsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "date", desc: true }])
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const openReportDetail = (report: Report) => {
    setSelectedReport(report)
    setIsDetailOpen(true)
  }

  const columns: ColumnDef<Report>[] = [
    {
      id: "expand",
      cell: ({ row }) => {
        return (
          <Button variant="ghost" size="icon" onClick={() => openReportDetail(row.original)} className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        )
      },
      enableSorting: false,
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-medium"
          >
            Date
            <ChevronDown className={`ml-2 h-4 w-4 ${column.getIsSorted() === "asc" ? "rotate-180" : ""}`} />
          </Button>
        )
      },
      cell: ({ row }) => {
        try {
          const date = row.original.date
          const formattedDate =
            date instanceof Date ? format(date, "MMM d, yyyy") : format(new Date(date), "MMM d, yyyy")
          return <div>{formattedDate}</div>
        } catch (error) {
          console.error("Error formatting date:", error)
          return <div>Invalid date</div>
        }
      },
    },
    {
      accessorKey: "totalIncome",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-medium"
          >
            Income
            <ChevronDown className={`ml-2 h-4 w-4 ${column.getIsSorted() === "asc" ? "rotate-180" : ""}`} />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div>₱{formatCurrency(row.original.totalIncome || 0)}</div>
      },
    },
    {
      accessorKey: "totalExpenses",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-medium"
          >
            Expenses
            <ChevronDown className={`ml-2 h-4 w-4 ${column.getIsSorted() === "asc" ? "rotate-180" : ""}`} />
          </Button>
        )
      },
      cell: ({ row }) => {
        return <div>₱{formatCurrency(row.original.totalExpenses || 0)}</div>
      },
    },
    {
      accessorKey: "netIncome",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="font-medium"
          >
            Net Income
            <ChevronDown className={`ml-2 h-4 w-4 ${column.getIsSorted() === "asc" ? "rotate-180" : ""}`} />
          </Button>
        )
      },
      cell: ({ row }) => {
        const netIncome = row.original.netIncome || 0
        return <div className={netIncome >= 0 ? "text-green-500" : "text-red-500"}>₱{formatCurrency(netIncome)}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openReportDetail(row.original)}
              className="whitespace-nowrap"
            >
              View Details
            </Button>
            <Button variant="ghost" size="icon" onClick={() => onEdit(row.original)}>
              <Edit className="h-4 w-4" />
            </Button>
            <DeleteAlert onDelete={() => onDelete(row.original.id!)} />
          </div>
        )
      },
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: reports,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  })

  return (
    <>
      <div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No reports found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Next
          </Button>
        </div>
      </div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Report Details</DialogTitle>
            <p className="text-sm text-muted-foreground mt-1">View the complete details of this report</p>
          </DialogHeader>
          {selectedReport && <ReportDetail report={selectedReport} />}
        </DialogContent>
      </Dialog>
    </>
  )
}


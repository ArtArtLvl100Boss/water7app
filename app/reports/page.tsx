"use client"

import { useState } from "react"
import { Plus, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { useReports } from "@/hooks/use-reports"
import { ReportCard } from "@/components/report-card"
import { ReportsTable } from "@/components/reports-table"
import type { Report } from "@/types/report"
import { useRouter } from "next/navigation"
import { FirebaseSetupGuide } from "@/components/firebase-setup-guide"
import { MonthYearPicker } from "@/components/month-year-picker"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

export default function ReportsPage() {
  const { reports, loading, error, deleteReport, dateFilter, setDateFilter, refreshReports } = useReports()
  const [viewMode, setViewMode] = useState<"card" | "table">("card")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleEdit = (report: Report) => {
    router.push(`/reports/edit/${report.id}`)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteReport(id)
      // Refresh the reports list after deletion
      refreshReports()
    } catch (error) {
      console.error("Error in delete handler:", error)
      toast({
        title: "Delete Failed",
        description: "There was a problem deleting the report.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <Button onClick={() => router.push("/reports/new")}>
          <Plus className="mr-2 h-4 w-4" /> New Report
        </Button>
      </div>

      {error && <FirebaseSetupGuide />}

      <div className="flex justify-between items-center mb-4">
        <DropdownMenu open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant={dateFilter ? "default" : "outline"}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "MMMM yyyy") : "Filter by Month"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="p-4 w-auto">
            <MonthYearPicker
              date={dateFilter}
              onDateChange={setDateFilter}
              showClearButton={true}
              onClear={() => {
                setDateFilter(null)
                setIsFilterOpen(false)
              }}
            />
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex border rounded-md">
          <Button variant="ghost" className={viewMode === "card" ? "bg-muted" : ""} onClick={() => setViewMode("card")}>
            Cards
          </Button>
          <Button
            variant="ghost"
            className={viewMode === "table" ? "bg-muted" : ""}
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <p className="text-muted-foreground mb-4">No reports found</p>
          <Button onClick={() => router.push("/reports/new")}>Create your first report</Button>
        </div>
      ) : viewMode === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <ReportCard key={report.id} report={report} onEdit={handleEdit} onDelete={() => handleDelete(report.id!)} />
          ))}
        </div>
      ) : (
        <ReportsTable reports={reports} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  )
}


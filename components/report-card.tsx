"use client"

import { useRef, useState } from "react"
import { format } from "date-fns"
import { Edit, ChevronDown, ChevronUp, Copy, Download } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Report } from "@/types/report"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { DeleteAlert } from "@/components/delete-alert"
import { generateReportText, saveReportAsImage } from "@/lib/report-utils"
import { useToast } from "@/hooks/use-toast"

interface ReportCardProps {
  report: Report
  onEdit: (report: Report) => void
  onDelete: (id: string) => void
}

export function ReportCard({ report, onEdit, onDelete }: ReportCardProps) {
  const [expanded, setExpanded] = useState(false)
  const { toast } = useToast()
  const { theme } = useTheme()
  const reportRef = useRef<HTMLDivElement>(null)

  const toggleExpand = () => setExpanded(!expanded)

  // Safely format the date
  let formattedDate = "Unknown date"
  try {
    if (report.date instanceof Date) {
      formattedDate = format(report.date, "MMMM d, yyyy")
    } else if (report.date) {
      formattedDate = format(new Date(report.date), "MMMM d, yyyy")
    }
  } catch (error) {
    console.error("Error formatting date:", error)
  }

  const totalIncome = report.totalIncome || 0
  const totalExpenses = report.totalExpenses || 0
  const netIncome = report.netIncome || 0

  const copyReport = () => {
    const reportText = generateReportText(report)
    navigator.clipboard.writeText(reportText)
    toast({
      title: "Report copied to clipboard",
      description: "You can now paste and share it",
    })
  }

  const handleSaveImage = async () => {
    if (reportRef.current) {
      try {
        await saveReportAsImage(
          reportRef.current,
          theme,
          `water7-report-${report.id}-${formattedDate.replace(/\s/g, "-")}.png`,
        )
        toast({
          title: "Report saved as image",
          description: "The report has been downloaded as an image",
        })
      } catch (error) {
        toast({
          title: "Failed to save image",
          description: "There was an error creating the image",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <Card className="w-full">
      <div ref={reportRef}>
        <CardHeader className="pb-2">
          <CardTitle className="flex justify-between items-center">
            <span>{formattedDate}</span>
            <span className={cn("text-base font-medium", netIncome >= 0 ? "text-green-500" : "text-red-500")}>
              ₱{formatCurrency(netIncome)}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Total Income:</span>
            <span>₱{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Expenses:</span>
            <span>₱{formatCurrency(totalExpenses)}</span>
          </div>

          {expanded && (
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Income Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Water Sales:</span>
                  <span className="text-right">₱{formatCurrency(report.waterSales)}</span>
                  <span className="text-muted-foreground">Soap Sales:</span>
                  <span className="text-right">₱{formatCurrency(report.soapSales)}</span>
                </div>
              </div>

              {report.expenses.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Expenses</h4>
                  <div className="space-y-1">
                    {report.expenses.map((expense, index) => (
                      <div key={expense.id || index} className="flex justify-between text-sm">
                        <span>{expense.description || "N/A"}</span>
                        <span>₱{formatCurrency(expense.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </div>
      <CardFooter className="flex flex-col gap-2 pt-2">
        <div className="flex justify-between w-full">
          <Button variant="ghost" size="sm" onClick={toggleExpand}>
            {expanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-1" />
                More
              </>
            )}
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" onClick={() => onEdit(report)}>
              <Edit className="h-4 w-4" />
            </Button>
            <DeleteAlert onDelete={() => onDelete(report.id!)} />
          </div>
        </div>

        {expanded && (
          <div className="flex gap-2 w-full mt-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={copyReport}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Text
            </Button>
            <Button variant="outline" size="sm" className="flex-1" onClick={handleSaveImage}>
              <Download className="mr-2 h-4 w-4" />
              Save Image
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}


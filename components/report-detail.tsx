"use client"

import { useRef } from "react"
import { format } from "date-fns"
import { Copy, Download } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import type { Report } from "@/types/report"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { generateReportText, saveReportAsImage } from "@/lib/report-utils"
import { useToast } from "@/hooks/use-toast"

interface ReportDetailProps {
  report: Report
}

export function ReportDetail({ report }: ReportDetailProps) {
  const { toast } = useToast()
  const { theme } = useTheme()
  const reportRef = useRef<HTMLDivElement>(null)

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
    <div className="space-y-4">
      <div className="text-center mb-2">
        <h3 className="text-lg font-medium">Full Report Details</h3>
        <p className="text-sm text-muted-foreground">View, copy, or save this report</p>
      </div>
      <div ref={reportRef} className="overflow-hidden bg-background rounded-md border">
        <div className="p-6 text-center space-y-2">
          <h3 className="text-2xl text-foreground font-semibold">Water 7 Report</h3>
          <p className="text-muted-foreground text-base">{formattedDate}</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-base text-muted-foreground mb-3">INCOME</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-foreground">
                <span>Water Sales</span>
                <span>₱{formatCurrency(report.waterSales)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Soap Sales</span>
                <span>₱{formatCurrency(report.soapSales)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-medium text-foreground">
                <span>Total Income</span>
                <span>₱{formatCurrency(totalIncome)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base text-muted-foreground mb-3">EXPENSES</h4>
            <div className="space-y-2">
              {report.expenses.map((expense, index) =>
                expense.description || expense.amount ? (
                  <div key={expense.id || index} className="flex justify-between text-sm text-foreground">
                    <span>{expense.description || "Unnamed"}</span>
                    <span>₱{formatCurrency(expense.amount)}</span>
                  </div>
                ) : null,
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-medium text-foreground">
                <span>Total Expenses</span>
                <span>₱{formatCurrency(totalExpenses)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-base text-muted-foreground mb-3">SUMMARY</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-foreground">
                <span>Total Income</span>
                <span>₱{formatCurrency(totalIncome)}</span>
              </div>
              <div className="flex justify-between text-sm text-foreground">
                <span>Total Expenses</span>
                <span>₱{formatCurrency(totalExpenses)}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between text-sm font-bold text-foreground">
                <span>Net Income</span>
                <span className={cn(netIncome >= 0 ? "text-green-500" : "text-red-500")}>
                  ₱{formatCurrency(netIncome)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" className="flex-1" onClick={copyReport}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Text
        </Button>
        <Button variant="outline" className="flex-1" onClick={handleSaveImage}>
          <Download className="mr-2 h-4 w-4" />
          Save Image
        </Button>
      </div>
    </div>
  )
}


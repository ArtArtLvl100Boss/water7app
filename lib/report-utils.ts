import { format } from "date-fns"
import html2canvas from "html2canvas"
import type { Report } from "@/types/report"

export function generateReportText(report: Report): string {
  // Helper function to format currency with commas
  const formatCurrencyStr = (value: string | number): string => {
    const numValue = typeof value === "string" ? Number.parseFloat(value) || 0 : value
    return numValue.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const totalIncome = report.totalIncome || 0
  const totalExpenses = report.totalExpenses || 0
  const netIncome = report.netIncome || 0

  // Format date
  let dateStr = "Unknown date"
  try {
    if (report.date instanceof Date) {
      dateStr = format(report.date, "MMMM d, yyyy")
    } else if (report.date) {
      dateStr = format(new Date(report.date), "MMMM d, yyyy")
    }
  } catch (error) {
    console.error("Error formatting date:", error)
  }

  let reportText = "WATER 7 REPORT\n"
  reportText += dateStr + "\n"
  reportText += "========================\n\n"

  reportText += "INCOME:\n"
  reportText += `Water Sales: ₱${formatCurrencyStr(report.waterSales)}\n`
  reportText += `Soap Sales: ₱${formatCurrencyStr(report.soapSales)}\n`
  reportText += `Total Income: ₱${formatCurrencyStr(totalIncome)}\n\n`

  reportText += "EXPENSES:\n"
  report.expenses.forEach((expense) => {
    if (expense.description || expense.amount) {
      reportText += `${expense.description || "Unnamed"}: ₱${formatCurrencyStr(expense.amount)}\n`
    }
  })
  reportText += `Total Expenses: ₱${formatCurrencyStr(totalExpenses)}\n\n`

  reportText += "SUMMARY:\n"
  reportText += `Total Income: ₱${formatCurrencyStr(totalIncome)}\n`
  reportText += `Total Expenses: ₱${formatCurrencyStr(totalExpenses)}\n`
  reportText += `Net Income: ₱${formatCurrencyStr(netIncome)}\n`

  return reportText
}

export async function saveReportAsImage(
  reportElement: HTMLElement,
  theme: string | undefined,
  filename: string,
): Promise<void> {
  try {
    // Create a clone of the report element to modify for image capture
    const reportClone = reportElement.cloneNode(true) as HTMLElement
    document.body.appendChild(reportClone)

    // Apply styles to the clone for proper image capture
    reportClone.classList.add("force-colors")
    reportClone.style.position = "absolute"
    reportClone.style.left = "-9999px"
    reportClone.style.top = "-9999px"
    reportClone.style.width = reportElement.offsetWidth + "px"

    // If in dark mode, apply specific styles to match dark mode appearance
    if (theme === "dark") {
      const header = reportClone.querySelector("div:first-child") as HTMLElement
      if (header) {
        header.style.backgroundColor = "#000000"
        header.style.color = "#ffffff"
      }

      // Find and style the date text
      const dateText = header?.querySelector("p") as HTMLElement
      if (dateText) {
        dateText.style.color = "#9ca3af"
      }

      // Find and style section headers
      const sectionHeaders = reportClone.querySelectorAll("h4") as NodeListOf<HTMLElement>
      sectionHeaders.forEach((header) => {
        header.style.color = "#9ca3af"
      })

      // Find and style the net income
      const netIncome = reportClone.querySelector('[class*="text-green-500"], [class*="text-red-500"]') as HTMLElement
      if (netIncome) {
        if (Number.parseFloat(netIncome.textContent?.replace(/[^\d.-]/g, "") || "0") >= 0) {
          netIncome.style.color = "#10b981" // green-500
        } else {
          netIncome.style.color = "#ef4444" // red-500
        }
      }
    }

    // First, ensure the element is fully rendered
    await new Promise((resolve) => setTimeout(resolve, 100))

    const canvas = await html2canvas(reportClone, {
      backgroundColor: theme === "dark" ? "#09090b" : "#ffffff",
      scale: 2, // Higher resolution
    })

    // Remove the clone after capture
    document.body.removeChild(reportClone)

    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.href = image
    link.download = filename
    link.click()

    return Promise.resolve()
  } catch (error) {
    console.error("Error saving image:", error)
    return Promise.reject(error)
  }
}


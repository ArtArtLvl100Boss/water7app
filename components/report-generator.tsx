"use client"

import React from "react"
import { useState, useEffect } from "react"
import html2canvas from "html2canvas"
import { CalendarIcon, Copy, Download, Plus, Trash2 } from "lucide-react"
import { useTheme } from "next-themes"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

type Expense = {
  id: string
  description: string
  amount: string
}

export default function ReportGenerator() {
  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [date, setDate] = React.useState<Date>(new Date())
  const [waterSales, setWaterSales] = useState("")
  const [soapSales, setSoapSales] = useState("")
  const [expenses, setExpenses] = useState<Expense[]>([{ id: "1", description: "", amount: "" }])
  const [showReport, setShowReport] = useState(false)

  // Ensure component is mounted before accessing theme
  useEffect(() => {
    setMounted(true)
  }, [])

  const reportRef = React.useRef<HTMLDivElement>(null)

  const addExpense = () => {
    setExpenses([...expenses, { id: crypto.randomUUID(), description: "", amount: "" }])
  }

  const removeExpense = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter((expense) => expense.id !== id))
    }
  }

  const updateExpense = (id: string, field: "description" | "amount", value: string) => {
    setExpenses(expenses.map((expense) => (expense.id === id ? { ...expense, [field]: value } : expense)))
  }

  const calculateTotalIncome = () => {
    const water = Number.parseFloat(waterSales) || 0
    const soap = Number.parseFloat(soapSales) || 0
    return water + soap
  }

  const calculateTotalExpenses = () => {
    return expenses.reduce((total, expense) => {
      return total + (Number.parseFloat(expense.amount) || 0)
    }, 0)
  }

  const calculateNetIncome = () => {
    return calculateTotalIncome() - calculateTotalExpenses()
  }

  const generateReport = () => {
    setShowReport(true)
  }

  const copyReport = () => {
    const reportText = generateReportText()
    navigator.clipboard.writeText(reportText)
    toast({
      title: "Report copied to clipboard",
      description: "You can now paste and share it",
    })
  }

  const saveReportAsImage = async () => {
    if (reportRef.current) {
      try {
        // Create a clone of the report element to modify for image capture
        const reportClone = reportRef.current.cloneNode(true) as HTMLElement
        document.body.appendChild(reportClone)

        // Apply styles to the clone for proper image capture
        reportClone.classList.add("force-colors")
        reportClone.style.position = "absolute"
        reportClone.style.left = "-9999px"
        reportClone.style.top = "-9999px"
        reportClone.style.width = reportRef.current.offsetWidth + "px"

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
          const netIncome = reportClone.querySelector(
            '[class*="text-green-500"], [class*="text-red-500"]',
          ) as HTMLElement
          if (netIncome) {
            if (calculateNetIncome() >= 0) {
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
        link.download = `water7-report-${format(date, "yyyy-MM-dd")}.png`
        link.click()

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

  const generateReportText = () => {
    // Helper function to format currency with commas
    const formatCurrency = (value) => {
        return Number(value || 0).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const totalIncome = calculateTotalIncome()
    const totalExpenses = calculateTotalExpenses()
    const netIncome = calculateNetIncome()

    let report = "WATER 7 REPORT\n"
    report += format(date, "MMMM d, yyyy") + "\n"
    report += "========================\n\n"

    report += "INCOME:\n"
    report += `Water Sales: ₱${formatCurrency(waterSales)}\n`
    report += `Soap Sales: ₱${formatCurrency(soapSales)}\n`
    report += `Total Income: ₱${formatCurrency(totalIncome)}\n\n`

    report += "EXPENSES:\n"
    expenses.forEach((expense) => {
      if (expense.description || expense.amount) {
        report += `${expense.description || "Unnamed"}: ₱${formatCurrency(expense.amount)}\n`
      }
    })
    report += `Total Expenses: ₱${formatCurrency(totalExpenses)}\n\n`

    report += "SUMMARY:\n"
    report += `Total Income: ₱${formatCurrency(totalIncome)}\n`
    report += `Total Expenses: ₱${formatCurrency(totalExpenses)}\n`
    report += `New Total Income: ₱${formatCurrency(netIncome)}\n`

    return report
}

  if (!mounted) {
    return null
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Income Details</CardTitle>
          <CardDescription>Enter your water and soap sales</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="report-date">Report Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="water-sales">Water Sales (₱)</Label>
            <Input
              id="water-sales"
              type="number"
              placeholder="0.00"
              value={waterSales}
              onChange={(e) => setWaterSales(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="soap-sales">Soap Sales (₱)</Label>
            <Input
              id="soap-sales"
              type="number"
              placeholder="0.00"
              value={soapSales}
              onChange={(e) => setSoapSales(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expense Details</CardTitle>
          <CardDescription>Add your business expenses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {expenses.map((expense, index) => (
            <div key={expense.id} className="flex items-end">
              <div className="grid grid-cols-2 gap-2 items-end flex-1">
                <div className="space-y-2">
                  <Label htmlFor={`expense-desc-${expense.id}`}>Description</Label>
                  <Input
                    id={`expense-desc-${expense.id}`}
                    placeholder="Expense description"
                    value={expense.description}
                    onChange={(e) => updateExpense(expense.id, "description", e.target.value)}
                  />
                </div>
                <div className="space-y-2 flex-1">
                  <Label htmlFor={`expense-amount-${expense.id}`}>Amount (₱)</Label>
                  <Input
                    id={`expense-amount-${expense.id}`}
                    type="number"
                    placeholder="0.00"
                    value={expense.amount}
                    onChange={(e) => updateExpense(expense.id, "amount", e.target.value)}
                  />
                </div>
                
              </div>
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeExpense(expense.id)}
                  disabled={expenses.length <= 1}
                >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={addExpense} className="w-full">
            <Plus className="mr-2 h-4 w-4" /> Add Expense
          </Button>
        </CardFooter>
      </Card>

      <Button onClick={generateReport} className="w-full">
        Generate Report
      </Button>

      {showReport && (
        <Card>
          <CardContent className="p-0">
            <div ref={reportRef} className="overflow-hidden bg-background">
              <div className=" p-8 text-center space-y-2">
                <h3 className="text-3xl md:text-3xl text-foreground font-semibold">Water 7 Report</h3>
                <p className="text-muted-foreground text-base md:text-lg">{format(date, "MMMM d, yyyy")}</p>
              </div>

              <div className="p-4 md:p-8 space-y-6 md:space-y-8">
                <div>
                  <h4 className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4">INCOME</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm md:text-lg text-foreground">
                      <span>Water Sales</span>
                      <span>
                        ₱
                        {Number(waterSales || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm md:text-lg text-foreground">
                      <span>Soap Sales</span>
                      <span>
                        ₱
                        {Number(soapSales || 0).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm md:text-lg font-medium text-foreground">
                      <span>Total Income</span>
                      <span>
                        ₱
                        {calculateTotalIncome().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4">EXPENSES</h4>
                  <div className="space-y-2 ">
                    {expenses.map((expense) =>
                      expense.description || expense.amount ? (
                        <div key={expense.id} className="flex justify-between text-sm md:text-lg text-foreground">
                          <span>{expense.description || "Unnamed"}</span>
                          <span>
                            ₱
                            {Number(expense.amount || 0).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                        </div>
                      ) : null,
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm md:text-lg font-medium text-foreground">
                      <span>Total Expenses</span>
                      <span>
                        ₱
                        {calculateTotalExpenses().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-base md:text-lg text-muted-foreground mb-3 md:mb-4">SUMMARY</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm md:text-lg text-foreground">
                      <span>Total Income</span>
                      <span>
                        ₱
                        {calculateTotalIncome().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm md:text-lg text-foreground">
                      <span>Total Expenses</span>
                      <span>
                        ₱
                        {calculateTotalExpenses().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-sm md:text-lg font-bold text-foreground">
                      <span>Net Income</span>
                      <span className={cn(calculateNetIncome() >= 0 ? "text-green-500" : "text-red-500")}>
                        ₱
                        {calculateNetIncome().toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4 mt-6">
            <Button variant="outline" className="flex-1" onClick={copyReport}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Report
            </Button>
            <Button variant="outline" className="flex-1" onClick={saveReportAsImage}>
              <Download className="mr-2 h-4 w-4" />
              Save Image
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { setMonth, setYear } from "date-fns"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

interface MonthYearPickerProps {
  date: Date | null
  onDateChange: (date: Date | null) => void
  onClear?: () => void
  showClearButton?: boolean
}

export function MonthYearPicker({ date, onDateChange, onClear, showClearButton = false }: MonthYearPickerProps) {
  const [currentDate, setCurrentDate] = useState<Date>(date || new Date())

  // Generate years for dropdown (10 years back, 10 years forward)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  // Generate months for dropdown
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const handleYearChange = (year: string) => {
    const newDate = setYear(currentDate, Number.parseInt(year))
    setCurrentDate(newDate)
    onDateChange(newDate)
  }

  const handleMonthChange = (month: string) => {
    const monthIndex = months.findIndex((m) => m === month)
    if (monthIndex !== -1) {
      const newDate = setMonth(currentDate, monthIndex)
      setCurrentDate(newDate)
      onDateChange(newDate)
    }
  }

  const handleClear = () => {
    if (onClear) {
      onClear()
    } else {
      onDateChange(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select
          value={date ? months[date.getMonth()] : months[currentDate.getMonth()]}
          onValueChange={handleMonthChange}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={date ? date.getFullYear().toString() : currentDate.getFullYear().toString()}
          onValueChange={handleYearChange}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {showClearButton && (
        <Button variant="outline" size="sm" onClick={handleClear} className="w-full">
          Clear Filter
        </Button>
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { setMonth, setYear } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"

interface YearMonthPickerProps {
  date: Date
  onDateChange: (date: Date) => void
}

export function YearMonthPicker({ date, onDateChange }: YearMonthPickerProps) {
  const [currentDate, setCurrentDate] = useState(date)

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
  }

  const handleMonthChange = (month: string) => {
    const monthIndex = months.findIndex((m) => m === month)
    if (monthIndex !== -1) {
      const newDate = setMonth(currentDate, monthIndex)
      setCurrentDate(newDate)
    }
  }

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      onDateChange(newDate)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Select value={months[currentDate.getMonth()]} onValueChange={handleMonthChange}>
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

        <Select value={currentDate.getFullYear().toString()} onValueChange={handleYearChange}>
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
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
        month={currentDate}
        className="rounded-md border"
      />
    </div>
  )
}


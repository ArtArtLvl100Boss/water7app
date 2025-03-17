"use client"
import { Search, CalendarIcon, LayoutGrid, LayoutList } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { YearMonthPicker } from "@/components/year-month-picker"
import { useState } from "react"

interface SearchFilterProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  dateFilter: Date | null
  onDateFilterChange: (date: Date | null) => void
  viewMode: "card" | "table"
  onViewModeChange: (mode: "card" | "table") => void
}

export function SearchFilter({
  searchTerm,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  viewMode,
  onViewModeChange,
}: SearchFilterProps) {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)

  return (
    <div className="flex flex-col sm:flex-row gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search reports..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex gap-2">
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={dateFilter ? "default" : "outline"}
              className={cn(
                "w-full sm:w-auto justify-start text-left font-normal",
                !dateFilter && "text-muted-foreground",
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateFilter ? format(dateFilter, "MMM d, yyyy") : <span>Select date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-4" align="start">
            <YearMonthPicker
              date={dateFilter || new Date()}
              onDateChange={(newDate) => {
                onDateFilterChange(newDate)
                setIsCalendarOpen(false)
              }}
            />
            {dateFilter && (
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onDateFilterChange(null)
                    setIsCalendarOpen(false)
                  }}
                >
                  Clear date filter
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>

        <div className="flex border rounded-md">
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-r-none", viewMode === "card" && "bg-muted")}
            onClick={() => onViewModeChange("card")}
          >
            <LayoutList className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={cn("rounded-l-none", viewMode === "table" && "bg-muted")}
            onClick={() => onViewModeChange("table")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}


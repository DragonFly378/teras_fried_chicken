"use client"

import * as React from "react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value: string // "YYYY-MM-DD"
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function DatePicker({ value, onChange, placeholder = "Pilih tanggal", className }: DatePickerProps) {
  const date = value ? new Date(value + "T00:00:00") : undefined

  const handleSelect = (day: Date | undefined) => {
    if (day) {
      const yyyy = day.getFullYear()
      const mm = String(day.getMonth() + 1).padStart(2, "0")
      const dd = String(day.getDate()).padStart(2, "0")
      onChange(`${yyyy}-${mm}-${dd}`)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "h-9 w-full justify-start text-left font-body font-medium text-sm bg-white border-tfc-brown/15 text-tfc-brown hover:bg-white hover:border-tfc-orange",
            !date && "text-tfc-muted font-normal",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-tfc-muted" />
          {date ? format(date, "dd MMM yyyy", { locale: id }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

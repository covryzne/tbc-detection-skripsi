"use client";

import * as React from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !value.from && !value.to && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value.from && value.to ? (
            `${format(value.from, "dd MMMM yyyy", { locale: id })} - ${format(
              value.to,
              "dd MMMM yyyy",
              { locale: id }
            )}`
          ) : (
            <span>Pilih rentang tanggal</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="range"
          selected={{ from: value.from, to: value.to }}
          onSelect={(range) => onChange({ from: range?.from, to: range?.to })}
          initialFocus
          locale={id}
        />
      </PopoverContent>
    </Popover>
  );
}

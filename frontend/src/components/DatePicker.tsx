"use client";

import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  value: Date | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: any;
}

export function DatePicker({ value, onChange }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal dark:bg-transparent h-[44px] dark:text-white border-2 dark:border-white dark:hover:bg-transparent",
            !value && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value && format(value, "PP")}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 dark:bg-spanish-roast"
        side="right"
        align="center"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

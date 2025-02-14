import React from "react";
import { FormProp } from "../lib";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  form: FormProp;
};

const Starting = ({ form }: Props) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="startingPlace"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Starting Place</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Enter starting location" />
            </FormControl>
            <FormDescription>
              Choose where you want to start your circuit
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="startTime"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Start Date and Time</FormLabel>
            <div className="flex gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={(date) => {
                      if (date) {
                        const currentTime = field.value || new Date();
                        date.setHours(currentTime.getHours());
                        date.setMinutes(currentTime.getMinutes());
                        field.onChange(date);
                      }
                    }}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="time"
                className="w-[180px]"
                value={format(field.value || new Date(), "HH:mm")}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value
                    .split(":")
                    .map(Number);
                  const newDate = new Date(field.value || new Date());
                  newDate.setHours(hours);
                  newDate.setMinutes(minutes);
                  field.onChange(newDate);
                }}
              />
            </div>
            <FormDescription>
              Select when you want to start your circuit
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default Starting;

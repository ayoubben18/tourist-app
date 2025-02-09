"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Grip,
  Trash2,
} from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { Fragment, useEffect } from "react";
import { addDays } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { createCircuitSchema } from "@/utils/schemas";
import { z } from "zod";
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
import { AutoComplete } from "@/components/shared/autocomplete";
import { Label } from "@/components/ui/label";
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type StepType = {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
};

const CreateCircuitStepper = () => {
  const cities = [
    { value: "new-york", label: "New York" },
    { value: "london", label: "London" },
    { value: "paris", label: "Paris" },
    { value: "tokyo", label: "Tokyo" },
    { value: "dubai", label: "Dubai" },
    { value: "singapore", label: "Singapore" },
    { value: "hong-kong", label: "Hong Kong" },
    { value: "sydney", label: "Sydney" },
    { value: "rome", label: "Rome" },
    { value: "barcelona", label: "Barcelona" },
  ];

  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const form = useForm<z.infer<typeof createCircuitSchema>>({
    resolver: zodResolver(createCircuitSchema),
    defaultValues: {
      city: "",
      guideId: undefined,
      isPublic: true,
      places: [],
      startingPlace: "",
      startTime: addDays(new Date(), 1),
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "places",
  });

  useEffect(() => {
    setStep(1);
  }, []);

  const handleNext = () => {
    if (step === steps.length) return;
    setStep((step) => step + 1);
  };

  const handleBack = () => {
    if (step === 1) return;
    setStep((step) => step - 1);
  };

  const steps: StepType[] = [
    {
      id: 1,
      title: "Select City and Places you want to visit",
      description: "Set the name and basic details of your circuit",
      component: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem>
                <FormLabel>City</FormLabel>
                <FormControl>
                  <AutoComplete
                    emptyMessage="Select a city"
                    options={cities}
                    onValueChange={(value) => field.onChange(value.label)}
                  />
                </FormControl>
                <FormDescription>
                  Select the city where your circuit will take place
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2 flex flex-col">
            <Label>Places</Label>
            <Sortable
              value={fields}
              onMove={({ activeIndex, overIndex }) =>
                move(activeIndex, overIndex)
              }
            >
              {fields.map((field, index) => (
                <Fragment key={field.id}>
                  <SortableItem value={field.id} asChild className="w-full">
                    <div className="flex gap-2 items-center w-full">
                      <SortableDragHandle
                        type="button"
                        className="cursor-grab rounded-md border-2 border-slate-200 bg-slate-50 p-2 hover:bg-slate-300 flex-shrink-0"
                      >
                        <Grip className="h-5 w-5 text-gray-500" />
                      </SortableDragHandle>
                      <FormField
                        key={field.id}
                        control={form.control}
                        name={`places.${index}`}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={`Place ${index + 1}`}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        size={"icon"}
                        variant="destructive"
                        onClick={() => remove(index)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </SortableItem>
                </Fragment>
              ))}
            </Sortable>
            <Button
              type="button"
              variant="secondary"
              onClick={() => append("")}
              className="mt-2 gap-2"
            >
              <CirclePlus className=" size-4" />
              Add Place
            </Button>
            <FormDescription>
              Add the places you want to visit in your circuit
            </FormDescription>
          </div>
        </div>
      ),
    },
    {
      id: 2,
      title: "Select start time and place",
      description: "Choose when and where to start your circuit",
      component: (
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
      ),
    },
    {
      id: 3,
      title: "Select Guide",
      description: "Configure work/rest intervals and rounds",
      component: <div>Circuit Config</div>,
    },
    {
      id: 4,
      title: "Attention",
      description: "Review and confirm your circuit setup",
      component: <div>Review Circuit</div>,
    },
  ];

  const currentStep = steps[step - 1];

  const onSubmit = () => {};

  if (step > steps.length) return <div>Step does not exist</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-col space-y-4">
          <Card className="border rounded-lg p-4">
            <CardHeader>
              <CardTitle>{currentStep.title}</CardTitle>
              <CardDescription>{currentStep.description}</CardDescription>
            </CardHeader>
            <CardContent>{currentStep.component}</CardContent>
          </Card>
          <div className=" flex items-center justify-between">
            <Button
              onClick={handleBack}
              disabled={step === 1}
              className=" gap-2"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={step === steps.length}
              className="gap-2"
            >
              Next <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};

export default CreateCircuitStepper;

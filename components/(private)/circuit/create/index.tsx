"use client";

import { AutoComplete, Option } from "@/components/shared/autocomplete";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGuides } from "@/hooks/use-guides";
import { cn } from "@/lib/utils";
import { createCircuitSchema } from "@/utils/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SelectableCard } from "./selectable-card";

type StepType = {
  id: number;
  title: string;
  description: string;
  component: React.ReactNode;
};

type Place = {
  id: number;
  name: string;
  description?: string;
  image: string;
};

const cities: Option[] = [
  { value: "1", label: "New York", description: "Famous city" },
  { value: "2", label: "Los Angeles", description: "Entertainment hub" },
  { value: "3", label: "Chicago", description: "Iconic skyscraper" },
  { value: "4", label: "Brooklyn Bridge", description: "Historic bridge" },
  { value: "5", label: "Statue of Liberty", description: "National monument" },
];

const CreateCircuitStepper = () => {
  const places: Place[] = [
    {
      id: 1,
      name: "Central Park",
      description: "Famous urban park",
      image:
        "https://images.unsplash.com/photo-1534270804882-6b5048b1c1fc?w=500&q=80",
    },
    {
      id: 2,
      name: "Times Square",
      description: "Entertainment hub",
      image:
        "https://images.unsplash.com/photo-1581484870083-0068e4767a64?w=500&q=80",
    },
    {
      id: 3,
      name: "Empire State",
      description: "Iconic skyscraper",
      image:
        "https://images.unsplash.com/photo-1555109307-f7d9da25c244?w=500&q=80",
    },
    {
      id: 4,
      name: "Brooklyn Bridge",
      description: "Historic bridge",
      image:
        "https://images.unsplash.com/photo-1582447272538-f1b1a4b23c01?w=500&q=80",
    },
    {
      id: 5,
      name: "Statue of Liberty",
      description: "National monument",
      image:
        "https://images.unsplash.com/photo-1575384043001-f37f48835528?w=500&q=80",
    },
  ];

  const [selectedPlaces, setSelectedPlaces] = useState<Set<number>>(new Set());
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const form = useForm<z.infer<typeof createCircuitSchema>>({
    resolver: zodResolver(createCircuitSchema),
    defaultValues: {
      city: "",
      guideId: undefined,
      isPublic: true,
      places: [],
      startingPlace: 0,
      startTime: addDays(new Date(), 1),
    },
  });

  const [searchQuery, setSearchQuery] = useState("");
  const filteredPlaces = places.filter((place) =>
    place.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handlePlaceSelection = (placeId: number) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    if (selectedPlaces.has(placeId)) {
      newSelectedPlaces.delete(placeId);
    } else {
      newSelectedPlaces.add(placeId);
    }
    setSelectedPlaces(newSelectedPlaces);
  };

  const {
    data: guides,
    isLoading,
    setSearchTerm,
    searchTerm,
  } = useGuides({
    enabled: step === 3,
  });

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
                    onValueChange={(value) => {
                      field.onChange(value.value);
                      setSearchQuery("");
                    }}
                  />
                </FormControl>
                <FormDescription>
                  Select the city where your circuit will take place
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label>Places</Label>
            {!form.watch("city") ? (
              <Card className="p-6">
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <div className="text-muted-foreground">
                    Please select a city first to view available places
                  </div>
                </div>
              </Card>
            ) : (
              <>
                <Input
                  type="text"
                  placeholder="Search places..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-4"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredPlaces.map((place) => (
                    <SelectableCard
                      key={place.id}
                      selected={selectedPlaces.has(place.id)}
                      onClick={() => handlePlaceSelection(place.id)}
                      title={place.name}
                      description={place.description}
                      image={place.image}
                    />
                  ))}
                </div>
              </>
            )}
            <FormDescription>
              Select the places you want to visit in your circuit
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
      description: "Select the guide for your circuit",
      component: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="guideId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Guide</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="Search guides by name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="mb-4"
                  />
                </FormControl>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {isLoading ? (
                    <Card className="p-6">
                      <div className="flex items-center justify-center">
                        <div className="text-muted-foreground">
                          Loading guides...
                        </div>
                      </div>
                    </Card>
                  ) : guides?.length === 0 ? (
                    <Card className="p-6">
                      <div className="flex items-center justify-center">
                        <div className="text-muted-foreground">
                          No guides found
                        </div>
                      </div>
                    </Card>
                  ) : (
                    guides?.map((guide) => (
                      <SelectableCard
                        key={guide.id}
                        selected={field.value === guide.id}
                        onClick={() => field.onChange(guide.id)}
                        title={guide.full_name ?? ""}
                        header={
                          <>
                            <img
                              src={guide.avatar_url ?? ""}
                              alt={guide.full_name ?? ""}
                              className="rounded-full h-12 w-12 object-cover"
                            />
                            <div>
                              <CardTitle className="text-base">
                                {guide.full_name}
                              </CardTitle>
                              <CardDescription>
                                {guide.years_of_experience} years of experience
                              </CardDescription>
                            </div>
                          </>
                        }
                      >
                        <div className="text-sm text-muted-foreground">
                          <p>Experience: {guide.years_of_experience} years</p>
                        </div>
                      </SelectableCard>
                    ))
                  )}
                </div>
                <FormDescription>
                  Select a guide for your circuit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      id: 4,
      title: "Attention",
      description: "Review and confirm your circuit setup",
      component: (
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Circuit Visibility</FormLabel>
                <FormControl>
                  <div className="grid grid-cols-2 gap-4">
                    <SelectableCard
                      selected={field.value === true}
                      onClick={() => field.onChange(true)}
                      title="Public"
                      description="Anyone can view and join this circuit"
                    />
                    <SelectableCard
                      selected={field.value === false}
                      onClick={() => field.onChange(false)}
                      title="Private"
                      description="Only people you invite can view and join"
                    />
                  </div>
                </FormControl>
                <FormDescription>
                  Choose who can see and join your circuit
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Add other review content here */}
        </div>
      ),
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
              type="button"
              onClick={handleBack}
              disabled={step === 1}
              className=" gap-2"
            >
              <ChevronLeft className="size-4" />
              Back
            </Button>
            <Button
              type="button"
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

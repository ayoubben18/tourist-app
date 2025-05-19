"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useGuides } from "@/hooks/use-guides";
import { SelectableCard } from "@/components/(private)/circuit/create/selectable-card";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Clock } from "lucide-react";
import { format, setHours, setMinutes } from "date-fns";
import { useMutation } from "@tanstack/react-query";
import { takeTrip } from "@/services/database/bookings";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookTripDialogProps {
  circuitId: number;
  circuitDuration: number;
}

export function BookTripDialog({
  circuitId,
  circuitDuration,
}: BookTripDialogProps) {
  const [step, setStep] = useState(1);
  const [selectedGuide, setSelectedGuide] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedHour, setSelectedHour] = useState<string>("09");
  const [selectedMinute, setSelectedMinute] = useState<string>("00");
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const { data: guides, isLoading } = useGuides({
    enabled: step === 1,
  });

  const { mutateAsync: bookTripMutation } = useMutation({
    mutationFn: takeTrip,
    onSuccess: () => {
      toast.success("Trip booked successfully!");
      router.push("/profile");
    },
    onError: () => {
      toast.error("Failed to book trip");
    },
  });

  const handleBookTrip = async () => {
    if (!selectedDate) return;

    // Create a new date with the selected time
    const bookingDate = setMinutes(
      setHours(selectedDate, parseInt(selectedHour)),
      parseInt(selectedMinute)
    );

    await bookTripMutation({
      circuit_id: circuitId,
      guide_id: selectedGuide || undefined,
      booking_date: bookingDate.toISOString(),
    });
  };

  const filteredGuides = guides?.filter((guide) =>
    guide.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Select a Guide (Optional)
              </h3>
              <Button variant="ghost" onClick={() => setStep(2)}>
                Skip
              </Button>
            </div>
            <Input
              type="text"
              placeholder="Search guides by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {isLoading ? (
                <Card className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">
                      Loading guides...
                    </div>
                  </div>
                </Card>
              ) : filteredGuides?.length === 0 ? (
                <Card className="p-6">
                  <div className="flex items-center justify-center">
                    <div className="text-muted-foreground">No guides found</div>
                  </div>
                </Card>
              ) : (
                filteredGuides?.map((guide) => (
                  <SelectableCard
                    key={guide.id}
                    selected={selectedGuide === guide.id}
                    onClick={() => setSelectedGuide(guide.id)}
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
                      <p>Price: {guide.price_per_hour}DHS/hr</p>
                    </div>
                  </SelectableCard>
                ))
              )}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setStep(2)}>Next</Button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Date and Time</h3>
            <div className="flex flex-col items-center gap-4">
              <div className="w-full max-w-[350px] m-auto">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date()}
                  className="rounded-md border"
                />
              </div>

              {selectedDate && (
                <div className="flex items-center gap-4 mt-4">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <Select
                      value={selectedHour}
                      onValueChange={setSelectedHour}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Hour" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) =>
                          i.toString().padStart(2, "0")
                        ).map((hour) => (
                          <SelectItem key={hour} value={hour}>
                            {hour}:00
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select
                      value={selectedMinute}
                      onValueChange={setSelectedMinute}
                    >
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Minute" />
                      </SelectTrigger>
                      <SelectContent>
                        {["00", "15", "30", "45"].map((minute) => (
                          <SelectItem key={minute} value={minute}>
                            {minute}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button onClick={handleBookTrip} disabled={!selectedDate}>
                Book Trip
              </Button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium">
          Take this Trip
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Book Your Trip</DialogTitle>
        </DialogHeader>
        {renderStep()}
      </DialogContent>
    </Dialog>
  );
}

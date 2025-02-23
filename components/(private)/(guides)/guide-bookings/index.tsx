"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarDays,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  CalendarClock,
  CircleDollarSign,
} from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import {
  confirmBooking,
  getBookings,
  rejectBooking,
} from "@/services/database/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { BookingCard } from "./booking-card";

export default function GuideBookings() {
  const queryClient = useQueryClient();
  const {
    data: pendingBookings,
    isLoading: isPendingBookingsLoading,
    isError: isPendingBookingsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.pendingBookings(),
    queryFn: () => getBookings({ status: "pending" }),
  });

  const {
    data: confirmedBookings,
    isLoading: isConfirmedBookingsLoading,
    isError: isConfirmedBookingsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.confirmedBookings(),
    queryFn: () => getBookings({ status: "confirmed" }),
  });

  const { mutateAsync: confirm, isPending: isConfirming } = useMutation({
    mutationFn: confirmBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.pendingBookings(),
      });
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.confirmedBookings(),
      });
    },
    onError: () => {
      console.error("Failed to confirm booking")
    },
  });

  const { mutateAsync: reject, isPending: isRejecting } = useMutation({
    mutationFn: rejectBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.pendingBookings(),
      });
    },
    onError: () => {
      console.error("Failed to reject booking");
    },
  });

  const handleAccept = (bookingId: number) => {
    toast.promise(
      confirm({ booking_id: bookingId }),
      {
        loading: "Saving changes...",
        success: "You've confirmed this booking!",
        error: "Failed to confirm this booking!",
      }
    )
  };

  const handleReject = (bookingId: number) => {
    toast.promise(
      reject({ booking_id: bookingId }),
      {
        loading: "Saving changes...",
        success: "You've rejected this booking!",
        error: "Failed to reject this booking!",
      })
  };

  if (isPendingBookingsError || isConfirmedBookingsError) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>
            Something went wrong. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  function formatCircuitDuration(minutes: number) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return `${hours} hour${hours !== 1 ? "s" : ""}`;
    }
    return `${hours} hour${hours !== 1 ? "s" : ""} ${remainingMinutes} minute${
      remainingMinutes !== 1 ? "s" : ""
    }`;
  }

  function formatBookingDate(dateString: string): string {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };
    return date.toLocaleString(undefined, options);
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-[400px] mx-auto">
          <TabsTrigger value="pending">Pending Requests</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Tours</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Booking Requests</CardTitle>
              <CardDescription>
                Review and respond to tour requests from tourists
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isPendingBookingsLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-[150px] w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : pendingBookings && pendingBookings.length > 0 ? (
                <ScrollArea className="h-[425px] pr-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingBookings.map((booking) => (
                      <BookingCard
                        key={booking.booking_id}
                        status="pending"
                        creator={booking.creator!}
                        creatorAvatar={booking.creator_avatar}
                        formattedDuration={
                          booking.circuit_duration
                            ? formatCircuitDuration(booking.circuit_duration)
                            : "Duration not available"
                        }
                        formattedDate={
                          booking.booking_date
                            ? formatBookingDate(booking.booking_date)
                            : "Booking date not available"
                        }
                        totalPrice={booking.total_price}
                        bookingId={booking.booking_id}
                        circuit_id={booking.circuit_id!}
                        onAccept={handleAccept}
                        onReject={handleReject}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No pending booking requests
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tours</CardTitle>
              <CardDescription>
                View your scheduled and confirmed tours
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isConfirmedBookingsLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-[150px] w-full" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </div>
              ) : confirmedBookings && confirmedBookings.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {confirmedBookings.map((booking) => (
                      <BookingCard
                        key={booking.booking_id}
                        status="confirmed"
                        creator={booking.creator!}
                        creatorAvatar={booking.creator_avatar}
                        formattedDuration={
                          booking.circuit_duration
                            ? formatCircuitDuration(booking.circuit_duration)
                            : "Duration not available"
                        }
                        formattedDate={
                          booking.booking_date
                            ? formatBookingDate(booking.booking_date)
                            : "Booking date not available"
                        }
                        totalPrice={booking.total_price}
                        bookingId={booking.booking_id}
                        circuit_id={booking.circuit_id!}
                      />
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No upcoming tours
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

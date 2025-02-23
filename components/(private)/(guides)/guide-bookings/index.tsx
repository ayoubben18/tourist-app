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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import { getBookings } from "@/services/database/bookings";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

export default function GuideBookings() {
  const queryClient = useQueryClient();
  const {
    data: pendingBookings,
    isLoading: isPendingBookingsLoading,
    isError: isPendingBookingsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.pendingBookings(),
    queryFn: () => getBookings({ status : "pending"}),
  });

  const {
    data: confirmedBookings,
    isLoading: isConfirmedBookingsLoading,
    isError: isConfirmedBookingsError,
  } = useQuery({
    queryKey: useQueryCacheKeys.pendingBookings(),
    queryFn: () => getBookings({ status : "confirmed"}),
  });

  const handleAccept = (bookingId: number) => {
    queryClient.invalidateQueries({
      queryKey: useQueryCacheKeys.pendingBookings(),
    });
    queryClient.invalidateQueries({
      queryKey: useQueryCacheKeys.confirmedBookings(),
    });
    //actual logic
    toast.success("Booking accepted");
  };

  const handleReject = (bookingId: number) => {
    queryClient.invalidateQueries({
      queryKey: useQueryCacheKeys.pendingBookings(),
    });
    //actual logic
    toast.error("Booking rejected");
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
                <div className="container mx-auto py-8 px-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-[400px] w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : pendingBookings && pendingBookings.length > 0 ? (
                <ScrollArea className="h-[425px] pr-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {pendingBookings.map((booking) => (
                      <Card
                        key={booking.booking_id}
                        className="p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={
                                  booking.creator_avatar ||
                                  "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
                                }
                                alt={booking.creator!}
                              />
                              <AvatarFallback>
                                {booking.creator![0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                  {booking.creator}
                                </h3>
                                <Badge variant="secondary">Pending</Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{booking.circuit_duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>{booking.booking_date}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <CircleDollarSign className="h-4 w-4" />
                              <span>{booking.total_price} DHS</span>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-2 mt-4">
                            <Button
                              size="sm"
                              onClick={() => handleAccept(booking.booking_id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Accept
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(booking.booking_id)}
                              className="flex items-center gap-1"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </Card>
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
                <div className="container mx-auto py-8 px-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-[400px] w-full" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : confirmedBookings && confirmedBookings.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {confirmedBookings.map((booking) => (
                      <Card
                        key={booking.booking_id}
                        className="p-4 hover:shadow-lg transition-shadow"
                      >
                        <div className="flex flex-col h-full">
                          <div className="flex items-start space-x-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage
                                src={
                                  booking.creator_avatar ||
                                  "https://i.pinimg.com/1200x/2c/47/d5/2c47d5dd5b532f83bb55c4cd6f5bd1ef.jpg"
                                }
                                alt={booking.creator!}
                              />
                              <AvatarFallback>
                                {booking.creator![0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold">
                                  {booking.creator}
                                </h3>
                                <Badge className="bg-green-100 text-green-800">
                                  Confirmed
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground mt-4">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span>{booking.circuit_duration}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CalendarDays className="h-4 w-4" />
                              <span>{booking.booking_date}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <CircleDollarSign className="h-4 w-4" />
                              <span>{booking.total_price} DHS</span>
                            </div>
                          </div>
                        </div>
                      </Card>
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

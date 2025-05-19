"use client";

import { Card } from "@/components/ui/card";
import {
  Users,
  UserCheck,
  MapPin,
  Route,
  FileCheck2,
  TrendingUp,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useQueryCacheKeys from "@/utils/use-query-cache-keys";
import {
  approveGuide,
  getPendingGuides,
  rejectGuide,
} from "@/services/database/guide";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@supabase/supabase-js";

// Mock data - replace with real data from your API
const stats = {
  totalUsers: 1234,
  activeUsers: 890,
  guides: 45,
  circuits: 78,
};

const chartData = [
  { month: "Jan", circuits: 4 },
  { month: "Feb", circuits: 7 },
  { month: "Mar", circuits: 12 },
  { month: "Apr", circuits: 15 },
  { month: "May", circuits: 18 },
  { month: "Jun", circuits: 24 },
];

export default function AdminDashboard() {
  const queryClient = useQueryClient();

  const {
    data: pendingGuides,
    isLoading: pendingGuidesLoading,
    error: pendingGuidesError,
  } = useQuery({
    queryKey: useQueryCacheKeys.pendingGuides(),
    queryFn: getPendingGuides,
  });

  const { mutateAsync: approveGuideMutation } = useMutation({
    mutationFn: approveGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.pendingGuides(),
      });
      console.log("Guide approved successfully");
    },
    onError: () => {
      console.error("Failed to approve guide");
    },
  });

  const { mutateAsync: rejectGuideMutation } = useMutation({
    mutationFn: rejectGuide,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: useQueryCacheKeys.pendingGuides(),
      });
      console.log("Guide rejected successfully");
    },
    onError: () => {
      console.error("Failed to reject guide");
    },
  });

  const handleViewDocument = (publicUrl: string) => {
    window.open(publicUrl, "_blank");
  };

  const handleApprove = async (id: string) => {
    toast.promise(approveGuideMutation({ guide_id: id }), {
      loading: "Saving changes...",
      success: "You've approved this guide!",
      error: "Failed to approve this guide!",
    });
  };

  const handleReject = async (id: string) => {
    toast.promise(rejectGuideMutation({ guide_id: id }), {
      loading: "Saving changes...",
      success: "You've rejected this guide!",
      error: "Failed to reject this guide!",
    });
  };

  // Function to get initials from a name
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // Function to get a color based on name
  const getAvatarColor = (name: string) => {
    if (!name) return "bg-gray-400";
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-3 py-1 rounded-full shadow-sm">
          Last updated: {new Date().toLocaleDateString()}
        </span>
      </div>

      {/* Top Section - Stats and Chart Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Stats Cards - Left Column */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="p-5 bg-white dark:bg-gray-800 shadow-sm border-0 rounded-xl transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalUsers}</h3>
                <p className="text-xs text-green-500 mt-1">
                  ↑ 12% from last month
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-gray-800 shadow-sm border-0 rounded-xl transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Users
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.activeUsers}</h3>
                <p className="text-xs text-green-500 mt-1">
                  ↑ 8% from last month
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-gray-800 shadow-sm border-0 rounded-xl transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Guides
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.guides}</h3>
                <p className="text-xs text-green-500 mt-1">
                  ↑ 15% from last month
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <MapPin className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-5 bg-white dark:bg-gray-800 shadow-sm border-0 rounded-xl transition-all hover:shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Circuits
                </p>
                <h3 className="text-2xl font-bold mt-1">{stats.circuits}</h3>
                <p className="text-xs text-green-500 mt-1">
                  ↑ 24% from last month
                </p>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <Route className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Chart Section - Right Column */}
        <Card className="lg:col-span-2 p-6 bg-white dark:bg-gray-800 shadow-sm border-0 rounded-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-semibold">Circuit Creation Trend</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs">
                Monthly
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Quarterly
              </Button>
              <Button variant="ghost" size="sm" className="text-xs">
                Yearly
              </Button>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 20, bottom: 20, left: 0 }}
              >
                <defs>
                  <linearGradient
                    id="colorCircuits"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="5%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="hsl(var(--primary))"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f0f0f0"
                />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="circuits"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{
                    fill: "hsl(var(--primary))",
                    r: 6,
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  fill="url(#colorCircuits)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Guide Requests Section */}
      <Card className="bg-white dark:bg-gray-800 shadow-sm border-0 rounded-xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileCheck2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Pending Guide Requests
              {pendingGuidesLoading && (
                <Loader2 className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-spin ml-2" />
              )}
              {pendingGuides && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                  {pendingGuides.length}
                </span>
              )}
            </h2>
          </div>

          {pendingGuidesError && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>Failed to load guide requests. Please try again later.</p>
            </div>
          )}

          <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                  <TableHead className="w-1/5 font-medium">Full name</TableHead>
                  <TableHead className="w-1/5 font-medium">Country</TableHead>
                  <TableHead className="w-1/5 font-medium">
                    Experience
                  </TableHead>
                  <TableHead className="w-1/5 font-medium">Documents</TableHead>
                  <TableHead className="w-1/5 font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingGuidesLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index}>
                      <TableCell className="w-1/5">
                        <Skeleton className="h-4 w-3/5" />
                      </TableCell>
                      <TableCell className="w-1/5">
                        <Skeleton className="h-4 w-3/5" />
                      </TableCell>
                      <TableCell className="w-1/5">
                        <Skeleton className="h-6 w-3/5" />
                      </TableCell>
                      <TableCell className="w-1/5">
                        <Skeleton className="h-8 w-3/5" />
                      </TableCell>
                      <TableCell className="w-1/5">
                        <div className="flex gap-2">
                          <Skeleton className="h-8 w-3/5 rounded-full" />
                          <Skeleton className="h-8 w-3/5 rounded-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : pendingGuides && pendingGuides.length > 0 ? (
                  pendingGuides.map((guide) => (
                    <TableRow
                      key={guide.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={guide.avatar_url || ""}
                              alt={guide.full_name!}
                            />
                            <AvatarFallback
                              className={getAvatarColor(guide.full_name!)}
                            >
                              {getInitials(guide.full_name!)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{guide.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{guide.country}</TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-xs">
                          {guide.years_of_experience} years
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleViewDocument(
                              guide.authorization_document_url!
                            )
                          }
                          className="flex items-center gap-1 text-xs rounded-full"
                          disabled={!guide.authorization_document_url}
                        >
                          <FileCheck2 className="h-3 w-3" />
                          View Docs
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 rounded-full text-xs px-4"
                            onClick={() => handleApprove(guide.id)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 bg-red-100 hover:bg-red-100 hover:text-red-700 dark:border-red-900 dark:hover:bg-red-900/20 rounded-full text-xs px-4"
                            onClick={() => handleReject(guide.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <p className="text-gray-500">No pending guide requests</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </Card>
    </div>
  );
}

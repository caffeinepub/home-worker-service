import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Briefcase,
  CalendarIcon,
  Loader2,
  MapPin,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import { BookingStatus } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import {
  useAcceptBooking,
  useGetMyBookings,
  useGetMyProfile,
  useGetPendingBookings,
  useUpdateBookingStatus,
} from "../hooks/useQueries";

function formatTime(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

function formatPrice(price: bigint) {
  return `$${Number(price).toFixed(2)}`;
}

export function WorkerDashboard() {
  const { data: pendingJobs, isLoading: pendingLoading } =
    useGetPendingBookings();
  const { data: myJobs, isLoading: myJobsLoading } = useGetMyBookings();
  const { data: profile } = useGetMyProfile();
  const acceptBooking = useAcceptBooking();
  const updateStatus = useUpdateBookingStatus();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Stats header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold mb-4">
          Worker Dashboard
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Card className="surface-raised">
            <CardContent className="py-5 px-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Total Earnings
                  </div>
                  <div className="font-display font-bold text-lg">
                    {profile ? formatPrice(profile.earnings) : "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-raised">
            <CardContent className="py-5 px-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Jobs Completed
                  </div>
                  <div className="font-display font-bold text-lg">
                    {profile ? Number(profile.jobCount).toString() : "—"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="surface-raised col-span-2 sm:col-span-1">
            <CardContent className="py-5 px-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center">
                  <span className="text-amber-600 text-sm font-bold">
                    {pendingJobs?.length ?? 0}
                  </span>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    Available Jobs
                  </div>
                  <div className="font-display font-bold text-lg">
                    Right Now
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <Tabs defaultValue="available">
        <TabsList className="mb-6" data-ocid="worker.tab">
          <TabsTrigger value="available" data-ocid="worker.tab">
            Available Jobs
            {(pendingJobs?.length ?? 0) > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs bg-primary text-primary-foreground">
                {pendingJobs?.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="myjobs" data-ocid="worker.tab">
            My Jobs
          </TabsTrigger>
        </TabsList>

        {/* Available Jobs */}
        <TabsContent value="available">
          {pendingLoading ? (
            <div className="space-y-3" data-ocid="available.loading_state">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !pendingJobs?.length ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="available.empty_state"
            >
              <div className="text-5xl mb-4">🔍</div>
              <p className="font-medium">No available jobs right now</p>
              <p className="text-sm">Check back soon for new bookings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingJobs.map((job, idx) => (
                <motion.div
                  key={job.id.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  data-ocid={`available.item.${idx + 1}`}
                >
                  <Card className="surface-raised hover:surface-elevated transition-all">
                    <CardContent className="py-4 px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              Job #{job.id.toString()}
                            </span>
                            <StatusBadge status={job.status} />
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {formatTime(job.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.address}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary text-lg">
                            {formatPrice(job.price)}
                          </span>
                          <Button
                            size="sm"
                            onClick={() => acceptBooking.mutate(job.id)}
                            disabled={acceptBooking.isPending}
                            data-ocid={`available.primary_button.${idx + 1}`}
                          >
                            {acceptBooking.isPending ? (
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : null}
                            Accept
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* My Jobs */}
        <TabsContent value="myjobs">
          {myJobsLoading ? (
            <div className="space-y-3" data-ocid="myjobs.loading_state">
              {["s1", "s2", "s3"].map((k) => (
                <Skeleton key={k} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !myJobs?.length ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="myjobs.empty_state"
            >
              <div className="text-5xl mb-4">📭</div>
              <p className="font-medium">No jobs yet</p>
              <p className="text-sm">
                Accept jobs from the available tab to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {myJobs.map((job, idx) => (
                <motion.div
                  key={job.id.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  data-ocid={`myjobs.item.${idx + 1}`}
                >
                  <Card className="surface-raised">
                    <CardContent className="py-4 px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              Job #{job.id.toString()}
                            </span>
                            <StatusBadge status={job.status} />
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {formatTime(job.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.address}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-primary">
                            {formatPrice(job.price)}
                          </span>
                          <div className="flex gap-2">
                            {job.status === "accepted" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  updateStatus.mutate({
                                    bookingId: job.id,
                                    status: BookingStatus.inProgress,
                                  })
                                }
                                disabled={updateStatus.isPending}
                                data-ocid={`myjobs.secondary_button.${idx + 1}`}
                              >
                                {updateStatus.isPending ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : null}
                                Start
                              </Button>
                            )}
                            {job.status === "inProgress" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateStatus.mutate({
                                    bookingId: job.id,
                                    status: BookingStatus.completed,
                                  })
                                }
                                disabled={updateStatus.isPending}
                                data-ocid={`myjobs.primary_button.${idx + 1}`}
                              >
                                {updateStatus.isPending ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : null}
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

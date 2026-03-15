import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  CalendarIcon,
  ClipboardList,
  Loader2,
  MapPin,
  ShoppingBag,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Service } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import {
  useCancelBooking,
  useCreateBooking,
  useGetAllServices,
  useGetMyBookings,
} from "../hooks/useQueries";

const serviceTypeIcons: Record<string, string> = {
  cleaning: "🧹",
  laundry: "👕",
  cooking: "🍳",
  dishwashing: "🫧",
  ironing: "👔",
  generalHelp: "🛠️",
};

function formatTime(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

function formatPrice(price: bigint) {
  return `$${Number(price).toFixed(2)}`;
}

function BookingDialog({
  service,
  open,
  onClose,
}: {
  service: Service;
  open: boolean;
  onClose: () => void;
}) {
  const [scheduledDate, setScheduledDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const createBooking = useCreateBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const scheduledTime =
      BigInt(new Date(scheduledDate).getTime()) * BigInt(1_000_000);
    await createBooking.mutateAsync({
      serviceId: service.id,
      scheduledTime,
      address: address.trim(),
      notes: notes.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-ocid="booking.dialog">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            Book: {service.name}
          </DialogTitle>
          <DialogDescription>
            {service.description} — {formatPrice(service.basePrice)}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="scheduled-date">Date & Time</Label>
            <Input
              id="scheduled-date"
              type="datetime-local"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              required
              min={new Date().toISOString().slice(0, 16)}
              data-ocid="booking.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Service Address</Label>
            <Input
              id="address"
              placeholder="123 Main St, City, State"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
              data-ocid="booking.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              data-ocid="booking.textarea"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              data-ocid="booking.cancel_button"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={createBooking.isPending}
              data-ocid="booking.submit_button"
            >
              {createBooking.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Booking
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function CustomerDashboard() {
  const [bookingService, setBookingService] = useState<Service | null>(null);
  const { data: services, isLoading: servicesLoading } = useGetAllServices();
  const { data: bookings, isLoading: bookingsLoading } = useGetMyBookings();
  const cancelBooking = useCancelBooking();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h1 className="font-display text-3xl font-bold mb-1">Welcome back!</h1>
        <p className="text-muted-foreground">
          Browse services or track your bookings.
        </p>
      </motion.div>

      <Tabs defaultValue="services">
        <TabsList className="mb-6" data-ocid="customer.tab">
          <TabsTrigger value="services" data-ocid="customer.tab">
            <ShoppingBag className="w-4 h-4 mr-2" />
            Browse Services
          </TabsTrigger>
          <TabsTrigger value="bookings" data-ocid="customer.tab">
            <ClipboardList className="w-4 h-4 mr-2" />
            My Bookings
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services">
          {servicesLoading ? (
            <div
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
              data-ocid="services.loading_state"
            >
              {["s1", "s2", "s3", "s4", "s5", "s6"].map((k) => (
                <Skeleton key={k} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : !services?.length ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="services.empty_state"
            >
              <div className="text-5xl mb-4">🏠</div>
              <p className="font-medium">No services available yet</p>
              <p className="text-sm">Check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {services.map((service, idx) => (
                <motion.div
                  key={service.id.toString()}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  data-ocid={`services.item.${idx + 1}`}
                >
                  <Card className="h-full surface-raised hover:surface-elevated transition-all group">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="text-3xl mb-2">
                          {serviceTypeIcons[service.serviceType] ?? "🏡"}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {service.serviceType}
                        </Badge>
                      </div>
                      <CardTitle className="font-display text-lg">
                        {service.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3">
                      <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                        {service.description}
                      </p>
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xl font-bold text-primary">
                          {formatPrice(service.basePrice)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => setBookingService(service)}
                          data-ocid={`services.item.${idx + 1}`}
                        >
                          Book Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          {bookingsLoading ? (
            <div className="space-y-3" data-ocid="bookings.loading_state">
              {["s1", "s2", "s3", "s4"].map((k) => (
                <Skeleton key={k} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : !bookings?.length ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="bookings.empty_state"
            >
              <div className="text-5xl mb-4">📋</div>
              <p className="font-medium">No bookings yet</p>
              <p className="text-sm">
                Browse services to make your first booking.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking, idx) => (
                <motion.div
                  key={booking.id.toString()}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  data-ocid={`bookings.item.${idx + 1}`}
                >
                  <Card className="surface-raised">
                    <CardContent className="py-4 px-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm truncate">
                              Service #{booking.serviceId.toString()}
                            </span>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="w-3 h-3" />
                              {formatTime(booking.scheduledTime)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {booking.address}
                            </span>
                          </div>
                          {booking.notes && (
                            <p className="text-xs text-muted-foreground mt-1 italic">
                              {booking.notes}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-primary">
                            {formatPrice(booking.price)}
                          </span>
                          {booking.status === "pending" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive border-destructive/30 hover:bg-destructive/5"
                                  data-ocid={`bookings.delete_button.${idx + 1}`}
                                >
                                  Cancel
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent data-ocid="bookings.dialog">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Cancel Booking?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will cancel your booking. This action
                                    cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="bookings.cancel_button">
                                    Keep Booking
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      cancelBooking.mutate(booking.id)
                                    }
                                    className="bg-destructive text-destructive-foreground"
                                    data-ocid="bookings.confirm_button"
                                  >
                                    {cancelBooking.isPending ? (
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : null}
                                    Yes, Cancel
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
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

      {bookingService && (
        <BookingDialog
          service={bookingService}
          open={!!bookingService}
          onClose={() => setBookingService(null)}
        />
      )}
    </div>
  );
}

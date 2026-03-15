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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  BookOpen,
  Loader2,
  Pencil,
  Plus,
  Settings,
  Trash2,
  Users,
  Wand2,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { Service, ServiceInput, UserProfile } from "../backend.d";
import { ServiceType, UserRole } from "../backend.d";
import { StatusBadge } from "../components/StatusBadge";
import {
  useAddService,
  useCancelBooking,
  useGetAllBookings,
  useGetAllServices,
  useGetAllUsers,
  useInitializePresetServices,
  useRemoveService,
  useSaveUserProfile,
  useUpdateService,
} from "../hooks/useQueries";

function formatTime(ts: bigint) {
  return new Date(Number(ts) / 1_000_000).toLocaleString();
}

function formatPrice(price: bigint) {
  return `$${Number(price).toFixed(2)}`;
}

const serviceTypeOptions = [
  { value: ServiceType.cleaning, label: "Cleaning" },
  { value: ServiceType.laundry, label: "Laundry" },
  { value: ServiceType.cooking, label: "Cooking" },
  { value: ServiceType.dishwashing, label: "Dishwashing" },
  { value: ServiceType.ironing, label: "Ironing" },
  { value: ServiceType.generalHelp, label: "General Help" },
];

function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  isPending,
}: {
  initial?: Service;
  onSubmit: (input: ServiceInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [serviceType, setServiceType] = useState<ServiceType>(
    initial?.serviceType ?? ServiceType.cleaning,
  );
  const [description, setDescription] = useState(initial?.description ?? "");
  const [basePrice, setBasePrice] = useState(
    initial ? Number(initial.basePrice).toString() : "",
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name: name.trim(),
      serviceType,
      description: description.trim(),
      basePrice: BigInt(Math.round(Number.parseFloat(basePrice) * 100) / 100),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Service Name</Label>
          <Input
            placeholder="e.g. Deep Cleaning"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            data-ocid="service.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select
            value={serviceType}
            onValueChange={(v) => setServiceType(v as ServiceType)}
          >
            <SelectTrigger data-ocid="service.select">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {serviceTypeOptions.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          placeholder="Describe the service..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={3}
          data-ocid="service.textarea"
        />
      </div>
      <div className="space-y-2">
        <Label>Base Price ($)</Label>
        <Input
          type="number"
          placeholder="0.00"
          value={basePrice}
          onChange={(e) => setBasePrice(e.target.value)}
          required
          min="0"
          step="0.01"
          data-ocid="service.input"
        />
      </div>
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          data-ocid="service.cancel_button"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isPending}
          data-ocid="service.submit_button"
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {initial ? "Update Service" : "Add Service"}
        </Button>
      </div>
    </form>
  );
}

export function AdminPanel() {
  const [serviceDialog, setServiceDialog] = useState<{
    mode: "add" | "edit";
    service?: Service;
  } | null>(null);

  const { data: services, isLoading: servicesLoading } = useGetAllServices();
  const { data: bookings, isLoading: bookingsLoading } = useGetAllBookings();
  const { data: users, isLoading: usersLoading } = useGetAllUsers();

  const addService = useAddService();
  const updateService = useUpdateService();
  const removeService = useRemoveService();
  const initPreset = useInitializePresetServices();
  const cancelBooking = useCancelBooking();
  const saveProfile = useSaveUserProfile();

  const handleServiceSubmit = async (input: ServiceInput) => {
    if (serviceDialog?.mode === "edit" && serviceDialog.service) {
      await updateService.mutateAsync({ id: serviceDialog.service.id, input });
    } else {
      await addService.mutateAsync(input);
    }
    setServiceDialog(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Settings className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage services, bookings, and users.
        </p>
      </motion.div>

      <Tabs defaultValue="services">
        <TabsList className="mb-6" data-ocid="admin.tab">
          <TabsTrigger value="services" data-ocid="admin.tab">
            <Settings className="w-4 h-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="bookings" data-ocid="admin.tab">
            <BookOpen className="w-4 h-4 mr-2" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="users" data-ocid="admin.tab">
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services">
          <Card className="surface-raised">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="font-display">Services</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => initPreset.mutate()}
                    disabled={initPreset.isPending}
                    data-ocid="admin.secondary_button"
                  >
                    {initPreset.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Wand2 className="w-4 h-4 mr-2" />
                    )}
                    Initialize Presets
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setServiceDialog({ mode: "add" })}
                    data-ocid="admin.primary_button"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Service
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {servicesLoading ? (
                <div
                  className="space-y-2"
                  data-ocid="admin.services.loading_state"
                >
                  {["s1", "s2", "s3", "s4"].map((k) => (
                    <Skeleton key={k} className="h-12" />
                  ))}
                </div>
              ) : !services?.length ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.services.empty_state"
                >
                  <p className="font-medium">No services yet</p>
                  <p className="text-sm">
                    Add a service or initialize presets to get started.
                  </p>
                </div>
              ) : (
                <Table data-ocid="admin.services.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service, idx) => (
                      <TableRow
                        key={service.id.toString()}
                        data-ocid={`admin.services.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell>
                          <span className="text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground">
                            {service.serviceType}
                          </span>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {service.description}
                        </TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(service.basePrice)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                setServiceDialog({ mode: "edit", service })
                              }
                              data-ocid={`admin.services.edit_button.${idx + 1}`}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-destructive hover:text-destructive"
                                  data-ocid={`admin.services.delete_button.${idx + 1}`}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent data-ocid="admin.services.dialog">
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Delete Service?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Delete "{service.name}"? This cannot be
                                    undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel data-ocid="admin.services.cancel_button">
                                    Cancel
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      removeService.mutate(service.id)
                                    }
                                    className="bg-destructive text-destructive-foreground"
                                    data-ocid="admin.services.confirm_button"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings">
          <Card className="surface-raised">
            <CardHeader>
              <CardTitle className="font-display">All Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div
                  className="space-y-2"
                  data-ocid="admin.bookings.loading_state"
                >
                  {["s1", "s2", "s3", "s4"].map((k) => (
                    <Skeleton key={k} className="h-12" />
                  ))}
                </div>
              ) : !bookings?.length ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.bookings.empty_state"
                >
                  <p className="font-medium">No bookings yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table data-ocid="admin.bookings.table">
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking, idx) => (
                        <TableRow
                          key={booking.id.toString()}
                          data-ocid={`admin.bookings.row.${idx + 1}`}
                        >
                          <TableCell className="font-mono text-xs">
                            #{booking.id.toString()}
                          </TableCell>
                          <TableCell>#{booking.serviceId.toString()}</TableCell>
                          <TableCell>
                            <StatusBadge status={booking.status} />
                          </TableCell>
                          <TableCell className="text-sm">
                            {formatTime(booking.scheduledTime)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-[180px] truncate">
                            {booking.address}
                          </TableCell>
                          <TableCell className="font-semibold">
                            {formatPrice(booking.price)}
                          </TableCell>
                          <TableCell className="text-right">
                            {(booking.status === "pending" ||
                              booking.status === "accepted") && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-destructive hover:text-destructive"
                                    data-ocid={`admin.bookings.delete_button.${idx + 1}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent data-ocid="admin.bookings.dialog">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Cancel Booking?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Cancel booking #{booking.id.toString()}?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel data-ocid="admin.bookings.cancel_button">
                                      Keep
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        cancelBooking.mutate(booking.id)
                                      }
                                      className="bg-destructive text-destructive-foreground"
                                      data-ocid="admin.bookings.confirm_button"
                                    >
                                      Cancel Booking
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <Card className="surface-raised">
            <CardHeader>
              <CardTitle className="font-display">All Users</CardTitle>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div
                  className="space-y-2"
                  data-ocid="admin.users.loading_state"
                >
                  {["s1", "s2", "s3", "s4"].map((k) => (
                    <Skeleton key={k} className="h-12" />
                  ))}
                </div>
              ) : !users?.length ? (
                <div
                  className="text-center py-10 text-muted-foreground"
                  data-ocid="admin.users.empty_state"
                >
                  <p className="font-medium">No users yet</p>
                </div>
              ) : (
                <Table data-ocid="admin.users.table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Earnings</TableHead>
                      <TableHead className="text-right">Change Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user, idx) => (
                      <TableRow
                        key={user.name}
                        data-ocid={`admin.users.row.${idx + 1}`}
                      >
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs px-2 py-1 rounded-full font-medium ${
                              user.role === UserRole.admin
                                ? "bg-red-100 text-red-700"
                                : user.role === UserRole.worker
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-green-100 text-green-700"
                            }`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell>{Number(user.jobCount)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatPrice(user.earnings)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={user.role}
                            onValueChange={(v) =>
                              saveProfile.mutate({
                                ...user,
                                role: v as UserRole,
                              })
                            }
                          >
                            <SelectTrigger
                              className="w-32"
                              data-ocid={`admin.users.select.${idx + 1}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={UserRole.customer}>
                                Customer
                              </SelectItem>
                              <SelectItem value={UserRole.worker}>
                                Worker
                              </SelectItem>
                              <SelectItem value={UserRole.admin}>
                                Admin
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Service Dialog */}
      <Dialog
        open={!!serviceDialog}
        onOpenChange={() => setServiceDialog(null)}
      >
        <DialogContent className="max-w-lg" data-ocid="admin.service.dialog">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">
              {serviceDialog?.mode === "edit"
                ? "Edit Service"
                : "Add New Service"}
            </DialogTitle>
          </DialogHeader>
          {serviceDialog && (
            <ServiceForm
              initial={serviceDialog.service}
              onSubmit={handleServiceSubmit}
              onCancel={() => setServiceDialog(null)}
              isPending={addService.isPending || updateService.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

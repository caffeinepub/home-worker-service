import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { BookingStatus, ServiceInput, UserProfile } from "../backend.d";
import { useActor } from "./useActor";

export function useGetAllServices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllServices();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetCallerUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetMyBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["myBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPendingBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["pendingBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPendingBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allBookings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      serviceId: bigint;
      scheduledTime: bigint;
      address: string;
      notes: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      return actor.createBooking(
        args.serviceId,
        args.scheduledTime,
        args.address,
        args.notes,
      );
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBookings"] });
      toast.success("Booking created successfully!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBookings"] });
      qc.invalidateQueries({ queryKey: ["allBookings"] });
      qc.invalidateQueries({ queryKey: ["pendingBookings"] });
      toast.success("Booking cancelled.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAcceptBooking() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.acceptBooking(bookingId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pendingBookings"] });
      qc.invalidateQueries({ queryKey: ["myBookings"] });
      toast.success("Job accepted!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateBookingStatus() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { bookingId: bigint; status: BookingStatus }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateBookingStatus(args.bookingId, args.status);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["myBookings"] });
      qc.invalidateQueries({ queryKey: ["allBookings"] });
      toast.success("Status updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useAddService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ServiceInput) => {
      if (!actor) throw new Error("Not connected");
      return actor.addService(input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service added!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useUpdateService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: bigint; input: ServiceInput }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateService(args.id, args.input);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service updated!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRemoveService() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("Not connected");
      return actor.removeService(id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Service removed.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useInitializePresetServices() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.initializePresetServices();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["services"] });
      toast.success("Preset services initialized!");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRegisterCustomer() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerCustomer(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Welcome! Account created.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useRegisterWorker() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerWorker(name);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["callerProfile"] });
      qc.invalidateQueries({ queryKey: ["myProfile"] });
      toast.success("Welcome! Account created.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

export function useSaveUserProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Not connected");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["allUsers"] });
      toast.success("User updated.");
    },
    onError: (e: Error) => toast.error(e.message),
  });
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface ServiceInput {
    serviceType: ServiceType;
    name: string;
    description: string;
    basePrice: bigint;
}
export interface Service {
    id: bigint;
    serviceType: ServiceType;
    name: string;
    description: string;
    basePrice: bigint;
}
export interface Booking {
    id: bigint;
    status: BookingStatus;
    customer: Principal;
    scheduledTime: Time;
    createdTime: Time;
    address: string;
    notes: string;
    serviceId: bigint;
    price: bigint;
    worker?: Principal;
}
export interface UserProfile {
    name: string;
    role: UserRole;
    earnings: bigint;
    jobCount: bigint;
}
export enum BookingStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum ServiceType {
    cleaning = "cleaning",
    generalHelp = "generalHelp",
    cooking = "cooking",
    dishwashing = "dishwashing",
    ironing = "ironing",
    laundry = "laundry"
}
export enum UserRole {
    admin = "admin",
    customer = "customer",
    worker = "worker"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptBooking(bookingId: bigint): Promise<void>;
    addService(input: ServiceInput): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    createBooking(serviceId: bigint, scheduledTime: Time, address: string, notes: string): Promise<bigint>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllServices(): Promise<Array<Service>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getBookingsByStatus(status: BookingStatus): Promise<Array<Booking>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getMyBookings(): Promise<Array<Booking>>;
    getMyProfile(): Promise<UserProfile>;
    getPendingBookings(): Promise<Array<Booking>>;
    getUserProfile(user: Principal): Promise<UserProfile>;
    getUserRole(user: Principal): Promise<UserRole>;
    initializePresetServices(): Promise<void>;
    isCallerAdmin(): Promise<boolean>;
    registerCustomer(name: string): Promise<void>;
    registerWorker(name: string): Promise<void>;
    removeService(id: bigint): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBookingStatus(bookingId: bigint, status: BookingStatus): Promise<void>;
    updateService(id: bigint, input: ServiceInput): Promise<void>;
}

import Map "mo:core/Map";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  type UserRole = {
    #admin;
    #customer;
    #worker;
  };

  type ServiceType = {
    #cleaning;
    #laundry;
    #dishwashing;
    #ironing;
    #cooking;
    #generalHelp;
  };

  type Service = {
    id : Nat;
    serviceType : ServiceType;
    name : Text;
    description : Text;
    basePrice : Nat;
  };

  type ServiceInput = {
    serviceType : ServiceType;
    name : Text;
    description : Text;
    basePrice : Nat;
  };

  type UserProfile = {
    name : Text;
    role : UserRole;
    earnings : Nat;
    jobCount : Nat;
  };

  type BookingStatus = {
    #pending;
    #accepted;
    #inProgress;
    #completed;
    #cancelled;
  };

  type Booking = {
    id : Nat;
    customer : Principal;
    worker : ?Principal;
    serviceId : Nat;
    scheduledTime : Time.Time;
    address : Text;
    notes : Text;
    status : BookingStatus;
    createdTime : Time.Time;
    price : Nat;
  };

  module UserProfile {
    public func compare(p1 : UserProfile, p2 : UserProfile) : Order.Order {
      Text.compare(p1.name, p2.name);
    };
  };

  module Booking {
    public func compare(b1 : Booking, b2 : Booking) : Order.Order {
      Nat.compare(Int.abs(b2.createdTime), Int.abs(b1.createdTime));
    };
  };

  // System accessControlState
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Storage
  let users = Map.empty<Principal, UserProfile>();
  let services = Map.empty<Nat, Service>();
  let bookings = Map.empty<Nat, Booking>();

  var nextServiceId = 1;
  var nextBookingId = 1;

  // User Management
  public shared ({ caller }) func registerWorker(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already exists") };
      case (null) {
        users.add(
          caller,
          {
            name;
            role = #worker;
            earnings = 0;
            jobCount = 0;
          },
        );
      };
    };
  };

  public shared ({ caller }) func registerCustomer(name : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can register");
    };

    switch (users.get(caller)) {
      case (?_) { Runtime.trap("User already exists") };
      case (null) {
        users.add(
          caller,
          {
            name;
            role = #customer;
            earnings = 0;
            jobCount = 0;
          },
        );
      };
    };
  };

  public query ({ caller }) func getUserRole(user : Principal) : async UserRole {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own role unless admin");
    };

    switch (users.get(user)) {
      case (?profile) { profile.role };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    users.get(caller);
  };

  public query ({ caller }) func getMyProfile() : async UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };

    switch (users.get(caller)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile unless admin");
    };

    switch (users.get(user)) {
      case (?profile) { profile };
      case (null) { Runtime.trap("User not found") };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    users.add(caller, profile);
  };

  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    users.values().toArray().sort();
  };

  // Service Management (Admin only)
  public shared ({ caller }) func addService(input : ServiceInput) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can add services");
    };

    let id = nextServiceId;
    nextServiceId += 1;

    let service : Service = {
      id;
      serviceType = input.serviceType;
      name = input.name;
      description = input.description;
      basePrice = input.basePrice;
    };

    services.add(id, service);
  };

  public shared ({ caller }) func updateService(id : Nat, input : ServiceInput) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can update services");
    };

    switch (services.get(id)) {
      case (null) { Runtime.trap("Service not found") };
      case (?_) {
        let updated : Service = {
          id;
          serviceType = input.serviceType;
          name = input.name;
          description = input.description;
          basePrice = input.basePrice;
        };
        services.add(id, updated);
      };
    };
  };

  public shared ({ caller }) func removeService(id : Nat) : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can remove services");
    };
    services.remove(id);
  };

  public query ({ caller }) func getAllServices() : async [Service] {
    // Public access - anyone can view services catalog
    services.values().toArray();
  };

  // Booking Management
  public shared ({ caller }) func createBooking(serviceId : Nat, scheduledTime : Time.Time, address : Text, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create bookings");
    };

    switch (users.get(caller)) {
      case (?profile) {
        if (profile.role != #customer) {
          Runtime.trap("Only customers can create bookings");
        };
      };
      case (null) { Runtime.trap("User not registered") };
    };

    switch (services.get(serviceId)) {
      case (null) { Runtime.trap("Service not found") };
      case (?service) {
        let id = nextBookingId;
        nextBookingId += 1;

        let booking : Booking = {
          id;
          customer = caller;
          worker = null;
          serviceId;
          scheduledTime;
          address;
          notes;
          status = #pending;
          createdTime = Time.now();
          price = service.basePrice;
        };

        bookings.add(id, booking);
        id;
      };
    };
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view bookings");
    };

    let isCustomer = switch (users.get(caller)) {
      case (?profile) { profile.role == #customer };
      case (null) { false };
    };

    let bookingsArray = bookings.values().toArray();

    let filteredBookings = if (isCustomer) {
      bookingsArray.filter(
        func(b) {
          b.customer == caller;
        }
      );
    } else {
      bookingsArray.filter(
        func(b) {
          switch (b.worker) {
            case (?w) { w == caller };
            case (null) { false };
          };
        }
      );
    };
    filteredBookings.sort();
  };

  public query ({ caller }) func getPendingBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view pending bookings");
    };

    // Verify caller is a worker
    switch (users.get(caller)) {
      case (?profile) {
        if (profile.role != #worker and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Only workers can view pending bookings");
        };
      };
      case (null) { Runtime.trap("User not registered") };
    };

    bookings.values().toArray().filter(
      func(b) {
        b.status == #pending;
      }
    );
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };
    bookings.values().toArray();
  };

  public shared ({ caller }) func acceptBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept bookings");
    };

    switch (users.get(caller)) {
      case (?profile) {
        if (profile.role != #worker) {
          Runtime.trap("Only workers can accept bookings");
        };
      };
      case (null) { Runtime.trap("User not registered") };
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        if (booking.status != #pending) {
          Runtime.trap("Booking is no longer pending");
        };

        let updated : Booking = {
          booking with
          worker = ?caller;
          status = #accepted;
        };
        bookings.add(bookingId, updated);
      };
    };
  };

  public shared ({ caller }) func updateBookingStatus(bookingId : Nat, status : BookingStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update booking status");
    };

    switch (users.get(caller)) {
      case (?profile) {
        if (profile.role != #worker) {
          Runtime.trap("Only workers can update booking status");
        };
      };
      case (null) { Runtime.trap("User not registered") };
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        switch (booking.worker) {
          case (?worker) {
            if (worker != caller) {
              Runtime.trap("You are not assigned to this booking");
            };
          };
          case (null) { Runtime.trap("No worker assigned") };
        };

        let updated : Booking = {
          booking with
          status;
        };
        bookings.add(bookingId, updated);

        if (status == #completed) {
          switch (booking.worker) {
            case (?worker) {
              switch (users.get(worker)) {
                case (?profile) {
                  let updatedProfile : UserProfile = {
                    profile with
                    earnings = profile.earnings + booking.price;
                    jobCount = profile.jobCount + 1;
                  };
                  users.add(worker, updatedProfile);
                };
                case (null) {};
              };
            };
            case (null) {};
          };
        };
      };
    };
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) { Runtime.trap("Booking not found") };
      case (?booking) {
        let isOwner = booking.customer == caller;
        let isAdmin = AccessControl.isAdmin(accessControlState, caller);

        if (not (isOwner or isAdmin)) {
          Runtime.trap("Only the customer who created the booking or admins can cancel it");
        };

        if (booking.status != #pending) {
          Runtime.trap("Only pending bookings can be cancelled");
        };

        let updated : Booking = {
          booking with
          status = #cancelled;
        };
        bookings.add(bookingId, updated);
      };
    };
  };

  // Preset Services
  public shared ({ caller }) func initializePresetServices() : async () {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can initialize services");
    };

    let presetServices : [ServiceInput] = [
      {
        serviceType = #cleaning;
        name = "Basic Cleaning";
        description = "General house cleaning, including floors, surfaces, and dusting.";
        basePrice = 50;
      },
      {
        serviceType = #laundry;
        name = "Laundry Service";
        description = "Washing, drying, and folding clothes.";
        basePrice = 30;
      },
      {
        serviceType = #dishwashing;
        name = "Dishwashing";
        description = "Cleaning and sanitizing kitchen dishes.";
        basePrice = 20;
      },
      {
        serviceType = #ironing;
        name = "Ironing Clothes";
        description = "Ironing and pressing clothes.";
        basePrice = 25;
      },
      {
        serviceType = #cooking;
        name = "Cooking Assistance";
        description = "Meal preparation and cooking assistance.";
        basePrice = 40;
      },
      {
        serviceType = #generalHelp;
        name = "General Help";
        description = "Miscellaneous household tasks and assistance.";
        basePrice = 35;
      },
    ];

    for (preset in presetServices.values()) {
      let id = nextServiceId;
      nextServiceId += 1;

      let service : Service = {
        id;
        serviceType = preset.serviceType;
        name = preset.name;
        description = preset.description;
        basePrice = preset.basePrice;
      };

      services.add(id, service);
    };
  };

  // Booking Filtering by Status
  public query ({ caller }) func getBookingsByStatus(status : BookingStatus) : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can filter bookings");
    };

    // Only admins can view all bookings by status
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can filter all bookings by status");
    };

    bookings.values().toArray().filter(
      func(b) {
        b.status == status;
      }
    );
  };
};

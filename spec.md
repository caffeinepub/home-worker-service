# Home Worker Service

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Customer flow: browse services, book a job (service type, date/time, address, notes)
- Worker flow: view available jobs, accept a job, view assigned jobs, mark job complete
- Admin panel: manage services catalog, manage users (customers & workers), view/manage all bookings, approve workers
- Role-based access: Customer, Worker, Admin
- Dashboard per role showing relevant stats and actions
- Service types: Cleaning, Laundry, Dishwashing, Ironing, Cooking, General Help
- Booking statuses: Pending, Accepted, In Progress, Completed, Cancelled

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: User profiles with roles (customer/worker/admin), Services catalog, Bookings with status tracking, Worker job management
2. Frontend: Role-based routing, Customer booking flow, Worker job board, Admin panel with full management
3. Authorization component for role-based access control

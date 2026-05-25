# AutoConnect — Postman Testing Guide

All requests go through the **API Gateway** at `http://localhost:8089`.  
Direct service ports are listed for reference only — in normal testing use the gateway.

---

## Table of Contents

1. [Setup & Environment Variables](#1-setup--environment-variables)
2. [Authentication — user-service](#2-authentication--user-service)
3. [User Management — user-service](#3-user-management--user-service)
4. [Customer & CRM — customer-service](#4-customer--crm--customer-service)
5. [Inventory — inventory-service](#5-inventory--inventory-service)
6. [Sales — sales-service](#6-sales--sales-service)
7. [Finance — finance-service](#7-finance--finance-service)
8. [Service Management — service-management-service](#8-service-management--service-management-service)
9. [End-to-End Workflows](#9-end-to-end-workflows)
10. [Security & Edge Case Scenarios](#10-security--edge-case-scenarios)

---

## Port Reference

| Service | Port |
|---|---|
| API Gateway | **8089** |
| user-service | 8082 |
| service-management-service | 8081 |
| customer-service | 8083 |
| sales-service | 8084 |
| inventory-service | 8085 |
| finance-service | 8086 |
| Eureka Dashboard | 8761 |

---

## 1. Setup & Environment Variables

### Create a Postman Environment named `AutoConnect`

| Variable | Initial Value | Description |
|---|---|---|
| `BASE_URL` | `http://localhost:8089` | API Gateway |
| `ADMIN_TOKEN` | _(fill after login)_ | JWT for ADMIN role |
| `SALES_TOKEN` | _(fill after login)_ | JWT for SALES_CONSULTANT role |
| `FINANCE_TOKEN` | _(fill after login)_ | JWT for FINANCE_OFFICER role |
| `ADVISOR_TOKEN` | _(fill after login)_ | JWT for SERVICE_ADVISOR role |
| `TECHNICIAN_TOKEN` | _(fill after login)_ | JWT for TECHNICIAN role |
| `AUDITOR_TOKEN` | _(fill after login)_ | JWT for AUDITOR role |
| `customerId` | _(fill after create)_ | |
| `vehicleId` | _(fill after create)_ | |
| `quoteId` | _(fill after create)_ | |
| `dealId` | _(fill after create)_ | |
| `invoiceId` | _(fill after create)_ | |
| `appointmentId` | _(fill after create)_ | |
| `workOrderId` | _(fill after create)_ | |
| `jobCardId` | _(fill after create)_ | |

### Authorization Header Convention

Every protected request must include:
```
Authorization: Bearer {{ADMIN_TOKEN}}
```
Replace the variable name with the appropriate role token for each scenario.

---

## 2. Authentication — user-service

> Base path: `{{BASE_URL}}/api/auth`  
> These endpoints are **public** — no token required.

---

### 2.1 Register a new user

**POST** `{{BASE_URL}}/api/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "username": "alice_admin",
  "email": "alice@autoconnect.com",
  "password": "Admin@1234",
  "role": "ADMIN"
}
```

**Expected — 201 Created:**
```json
{
  "userId": 1,
  "username": "alice_admin",
  "email": "alice@autoconnect.com",
  "role": "ADMIN",
  "createdAt": "2026-05-13T10:00:00"
}
```

**Repeat for other roles.** Suggested test accounts:

| Username | Role | Password |
|---|---|---|
| alice_admin | ADMIN | Admin@1234 |
| bob_sales | SALES_CONSULTANT | Sales@1234 |
| carol_finance | FINANCE_OFFICER | Finance@1234 |
| dave_advisor | SERVICE_ADVISOR | Advisor@1234 |
| eve_tech | TECHNICIAN | Tech@1234 |
| frank_auditor | AUDITOR | Audit@1234 |

**Failure — duplicate email — 400/409:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Email already registered"
}
```

---

### 2.2 Login

**POST** `{{BASE_URL}}/api/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body:**
```json
{
  "email": "alice@autoconnect.com",
  "password": "Admin@1234"
}
```

**Expected — 200 OK:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": 1,
  "role": "ADMIN",
  "email": "alice@autoconnect.com"
}
```

> **Action:** Copy `token` value → paste into `ADMIN_TOKEN` environment variable.  
> Repeat login for every test account and save each token to its variable.

**Failure — wrong password — 401:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

---

### 2.3 Validate token

**POST** `{{BASE_URL}}/api/auth/validate`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "valid": true,
  "userId": 1,
  "role": "ADMIN",
  "email": "alice@autoconnect.com"
}
```

**Failure — expired/invalid token — 401:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

### 2.4 Logout

**POST** `{{BASE_URL}}/api/auth/logout`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "message": "Logged out successfully"
}
```

---

## 3. User Management — user-service

> Base path: `{{BASE_URL}}/api/users`  
> Requires **ADMIN** token for most operations.

---

### 3.1 Get all users

**GET** `{{BASE_URL}}/api/users`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected — 200 OK:**
```json
[
  {
    "userId": 1,
    "username": "alice_admin",
    "email": "alice@autoconnect.com",
    "role": "ADMIN"
  },
  {
    "userId": 2,
    "username": "bob_sales",
    "email": "bob@autoconnect.com",
    "role": "SALES_CONSULTANT"
  }
]
```

**Failure — non-ADMIN calls this — 403:**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

---

### 3.2 Get user by ID

**GET** `{{BASE_URL}}/api/users/1`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "userId": 1,
  "username": "alice_admin",
  "email": "alice@autoconnect.com",
  "role": "ADMIN"
}
```

**Failure — not found — 404:**
```json
{
  "status": 404,
  "error": "Not Found",
  "message": "User not found with id: 999"
}
```

---

### 3.3 Assign role

**POST** `{{BASE_URL}}/api/users/2/assign-role?role=FINANCE_OFFICER`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "userId": 2,
  "role": "FINANCE_OFFICER"
}
```

---

### 3.4 Get available roles

**GET** `{{BASE_URL}}/api/users/roles`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
```

**Expected — 200 OK:**
```json
["ADMIN", "SALES_CONSULTANT", "FINANCE_OFFICER", "SERVICE_ADVISOR", "TECHNICIAN", "AUDITOR", "PARTS_MANAGER"]
```

---

## 4. Customer & CRM — customer-service

> Base path: `{{BASE_URL}}/api`

---

### 4.1 Create customer

**POST** `{{BASE_URL}}/api/customers`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "address": "42 Elm Street, Springfield"
}
```

**Expected — 201 Created:**
```json
{
  "customerId": 1,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "phone": "9876543210",
  "address": "42 Elm Street, Springfield"
}
```

> **Action:** Save `customerId` → `{{customerId}}` environment variable.

**Failure — non-SALES/ADMIN token — 403:**
```json
{ "status": 403, "error": "Forbidden", "message": "Access Denied" }
```

---

### 4.2 Get all customers

**GET** `{{BASE_URL}}/api/customers`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:** Array of customer objects.

---

### 4.3 Get customer by ID

**GET** `{{BASE_URL}}/api/customers/{{customerId}}`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:** Single customer object.

---

### 4.4 Create a lead

**POST** `{{BASE_URL}}/api/leads`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "source": "WALK_IN",
  "notes": "Interested in SUVs under 20 lakhs"
}
```

**Expected — 201 Created:**
```json
{
  "leadId": 1,
  "customerId": 1,
  "source": "WALK_IN",
  "status": "NEW",
  "notes": "Interested in SUVs under 20 lakhs"
}
```

---

### 4.5 Update lead status

**POST** `{{BASE_URL}}/api/leads/1/update-status?status=CONTACTED`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "leadId": 1,
  "status": "CONTACTED"
}
```

---

### 4.6 Log a CRM interaction

**POST** `{{BASE_URL}}/api/interactions/log`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "channel": "PHONE",
  "notes": "Customer confirmed test drive for Saturday"
}
```

**Expected — 201 Created:** Interaction record with `interactionId`.

---

## 5. Inventory — inventory-service

> Base path: `{{BASE_URL}}/api/inventory`

---

### 5.1 Add a vehicle

**POST** `{{BASE_URL}}/api/inventory/vehicles`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "make": "Toyota",
  "model": "Fortuner",
  "year": 2025,
  "vin": "VIN123456789",
  "color": "Pearl White",
  "mileage": 0,
  "price": 3500000.00,
  "status": "AVAILABLE"
}
```

**Expected — 201 Created:**
```json
{
  "vehicleId": 1,
  "make": "Toyota",
  "model": "Fortuner",
  "year": 2025,
  "vin": "VIN123456789",
  "status": "AVAILABLE",
  "price": 3500000.00
}
```

> **Action:** Save `vehicleId` → `{{vehicleId}}`.

---

### 5.2 Get all vehicles

**GET** `{{BASE_URL}}/api/inventory/vehicles`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:** Array of vehicle objects.

---

### 5.3 Get vehicle by ID

**GET** `{{BASE_URL}}/api/inventory/vehicles/{{vehicleId}}`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:** Single vehicle object.

**Failure — not found — 404:**
```json
{ "status": 404, "error": "Not Found", "message": "Vehicle not found with id: 999" }
```

---

### 5.4 Check availability

**POST** `{{BASE_URL}}/api/inventory/check-availability`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "vehicleId": 1
}
```

**Expected — 200 OK (available):**
```json
{
  "vehicleId": 1,
  "available": true,
  "status": "AVAILABLE"
}
```

**Expected — vehicle already sold:**
```json
{
  "vehicleId": 1,
  "available": false,
  "status": "SOLD"
}
```

---

### 5.5 Calculate pricing

**POST** `{{BASE_URL}}/api/inventory/pricing/calculate`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "vehicleId": 1,
  "customerId": 1
}
```

**Expected — 200 OK:**
```json
{
  "vehicleId": 1,
  "basePrice": 3500000.00,
  "discount": 50000.00,
  "finalPrice": 3450000.00
}
```

---

### 5.6 Add a part to inventory

**POST** `{{BASE_URL}}/api/v1/inventory/parts`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "partNumber": "OIL-FLT-001",
  "name": "Oil Filter",
  "description": "Standard oil filter for 2.0L engines",
  "category": "FILTERS",
  "unitPrice": 450.00
}
```

**Expected — 201 Created:** Part record with `partId`.

---

### 5.7 Create part inventory (stock at location)

**POST** `{{BASE_URL}}/api/v1/inventory/parts/inventory`

**Headers:**
```
Authorization: Bearer {{ADMIN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "partId": 1,
  "locationId": 1,
  "quantityOnHand": 100,
  "quantityReserved": 0,
  "reorderPoint": 10
}
```

**Expected — 201 Created:** PartInventory record.

---

### 5.8 Consume a part

**POST** `{{BASE_URL}}/api/v1/inventory/parts/1/consume`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "locationId": 1,
  "quantity": 2
}
```

**Expected — 200 OK:**
```json
{
  "partId": 1,
  "locationId": 1,
  "quantityOnHand": 98,
  "quantityReserved": 0
}
```

**Failure — insufficient stock — 400:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Cannot consume 200 units — only 98 on hand"
}
```

---

### 5.9 Mark vehicle as sold (manual test)

**POST** `{{BASE_URL}}/api/inventory/vehicles/{{vehicleId}}/mark-sold`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "vehicleId": 1,
  "status": "SOLD"
}
```

**Failure — already sold — 409/400:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Vehicle is already SOLD"
}
```

---

## 6. Sales — sales-service

> Base path: `{{BASE_URL}}/api/sales`

---

### 6.1 Create a quote

**POST** `{{BASE_URL}}/api/sales/quotes`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "vehicleId": 1,
  "salesConsultantId": 2,
  "totalPrice": 3450000.00,
  "validUntil": "2026-06-30T23:59:59"
}
```

**Expected — 201 Created:**
```json
{
  "quoteId": 1,
  "customerId": 1,
  "vehicleId": 1,
  "totalPrice": 3450000.00,
  "status": "DRAFT",
  "validUntil": "2026-06-30T23:59:59"
}
```

> **Action:** Save `quoteId` → `{{quoteId}}`.

---

### 6.2 Generate quote (DRAFT → GENERATED)

**POST** `{{BASE_URL}}/api/sales/quotes/{{quoteId}}/generate`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "quoteId": 1,
  "status": "GENERATED"
}
```

---

### 6.3 Apply promo code to quote

**POST** `{{BASE_URL}}/api/sales/quotes/{{quoteId}}/apply-promo?code=SUMMER10`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:** Quote with updated price after discount.

**Failure — invalid code — 400:**
```json
{ "status": 400, "message": "Promo code SUMMER10 not found or expired" }
```

---

### 6.4 Create a deal from a quote

**POST** `{{BASE_URL}}/api/sales/deals`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "quoteId": 1,
  "customerId": 1,
  "vehicleId": 1,
  "agreedPrice": 3450000.00
}
```

**Expected — 201 Created:**
```json
{
  "dealId": 1,
  "quoteId": 1,
  "status": "PENDING",
  "agreedPrice": 3450000.00
}
```

> **Action:** Save `dealId` → `{{dealId}}`.

---

### 6.5 Approve deal

**POST** `{{BASE_URL}}/api/sales/deals/{{dealId}}/approve`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "dealId": 1,
  "status": "APPROVED"
}
```

---

### 6.6 Finalize deal (triggers inventory markSold + finance invoice)

**POST** `{{BASE_URL}}/api/sales/deals/{{dealId}}/finalize`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "dealId": 1,
  "status": "FINALIZED"
}
```

> This call:  
> 1. Marks the vehicle SOLD in inventory-service  
> 2. Creates an invoice in finance-service  
> 3. If finance is down, rolls the vehicle back to AVAILABLE

**Failure — finance-service down (compensating transaction triggered):**
```json
{
  "status": 500,
  "error": "Internal Server Error",
  "message": "Deal finalization failed: could not create invoice. Vehicle status has been rolled back."
}
```

**Failure — deal not APPROVED — 400:**
```json
{ "message": "Deal must be APPROVED before finalization. Current status: PENDING" }
```

---

### 6.7 Book a test drive

**POST** `{{BASE_URL}}/api/sales/test-drives`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "vehicleId": 1,
  "scheduledAt": "2026-05-20T10:00:00",
  "notes": "Customer prefers highway test route"
}
```

**Expected — 201 Created:**
```json
{
  "testDriveId": 1,
  "status": "SCHEDULED"
}
```

---

### 6.8 Calculate commission

**POST** `{{BASE_URL}}/api/sales/commissions/calculate?dealId={{dealId}}`

**Headers:**
```
Authorization: Bearer {{SALES_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "dealId": 1,
  "commissionAmount": 103500.00,
  "rate": 0.03
}
```

---

## 7. Finance — finance-service

> Base path: `{{BASE_URL}}/api/finance`

---

### 7.1 Generate an invoice manually

**POST** `{{BASE_URL}}/api/finance/invoices`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "relatedEntityType": "DEAL",
  "relatedEntityId": 1,
  "subTotal": 3450000.00,
  "taxAmount": 621000.00,
  "dueAt": "2026-06-13T00:00:00"
}
```

**Expected — 201 Created:**
```json
{
  "invoiceId": 1,
  "customerId": 1,
  "totalAmount": 4071000.00,
  "status": "PENDING",
  "issuedAt": "2026-05-13T10:00:00",
  "dueAt": "2026-06-13T00:00:00"
}
```

> **Action:** Save `invoiceId` → `{{invoiceId}}`.

**Failure — missing required field — 400:**
```json
{
  "status": 400,
  "errors": {
    "subTotal": "Sub total is required",
    "customerId": "Customer ID is required"
  }
}
```

---

### 7.2 Get all invoices

**GET** `{{BASE_URL}}/api/finance/invoices`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
```

**Expected — 200 OK:** Array of invoice objects.

**Failure — TECHNICIAN token used — 403:**
```json
{ "status": 403, "error": "Forbidden", "message": "Access Denied" }
```

---

### 7.3 Get invoice by ID

**GET** `{{BASE_URL}}/api/finance/invoices/{{invoiceId}}`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
```

**Expected — 200 OK:** Single invoice object.

---

### 7.4 Get invoices by customer

**GET** `{{BASE_URL}}/api/finance/invoices/customer/{{customerId}}`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
```

**Expected — 200 OK:** Array of invoices for that customer.

---

### 7.5 Update invoice status

**PATCH** `{{BASE_URL}}/api/finance/invoices/{{invoiceId}}/status?status=PAID`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "invoiceId": 1,
  "status": "PAID"
}
```

**Failure — SALES_CONSULTANT token — 403:**
```json
{ "status": 403, "error": "Forbidden", "message": "Access Denied" }
```

---

### 7.6 Process a payment

**POST** `{{BASE_URL}}/api/finance/payments`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "invoiceId": 1,
  "amount": 4071000.00,
  "paymentMethod": "BANK_TRANSFER",
  "referenceNumber": "TXN20260513001"
}
```

**Expected — 201 Created:**
```json
{
  "paymentId": 1,
  "invoiceId": 1,
  "amount": 4071000.00,
  "status": "SUCCESS",
  "paidAt": "2026-05-13T10:15:00"
}
```

---

### 7.7 Get payment by ID

**GET** `{{BASE_URL}}/api/finance/payments/1`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
```

**Expected — 200 OK:** Payment record.

---

### 7.8 Get payments for an invoice

**GET** `{{BASE_URL}}/api/finance/invoices/{{invoiceId}}/payments`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
```

**Expected — 200 OK:** Array of payment records.

---

### 7.9 Run reconciliation

**POST** `{{BASE_URL}}/api/finance/reconciliation/run`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "periodStart": "2026-05-01T00:00:00",
  "periodEnd": "2026-05-31T23:59:59",
  "notes": "End of May 2026 reconciliation"
}
```

**Expected — 200 OK:**
```json
{
  "auditPackageId": 1,
  "totalInvoices": 5,
  "totalPaymentsCollected": 15000000.00,
  "unpaidInvoiceCount": 1,
  "reconciledBy": "carol@autoconnect.com",
  "reconciledAt": "2026-05-13T10:20:00",
  "status": "RECONCILED",
  "notes": "End of May 2026 reconciliation"
}
```

**Failure — no invoices in period — 400:**
```json
{ "status": 400, "message": "No invoices found in the specified period" }
```

**Failure — AUDITOR token (read-only, cannot reconcile) — 403:**
```json
{ "status": 403, "error": "Forbidden", "message": "Access Denied" }
```

---

### 7.10 Generate audit package

**POST** `{{BASE_URL}}/api/finance/audit-packages`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "periodStart": "2026-05-01T00:00:00",
  "periodEnd": "2026-05-31T23:59:59",
  "packageUri": "s3://autoconnect-audit/may-2026.zip"
}
```

**Expected — 201 Created:**
```json
{
  "packageId": 1,
  "periodStart": "2026-05-01T00:00:00",
  "periodEnd": "2026-05-31T23:59:59",
  "contentsJson": "{\"invoiceCount\":5,\"totalPayments\":15000000.00}",
  "createdAt": "2026-05-13T10:25:00"
}
```

---

### 7.11 Create a task

**POST** `{{BASE_URL}}/api/finance/tasks`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "assignedTo": 5,
  "relatedEntityId": 1,
  "description": "Replace engine oil and filter for vehicle VIN123456789",
  "dueDate": "2026-05-14T17:00:00",
  "priority": "HIGH"
}
```

**Expected — 201 Created:**
```json
{
  "taskId": 1,
  "assignedTo": 5,
  "description": "Replace engine oil and filter for vehicle VIN123456789",
  "status": "PENDING",
  "priority": "HIGH",
  "dueDate": "2026-05-14T17:00:00"
}
```

---

### 7.12 Send a notification

**POST** `{{BASE_URL}}/api/finance/notifications`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "userId": 1,
  "title": "Service Appointment Reminder",
  "message": "Your vehicle service is scheduled for tomorrow at 10 AM",
  "type": "REMINDER"
}
```

**Expected — 201 Created:** Notification record.

---

### 7.13 Generate a report

**POST** `{{BASE_URL}}/api/finance/reports`

**Headers:**
```
Authorization: Bearer {{FINANCE_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Monthly Revenue — May 2026",
  "scope": "MONTHLY",
  "generatedBy": 3,
  "content": "Total revenue: 15,000,000"
}
```

**Expected — 201 Created:** Report record.

---

## 8. Service Management — service-management-service

> Base path: `{{BASE_URL}}/api`

---

### 8.1 Create a service appointment

**POST** `{{BASE_URL}}/api/appointments`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "customerId": 1,
  "vehicleId": 1,
  "advisorId": 4,
  "scheduledAt": "2026-05-20T09:00:00",
  "durationMinutes": 120,
  "serviceType": "PERIODIC_MAINTENANCE"
}
```

**Expected — 201 Created:**
```json
{
  "appId": 1,
  "customerId": 1,
  "vehicleId": 1,
  "status": "BOOKED",
  "scheduledAt": "2026-05-20T09:00:00",
  "serviceType": "PERIODIC_MAINTENANCE"
}
```

> **Action:** Save `appId` → `{{appointmentId}}`.

---

### 8.2 Get all appointments

**GET** `{{BASE_URL}}/api/appointments`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
```

**Expected — 200 OK:** Array of appointment objects.

---

### 8.3 Schedule appointment (BOOKED → IN_PROGRESS)

**POST** `{{BASE_URL}}/api/appointments/{{appointmentId}}/schedule`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "appId": 1,
  "status": "IN_PROGRESS"
}
```

**Failure — appointment already IN_PROGRESS — 400:**
```json
{
  "message": "Only BOOKED appointments can be moved to IN_PROGRESS. Current status: IN_PROGRESS"
}
```

---

### 8.4 Create a work order

> Appointment must be IN_PROGRESS first.

**POST** `{{BASE_URL}}/api/workorders`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "appointmentId": 1,
  "advisorId": 4,
  "reportedIssues": "Engine oil overdue, AC not cooling, brake pads worn",
  "estimatedHours": 3.5,
  "partsRequired": "Oil filter, AC refrigerant, Brake pads"
}
```

**Expected — 201 Created:**
```json
{
  "woId": 1,
  "appointmentId": 1,
  "status": "OPEN",
  "reportedIssues": "Engine oil overdue, AC not cooling, brake pads worn",
  "estimatedHours": 3.5
}
```

> **Action:** Save `woId` → `{{workOrderId}}`.

**Failure — appointment not IN_PROGRESS — 400:**
```json
{
  "message": "A Work Order can only be created for an IN_PROGRESS appointment. Current status: BOOKED"
}
```

**Failure — work order already exists for this appointment — 400:**
```json
{
  "message": "A Work Order already exists for Appointment ID: 1"
}
```

---

### 8.5 Assign technician to work order

**POST** `{{BASE_URL}}/api/workorders/{{workOrderId}}/assign-technician`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "technicianId": 5
}
```

**Expected — 200 OK:**
```json
{
  "woId": 1,
  "assignedTechnician": 5,
  "status": "IN_PROGRESS"
}
```

> This also creates a task in finance-service for the technician.

**Failure — work order COMPLETED — 400:**
```json
{
  "message": "Cannot assign a technician to a COMPLETED Work Order"
}
```

---

### 8.6 Create a job card

> Technician must be assigned first.

**POST** `{{BASE_URL}}/api/jobcards`

**Headers:**
```
Authorization: Bearer {{ADVISOR_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "workOrderId": 1,
  "technicianId": 5,
  "findings": "Oil sludge observed, AC compressor low on refrigerant, rear brake pads at 10%",
  "actions": "Replace oil and filter, recharge AC, replace rear brake pads",
  "photos": []
}
```

**Expected — 201 Created:**
```json
{
  "jobId": 1,
  "workOrderId": 1,
  "technicianId": 5,
  "status": "CREATED",
  "findings": "Oil sludge observed..."
}
```

> **Action:** Save `jobId` → `{{jobCardId}}`.

**Failure — no technician assigned — 400:**
```json
{
  "message": "A technician must be assigned to the Work Order before a Job Card can be created"
}
```

---

### 8.7 Start job (CREATED → IN_PROGRESS)

**POST** `{{BASE_URL}}/api/jobcards/{{jobCardId}}/start`

**Headers:**
```
Authorization: Bearer {{TECHNICIAN_TOKEN}}
```

**Expected — 200 OK:**
```json
{
  "jobId": 1,
  "status": "IN_PROGRESS",
  "startAt": "2026-05-20T09:15:00"
}
```

**Failure — not CREATED — 400:**
```json
{
  "message": "Job can only be started from CREATED status. Current status: IN_PROGRESS"
}
```

---

### 8.8 Technician views their job cards

**GET** `{{BASE_URL}}/api/jobcards/my`

**Headers:**
```
Authorization: Bearer {{TECHNICIAN_TOKEN}}
```

**Expected — 200 OK:** Only job cards assigned to this technician's userId.

---

### 8.9 Technician scope enforcement — access another technician's job card

**GET** `{{BASE_URL}}/api/jobcards/{{jobCardId}}`

Use a **different technician's token** (one whose userId ≠ jobCard.technicianId).

**Expected — 403 Forbidden:**
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Technicians can only access their own job cards"
}
```

---

### 8.10 Consume a part (service-management)

**POST** `{{BASE_URL}}/api/v1/parts/1/consume`

**Headers:**
```
Authorization: Bearer {{TECHNICIAN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "jobCardId": 1,
  "quantity": 1,
  "locationId": 1,
  "notes": "Replaced oil filter during periodic maintenance"
}
```

**Expected — 201 Created:** PartConsumption record; inventory-service stock decremented.

---

### 8.11 Complete job (IN_PROGRESS → SIGNED_OFF)

**POST** `{{BASE_URL}}/api/jobcards/{{jobCardId}}/complete`

**Headers:**
```
Authorization: Bearer {{TECHNICIAN_TOKEN}}
Content-Type: application/json
```

**Body:**
```json
{
  "findings": "All issues resolved. Vehicle in good condition.",
  "actions": "Changed oil & filter, recharged AC, replaced brake pads.",
  "photos": [],
  "signedOffBy": "eve_tech"
}
```

**Expected — 200 OK:**
```json
{
  "jobId": 1,
  "status": "SIGNED_OFF",
  "endAt": "2026-05-20T12:30:00",
  "signedOffBy": "eve_tech"
}
```

> This cascades:  
> 1. Work Order → COMPLETED  
> 2. Appointment → COMPLETED  
> 3. Invoice created in finance-service

**Failure — job not IN_PROGRESS — 400:**
```json
{
  "message": "Job must be IN_PROGRESS to be completed. Current status: CREATED"
}
```

---

## 9. End-to-End Workflows

Execute these in sequence. Each step depends on the previous one.

---

### Workflow A — Lead to Sale (Vehicle Purchase)

```
1. POST /api/auth/login                    → get SALES_TOKEN
2. POST /api/customers                     → create customer, save customerId
3. POST /api/leads                         → create lead
4. POST /api/inventory/vehicles            → add vehicle (ADMIN_TOKEN), save vehicleId
5. POST /api/sales/quotes                  → create quote (quoteId)
6. POST /api/sales/quotes/{id}/generate    → quote DRAFT → GENERATED
7. POST /api/sales/deals                   → create deal (dealId)
8. POST /api/sales/deals/{id}/approve      → deal PENDING → APPROVED
9. POST /api/sales/deals/{id}/finalize     → deal APPROVED → FINALIZED
                                             vehicle → SOLD
                                             invoice created in finance
10. GET  /api/finance/invoices             → verify invoice exists (FINANCE_TOKEN)
11. POST /api/finance/payments             → record payment against invoice
12. GET  /api/inventory/vehicles/{id}      → confirm status = SOLD
```

---

### Workflow B — Service & Repair Lifecycle

```
1. POST /api/auth/login                             → get ADVISOR_TOKEN, TECHNICIAN_TOKEN
2. POST /api/appointments                           → book appointment (BOOKED)
3. POST /api/appointments/{id}/schedule             → BOOKED → IN_PROGRESS
4. POST /api/workorders                             → create work order (OPEN)
5. POST /api/workorders/{id}/assign-technician      → assign tech, WO → IN_PROGRESS
                                                      task created in finance for technician
6. POST /api/jobcards                               → create job card (CREATED)
7. POST /api/jobcards/{id}/start                    → CREATED → IN_PROGRESS
8. POST /api/v1/parts/{partId}/consume              → consume parts (stock reduced in inventory)
9. POST /api/jobcards/{id}/complete                 → IN_PROGRESS → SIGNED_OFF
                                                      WO → COMPLETED
                                                      Appointment → COMPLETED
                                                      Invoice created in finance
10. GET  /api/finance/invoices/customer/{customerId} → verify service invoice
```

---

### Workflow C — Period-End Financial Reconciliation

```
1. Complete Workflow A and/or B so invoices exist
2. POST /api/finance/payments                     → record payment (FINANCE_TOKEN)
3. POST /api/finance/reconciliation/run           → run reconciliation for the period
4. GET  /api/finance/audit-packages               → verify audit package was sealed
5. GET  /api/finance/invoices/status/PENDING      → check unpaid invoices
```

---

## 10. Security & Edge Case Scenarios

These tests verify that role guards work correctly.

---

### Scenario 1 — No token (401)

**Request:** Any protected endpoint without Authorization header.

**Expected — 401:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Missing or malformed Authorization header"
}
```

---

### Scenario 2 — Expired/tampered token (401)

**Request:** Any protected endpoint with a modified JWT.

Set `Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.TAMPERED.SIGNATURE`

**Expected — 401:**
```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Invalid or expired token"
}
```

---

### Scenario 3 — Wrong role (403)

| Endpoint | Token Used | Expected |
|---|---|---|
| `POST /api/finance/invoices` | `TECHNICIAN_TOKEN` | 403 |
| `POST /api/finance/reconciliation/run` | `AUDITOR_TOKEN` | 403 |
| `POST /api/inventory/vehicles` | `SALES_TOKEN` | 403 |
| `DELETE /api/inventory/vehicles/1` | `SALES_TOKEN` | 403 |
| `GET /api/users` | `SALES_TOKEN` | 403 |
| `POST /api/workorders` | `TECHNICIAN_TOKEN` | 403 |
| `DELETE /api/finance/notifications/1` | `SALES_TOKEN` | 403 |

All should return:
```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Access Denied"
}
```

---

### Scenario 4 — Double-sell prevention (optimistic locking)

1. Add vehicle → vehicleId = 1 (status: AVAILABLE)
2. Create and approve two separate deals both referencing vehicleId = 1
3. Fire `POST /api/sales/deals/1/finalize` and `POST /api/sales/deals/2/finalize` **simultaneously** (use Postman Runner or two browser tabs)
4. **Expected:** One succeeds (200 FINALIZED), the other fails (400/500 — optimistic lock conflict or "Vehicle is already SOLD")

---

### Scenario 5 — Work order state machine violations

| Attempt | Expected Error |
|---|---|
| Create WO when appointment is BOOKED (not scheduled) | 400: appointment must be IN_PROGRESS |
| Create second WO for same appointment | 400: WO already exists |
| Assign technician to COMPLETED WO | 400: cannot assign to COMPLETED |
| Create Job Card when no technician assigned | 400: technician must be assigned first |
| Create second Job Card for same WO | 400: Job Card already exists |
| Start a job already IN_PROGRESS | 400: can only start from CREATED |
| Complete a job that is CREATED (not started) | 400: job must be IN_PROGRESS |

---

### Scenario 6 — Finance invoice field validation

**POST** `{{BASE_URL}}/api/finance/invoices` with missing fields:

```json
{
  "relatedEntityType": "DEAL"
}
```

**Expected — 400:**
```json
{
  "status": 400,
  "errors": {
    "customerId": "Customer ID is required",
    "subTotal": "Sub total is required",
    "taxAmount": "Tax amount is required"
  }
}
```

---

### Scenario 7 — Technician cannot see another technician's job card

1. Login as `eve_tech` (TECHNICIAN, userId=5), get token A
2. Login as a second technician (userId=6), get token B
3. Create a job card assigned to technician 5 using ADVISOR_TOKEN
4. `GET /api/jobcards/{jobCardId}` using token B (technician 6)
5. **Expected — 403 Forbidden**

---

### Scenario 8 — Reconciliation on empty period

**POST** `{{BASE_URL}}/api/finance/reconciliation/run`

```json
{
  "periodStart": "2020-01-01T00:00:00",
  "periodEnd": "2020-01-31T23:59:59",
  "notes": "Test empty period"
}
```

**Expected — 400:**
```json
{
  "status": 400,
  "message": "No invoices found in the specified period"
}
```

---

### Scenario 9 — Parts stock insufficient

1. Create a part with `quantityOnHand = 2`
2. `POST /api/v1/inventory/parts/{id}/consume` with `quantity: 5`

**Expected — 400:**
```json
{
  "message": "Cannot consume 5 units — only 2 on hand"
}
```

---

### Scenario 10 — Delete BOOKED appointment (allowed) vs IN_PROGRESS (denied)

1. Create appointment → status BOOKED
2. `DELETE /api/appointments/{id}` → **200 No Content** (allowed)

3. Create another appointment → schedule it → status IN_PROGRESS
4. `DELETE /api/appointments/{id}` → **400**:
```json
{
  "message": "Cannot delete an appointment that is IN_PROGRESS or COMPLETED"
}
```

---

## Quick Reference — HTTP Status Codes

| Code | Meaning | Common Cause |
|---|---|---|
| 200 | OK | Successful read / update |
| 201 | Created | Successful create |
| 204 | No Content | Successful delete |
| 400 | Bad Request | Validation failure, business rule violation |
| 401 | Unauthorized | Missing or invalid JWT |
| 403 | Forbidden | Valid JWT but insufficient role |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Downstream service unavailable, unexpected exception |

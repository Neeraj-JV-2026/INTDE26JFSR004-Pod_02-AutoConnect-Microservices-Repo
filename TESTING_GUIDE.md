# AutoConnect System Testing Guide (Organic Data Flow)

This guide outlines the exact, step-by-step process for performing a comprehensive **End-to-End (E2E) Test** of the AutoConnect Dealership Management System using **only the Web UI**. 

Because all 8 microservices are successfully integrated, you do not need to manually run SQL scripts or use Postman. You will organically generate data through the frontend, passing it sequentially through the dealership roles.

---

## Step 1: Initialize Dealership Staff
*Goal: Populate the `user-service` with the required role-based accounts.*

1. Navigate to `http://localhost:5173/register`
2. Register the following 6 test accounts (use a simple password like `password123`):
   - **Name:** Admin User | **Email:** `admin@test.com` | **Role:** `ADMIN`
   - **Name:** Sales Rep | **Email:** `sales@test.com` | **Role:** `SALES_CONSULTANT`
   - **Name:** Service Advisor | **Email:** `service@test.com` | **Role:** `SERVICE_ADVISOR`
   - **Name:** Master Tech | **Email:** `tech@test.com` | **Role:** `TECHNICIAN`
   - **Name:** Parts Manager | **Email:** `parts@test.com` | **Role:** `PARTS_MANAGER`
   - **Name:** Finance Officer | **Email:** `finance@test.com` | **Role:** `FINANCE_OFFICER`
3. **Verification**: Log in as `admin@test.com`. In the Admin Panel under "User & Role Management", ensure all 6 accounts successfully load in the table. 
   *(This confirms `frontend` -> `api-gateway` -> `user-service` is working).*

---

## Step 2: Intake New Vehicles (DMS Integration)
*Goal: Populate the `inventory-service` using the public NHTSA API.*

1. While logged in as `admin@test.com`, click the **Inventory Intake (DMS)** tab.
2. Enter a valid 17-digit VIN (e.g., `5UXWX7C5*BA` or grab a random one online).
3. Click **Decode VIN**. The system will automatically fetch the Make, Model, and Year.
4. Set the Condition to `NEW`, Base Price to `45000`, MSRP to `48000`, and click **Add to Fleet**.
5. **Verification**: Log out and create a 7th account: `customer@test.com` (Role: `CUSTOMER`). Log in as the customer and go to "Browse Vehicles". You will see the vehicle you just added! 
   *(This confirms `frontend` -> `inventory-service` is working).*

---

## Step 3: Manage Sales Pipeline
*Goal: Test the `customer-service` lead generation and Sales Kanban board.*

1. Log in as `sales@test.com` (Sales Console).
2. Click the **+ New Lead** button on the Kanban board.
3. Fill out the form:
   - **Customer ID**: `7` (assuming the customer you just created is ID 7)
   - **Source**: `WALK_IN`
   - **Interested Model**: `BMW X3`
4. Click **Create Lead**.
5. **Verification**: The lead will instantly render in the "New Prospects" column. 
   *(This confirms `frontend` -> `customer-service` is working).*

---

## Step 4: Book Service & Assign Job Cards
*Goal: Test the `service-management-service` appointment and technician workflow.*

1. Log in as `service@test.com` (Service Advisor Console).
2. Click the **+ Book Appt** button.
3. Fill out the booking form:
   - **Customer ID**: `7`
   - **Vehicle ID**: `1`
   - **Date & Time**: (Select any upcoming date)
   - **Service Type**: `MAINTENANCE`
4. Click **Confirm Booking**.
5. On the new appointment that appears, click **Assign Tech**.
6. Fill out the Job Card:
   - **Technician User ID**: `4` (the ID of `tech@test.com`)
   - **Findings**: `Initial inspection and oil change`
   - **Estimated Labor Cost**: `150.00`
7. Click **Send to Tech**.
8. **Verification**: Log out, then log in as `tech@test.com` (Technician Console). The exact job you just assigned will appear on their "Active Jobs" board! 
   *(This confirms `frontend` -> `service-management-service` is working).*

---

## Step 5: Parts Stocking
*Goal: Test the `inventory-service` parts management module.*

1. Log in as `parts@test.com` (Parts Manager Console).
2. Click **+ Add Part**.
3. Fill out the form:
   - **Part Number**: `OIL-F-001`
   - **Description**: `Premium Synthetic Oil Filter`
   - **Manufacturer**: `Bosch`
   - **Cost**: `8.50`
   - **Retail Price**: `24.99`
4. Click **Save Part**.
5. **Verification**: The part instantly populates the inventory table with an "In Stock" badge. 

---

## Step 6: Generate Invoice & Revenue Aggregation
*Goal: Test the `finance-service` and cross-service aggregation.*

1. Log in as `finance@test.com` (Finance Dashboard).
2. Click **+ New Invoice**.
3. Fill out the form for the vehicle sale:
   - **Customer ID**: `7`
   - **Entity Type**: `Vehicle Sale`
   - **Entity ID**: `1`
   - **Status**: `Paid in Full`
   - **Subtotal**: `45000`
   - **Tax Amount**: `3000`
4. Click **Generate Invoice**.
5. **Verification 1**: The table populates the invoice, and the green **"Collected (MTD)"** tile at the top instantly jumps to `$48,000.00`!
6. **Verification 2**: Log out, log in as `admin@test.com`, and manually navigate to `http://localhost:5173/reports` (Reporting Portal). You will see the Executive Dashboard successfully aggregated the data across the `finance-service` and `inventory-service`, displaying `$48,000` in Gross Revenue and `1` Unit Sold.

---

### Congratulations!
If you completed these 6 steps successfully, you have verified the end-to-end integrity of the entire AutoConnect microservices architecture, API Gateway, JWT security, and React frontend ecosystem. 

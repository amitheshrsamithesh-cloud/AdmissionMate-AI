# AdmissionMate AI – AI-Powered Admission Readiness Assistant
**PayPal Opportunity Hackathon Submission**

AdmissionMate AI is an intelligent student admission management and readiness platform that transforms the fragmented, anxiety-inducing college application journey into a structured, confident, and streamlined experience. 

By unifying **Gemini 3.8 Flash AI** (for document classification, OCR verification, and conversational counseling) with the **PayPal Sandbox checkout ecosystem** (for application processing fee settlements, idempotency enforcement, and verified receipt generation), AdmissionMate AI bridges the gap between academic preparation and college fee clearance.

---

## 1. Project Overview

Applying to competitive universities (such as Stanford, MIT, Carnegie Mellon, Harvard, and UC Berkeley) requires tracking multiple deadlines, uploading and verifying disparate board marksheets, managing letters of recommendation, and paying individual university application fees.

**AdmissionMate AI** serves as an intelligent admissions co-pilot for high school students and university applicants. It provides:
1. **Interactive PayPal Application Fee Payments:** Seamless college fee settlement with server-authoritative order creation, duplicate capture prevention, and official printable receipts.
2. **AI-Powered Admission Counselor:** Context-aware admissions guidance leveraging Gemini 3.8 Flash, informed by the student's live academic profile, verified documents, and payment records.
3. **Smart Document Vault with Duplicate Detection:** Support for PDF, PNG, and JPG uploads, featuring browser and server-side SHA-256 cryptographic hashing to block duplicate documents.
4. **Transparent Admission Readiness Score (0–100):** A multi-factor index evaluating required document fulfillment (40%), academic prerequisites (30%), application milestones (15%), and fee settlement status (15%).
5. **OCR Verification Center:** Automated extraction and validation of academic transcripts, roll numbers, board seals, and certificate credentials.

---

## 2. Problem Statement

1. **Fragmented Fee Payments:** Students applying to multiple institutions must navigate varied, outdated payment portals, risking missed deadlines, failed transactions, and duplicate charges.
2. **Application Blind Spots:** Students frequently submit incomplete applications without realizing that a required document (e.g., academic recommendation letter or board marksheet) is missing or unverified.
3. **Duplicate Submission Chaos:** Accidental re-upload of identical or outdated files leads to applicant confusion and administrative delays.
4. **Lack of Transparent Readiness Tracking:** Students lack a clear, quantifiable metric showing whether their profile and fee clearance satisfy university criteria.

---

## 3. Proposed Solution

AdmissionMate AI offers a single, cohesive command center where:
- **Application Fees are unified with PayPal:** Students select their target university (e.g., Stanford $90, MIT $75, Carnegie Mellon $85, Harvard $85, UC Berkeley $80) and complete the transaction via official PayPal Sandbox buttons or test flows.
- **Transactions are Persisted and Protected:** Orders and captures are verified through server-side REST calls. Duplicate captures on the same Order ID are strictly blocked.
- **Documents are Cryptographically Hashed:** Each uploaded file generates an instant SHA-256 hash. Re-uploads of identical files are immediately flagged and blocked.
- **Admissions Readiness is Quantified:** Students see a dynamic 0–100 score with an itemized breakdown and actionable next steps.
- **AI Guidance is Context-Aware:** The AI counselor dynamically inspects the applicant's live profile, uploaded documents, missing requirements, and fee payment status.

---

## 4. Key AI Features (Gemini 3.8 Flash)

- **Dynamic Admissions Counseling:** Answers student questions about target colleges, eligibility cutoffs, essay suggestions, and financial aid opportunities.
- **Intelligent Document OCR Extraction:** Extracts student name, registration number, roll number, issuing board/authority, marks/grades, and dates from uploaded PDF/image files.
- **Contextual Requirement Analysis:** Cross-references the applicant's verified vault against university-specific prerequisites and identifies missing requirements.
- **Honest & Ethical Verification Policy:** The system clearly distinguishes between "AI Parsed & System Validated" credentials and formal institutional certification by admissions desks.

---

## 5. PayPal Sandbox Integration Architecture

AdmissionMate AI implements official PayPal REST APIs (`v2/checkout/orders` and `v2/checkout/orders/{id}/capture`):

```
+--------------------------------------------------------------------------------+
|                                FRONTEND (React)                                |
|  - PayPalScriptProvider & PayPalButtons (@paypal/react-paypal-js)              |
|  - University Fee Selector ($75 - $90 USD)                                     |
|  - Instant Sandbox Test Mode for Evaluators                                    |
|  - Printable Official Receipt Modal                                            |
+------------------------+-------------------------------+-----------------------+
                         |                               ^
                         | POST /api/paypal/create-order | Capture Result
                         v                               |
+--------------------------------------------------------------------------------+
|                             BACKEND (Express.js)                               |
|  - Route: POST /api/paypal/create-order                                        |
|  - Route: POST /api/paypal/capture-order                                       |
|  - Route: GET  /api/paypal/payments                                            |
|  - Route: POST /api/paypal/webhook                                             |
|  - Duplicate Capture Check (Idempotency Ledger)                                |
|  - Persistent JSON Database Store (/data/store.json)                           |
+------------------------+-------------------------------+-----------------------+
                         |                               ^
                         | OAuth Basic Auth & Orders v2  | Access Token & Capture
                         v                               |
+--------------------------------------------------------------------------------+
|                        OFFICIAL PAYPAL SANDBOX API                             |
|  - https://api-m.sandbox.paypal.com/v1/oauth2/token                            |
|  - https://api-m.sandbox.paypal.com/v2/checkout/orders                         |
|  - https://api-m.sandbox.paypal.com/v2/checkout/orders/{id}/capture            |
+--------------------------------------------------------------------------------+
```

### Security & Integrity Standards:
1. **Zero Client Secret Exposure:** `PAYPAL_CLIENT_SECRET` is kept strictly within backend environment variables. The client only receives the public `PAYPAL_CLIENT_ID`.
2. **Duplicate Capture Prevention:** Every order ID is checked against `capturedOrderIds` prior to execution. Duplicate capture requests return the existing receipt without duplicate charges.
3. **Real Server-Side Verification:** Captures are authorized and verified on the server side; simulated fabrications are prohibited.
4. **Sandbox Transparency:** Clear visual banners inform the user that all transactions operate in the PayPal Sandbox test environment.

---

## 6. Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, `@paypal/react-paypal-js`.
- **Backend:** Node.js, Express.js, TypeScript (`tsx`).
- **AI Engine:** Google `@google/genai` TypeScript SDK (Model: `gemini-3.8-flash`).
- **Cryptography:** Web Crypto API (`crypto.subtle.digest`) and Node.js `crypto` for SHA-256 hashing.
- **Database & Persistence:** File-backed persistent database (`data/store.json`) with atomic synchronization.

---

## 7. Setup & Installation

### Prerequisites
- Node.js 18+ or 20+
- npm or bun

### Step 1: Clone or Extract Project
```bash
cd admissionmate-ai
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Set your credentials in `.env`:
```env
# Gemini API Key (injected automatically in Google AI Studio)
GEMINI_API_KEY="your-gemini-api-key"

# PayPal Sandbox Credentials
PAYPAL_CLIENT_ID="your-paypal-sandbox-client-id"
PAYPAL_CLIENT_SECRET="your-paypal-sandbox-client-secret"
PAYPAL_API_URL="https://api-m.sandbox.paypal.com"
PAYPAL_CURRENCY="USD"
```

### Step 3: Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### Step 4: Production Build
```bash
npm run build
npm start
```

---

## 8. PayPal Sandbox Testing Instructions

AdmissionMate AI strictly integrates with the official PayPal Sandbox REST API. Simulated fake payment success has been completely removed to adhere to financial integrity requirements.

### Testing Step-by-Step with Real PayPal Sandbox:

1. **Obtain Sandbox Credentials:**
   - Go to [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox).
   - Under **REST API apps**, create an application (or select default).
   - Copy the **Client ID** and **Secret**.

2. **Configure Environment Variables:**
   - In `.env`, configure:
     ```env
     PAYPAL_CLIENT_ID="your_sandbox_client_id"
     PAYPAL_CLIENT_SECRET="your_sandbox_client_secret"
     PAYPAL_API_URL="https://api-m.sandbox.paypal.com"
     PAYPAL_CURRENCY="USD"
     ```

3. **Get Sandbox Buyer Test Account:**
   - In [PayPal Sandbox Accounts](https://developer.paypal.com/dashboard/accounts), locate a **Personal (Buyer)** test account.
   - Note the email (e.g., `sb-xxxx@personal.example.com`) and test password.

4. **Execute Sandbox Checkout:**
   - Open AdmissionMate AI and navigate to **Application Fees (PayPal)** in the sidebar.
   - Select an unpaid target university (e.g., **Stanford University - $90.00 USD**).
   - Click the yellow **PayPal** button.
   - In the PayPal popup, log in with your Sandbox Buyer account and approve the payment.
   - The backend server calls `POST /v2/checkout/orders/{id}/capture` on PayPal Sandbox, verifies the real capture ID, validates the exact fee amount against trusted server records, and permanently records the transaction.
   - View or print the verified **Official Admission Fee Receipt**.

5. **Verify Duplicate Prevention:**
   - Notice that once captured, the college fee is marked **Paid** and duplicate captures for the same order are strictly blocked by the server's idempotency check.

---

## 9. Demo Workflow for Judges

1. **Dashboard Overview:** Inspect the **Admission Readiness Score (78%)**, academic stats (GPA 3.92, SAT 1540), and the application fee tracker.
2. **Smart Document Vault:** 
   - Upload a document file (PDF/JPG/PNG).
   - Observe the instant **SHA-256 hash** generation.
   - Attempt to upload the same file again: verify that **Duplicate Detection** blocks the file and displays the existing matching record.
3. **College Requirements Registry:**
   - Select **Stanford University**.
   - Notice that the **$90 Application Fee** is flagged as unpaid, with a direct **"Pay $90 via PayPal"** button.
4. **PayPal Sandbox Checkout:**
   - Click **Pay $90 via PayPal** to navigate to the payment center.
   - Complete payment via the PayPal Sandbox checkout.
   - Review the verified **Capture ID**, **Order ID**, and printable **Official Admission Fee Receipt**.
5. **Admission Readiness Boost:**
   - Return to the Dashboard: notice that the fee points increase the readiness score.
6. **Gemini AI Counselor:**
   - Ask: *"What documents are missing for Stanford?"*
   - Ask: *"How do I pay college application fees with PayPal?"*
   - Notice how the assistant uses your actual live profile and PayPal payment history in its answers.

---

## 10. Known Limitations & Roadmap

- **University Portal API Direct Hook:** Real university admissions systems (Common App / Coalition App) currently require manual verification uploads; AdmissionMate AI provides an institutional-ready API schema for future direct SIS/CRM integration.
- **Multi-Currency FX Settlement:** Currently standardizes on USD for North American university applications; future versions will support real-time PayPal multi-currency conversions (EUR, GBP, INR, CAD).
- **Automated Government Authority Verification:** True official verification requires sovereign API access (e.g., DigiLocker in India, National Student Clearinghouse in the US); currently, document parsing is labeled as "AI Validated" to maintain transparency.

---

## 11. Hackathon Submission Summary

| Requirement | Implementation Detail |
|---|---|
| **PayPal Sandbox Checkout** | Official `@paypal/react-paypal-js` button and backend REST API |
| **Order Creation** | Backend `POST /api/paypal/create-order` via PayPal v2 API |
| **Order Capture** | Backend `POST /api/paypal/capture-order` with capture ID verification |
| **Duplicate Prevention** | In-memory and file-persisted `capturedOrderIds` idempotency ledger |
| **Receipt Generation** | Official print-ready invoice with Order ID, Capture ID, and University Seal |
| **Gemini AI Assistant** | Gemini 3.8 Flash model with dynamic live context from DB |
| **Smart Vault Hashing** | Browser & server SHA-256 hashing with duplicate file blocking |
| **Persistent Storage** | File-backed atomic JSON store (`data/store.json`) across all data entities |

**Built for the PayPal Opportunity Hackathon 2026**

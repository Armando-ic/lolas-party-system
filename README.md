![Lola's Party System](public/images/logo.png)

# Lola's Party System

**A full-stack party rental platform built for a real client in Woodbridge, VA**

[View Live Site](https://lolas-party-system.web.app)

![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Hosting%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?logo=stripe&logoColor=white)
![Google Cloud](https://img.shields.io/badge/Google%20Cloud-Functions-4285F4?logo=google-cloud&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-CDN-06B6D4?logo=tailwindcss&logoColor=white)

---

## About

Lola's Party System is a production party rental web application built for Ms. Cortes, a small business owner in Woodbridge, VA, as part of the IT-493 Senior Capstone course at George Mason University (Spring 2026). Customers browse party rental services — including soft play packages, tablescapes, mini bouncers, and custom party favors — then book online through a 5-step inquiry wizard and pay securely via Stripe. The business owner manages all bookings, generates deposit and final payment links, and tracks orders from a full-featured admin dashboard. Behind the scenes, the system automates email confirmations, balance reminders 14 days before events, post-event thank-you emails, and real-time accounting ledger synchronization via Google Sheets.

---

## Features

- **5-Step Booking Wizard** — Customers select packages, enter event details, choose venue type, and submit inquiries with real-time conflict detection
- **Party Favors E-Commerce** — Browse party favor products with photo lightbox, add to cart, customize per item (child name, theme, colors), and checkout via Stripe
- **Stripe Payment Integration** — Supports deposit-first and full-payment flows, with automated final balance links sent 14 days before events
- **Admin Dashboard** — Full order management with status filters, payment link generation, manual order creation, inventory toggling, and gallery management
- **Photo Gallery** — Firestore-backed masonry grid with category tabs, lightbox viewer, and admin upload/delete controls
- **Automated Email System** — Confirmation emails, deposit receipts, balance reminders, rejection notices, monthly check-ins, and post-event thank-you/review requests
- **Distance-Based Delivery Pricing** — Google Maps Distance Matrix API calculates delivery fees based on distance from Woodbridge, VA (free within 30 miles, $1.25/mile beyond)
- **Automated Cron Jobs** — Cloud Scheduler runs hourly to auto-send balance reminders, auto-complete past orders with ledger sync, send monthly check-in emails, and run daily backups

---

## Architecture

The platform follows a serverless architecture on Google Cloud. Firebase Hosting serves static frontend pages, which communicate with Python Cloud Functions (Gen2) via REST APIs. Cloud Firestore stores all application data, while external services handle payments (Stripe), email (Gmail SMTP), accounting (Google Sheets), and delivery pricing (Google Maps).

<details>
<summary><strong>Customer Booking Engine</strong></summary>

```mermaid
graph TD
    Home[index.html] --> Services[Services Page]
    Services -->|Soft Play| SP_Page[softplaypackages.html]
    Services -->|Table Spaces| TS_Page[tablespaces.html]
    Services -->|Mini Bouncers| MB_Page[minibouncers.html]
    Services -->|Party Favors| PF_Page[partyfavors.html]
    Home --> Gallery[gallery.html]

    subgraph Softplay_Inquiry_Flow
        SP_Page -->|Click 'Inquire Here'| InquireForm[Inquiry Form: inquire.html]
        TS_Page -->|Click 'Inquire Here'| InquireForm
        MB_Page -->|Click 'Inquire Here'| InquireForm
        InquireForm -.->|Step 1-5 Wizard| SP_Details[Date, Time, Address, Venue Details, Delivery Notes, Packages w/ Child Name/Age/Theme/Notes, Contact, Extra Hours]
        SP_Details --> ConflictChk{Server-Side Conflict Check}
        ConflictChk -->|Conflict 409| ConflictBlock[Items Unavailable for Date]
        ConflictChk -->|No Conflict| SubmitInq[Submit Inquiry]
        SubmitInq -->|Backend Calculates +$30/hr| PendingDB[(Save as 'Pending Approval')]
        SubmitInq -->|Email| AdminAlert[Email Admin Full Brief & Quote]
    end

    subgraph Party_Favors_Flow
        PF_Page -->|Click 'Add to Cart'| Cart[Shopping Cart Sidebar]
        Cart -->|Proceed to Checkout| CustomForm[Customization Modal]
        CustomForm -.->|Validation| DateCheckPF{Pickup Date > 5 Days Away?}
        DateCheckPF -->|No| Block[Block Submission]
        DateCheckPF -->|Yes| PF_Details[Pickup Date, Theme, Color Palette, Primary Color, Vision, Contact]
        PF_Details --> RushCheck{Pickup Date < 14 Days Away?}
        RushCheck -->|Yes| AddRush[Auto-Apply $50 Rush Fee]
        RushCheck -->|No| StripeCheckout[Stripe Checkout]
        AddRush --> StripeCheckout
        StripeCheckout -->|Pay 100% Upfront| CustPayFavors[Customer Pays via Stripe]
        CustPayFavors --> WebhookPF[Webhook: 'ecommerce_pickup']
        WebhookPF -->|Idempotency Guard| PF_Success[(Auto-Save DB: 'Approved')]
        PF_Success --> PF_Receipt[System Emails Payment Receipt]
        PF_Receipt --> PickupOrder(((Ready for Local Pickup)))
    end
```

</details>

<details>
<summary><strong>Admin Control & Financial Engine</strong></summary>

```mermaid
graph TD
    PendingDB[(DB: 'Pending Approval')] --> AdminDash[Admin Dashboard]
    AdminDash -.->|All admin endpoints| AuthGuard[verify_admin: Firebase Auth Token Required]

    subgraph Review_&_Approval
        AdminDash -->|Manual Review| Decision{Approve or Deny?}
        Decision -->|Deny| RejectionModal[Admin Types Rejection Reason]
        RejectionModal -->|reject_order endpoint| DeniedEmail[System Emails Customer Rejection]
        DeniedEmail --> DB_Denied[(Update DB: 'Denied')]
        Decision -->|Approve| BillingChoice{Admin Adjusts Extra Hours & Selects Link Type}
        BillingChoice -->|Option A: $100 Deposit| Gen100Dep[Generate Deposit Link & Email Customer]
        BillingChoice -->|Option B: 100% Link| GenFull[Generate Full Payment Link & Email Customer]
    end

    subgraph Manual_Order_Creation
        AdminDash -->|Admin Clicks 'Create Order'| SelectType{Softplay or Favors?}
        SelectType --> Man_Input[Input Logistics, Extra Hours, Items & Custom Price]
        Man_Input --> ConflictCheck{Server-Side Inventory Conflict Check}
        ConflictCheck -->|Conflict Found| WarningModal[Show Double-Booking Warning]
        WarningModal -->|Cancel| Abort[Order Aborted]
        WarningModal -->|Force Override| ActionSelect
        ConflictCheck -->|No Conflicts| ActionSelect{Select Payment Action}
        ActionSelect -->|1. Send Deposit Link| Gen100Dep
        ActionSelect -->|2. Send Full Payment Link| GenFull
        ActionSelect -->|3. Paid Offline| OfflineDB[(Auto-Save: 'Approved' & 'Paid in Full')]
        OfflineDB --> OfflineEmail[System Emails Offline Receipt]
    end

    subgraph Stripe_Webhooks
        Gen100Dep --> CustAction100{Customer Pays Deposit}
        CustAction100 --> Webhook100Dep[Webhook: 'softplay_deposit']
        Webhook100Dep -->|Idempotency + Store deposit_paid| DB_100Dep[(DB: 'Approved' & 'Security Deposit Paid')]
        GenFull --> CustActionFull{Customer Pays Total}
        CustActionFull --> WebhookFull[Webhook: 'softplay_full']
        WebhookFull -->|Idempotency Guard| DB_Full[(DB: 'Approved' & 'Paid In Full')]
        DB_100Dep --> ReceiptEmailDep[System Emails Deposit Receipt]
        DB_Full --> ReceiptEmailFull[System Emails Payment Receipt]
        ReceiptEmailFull --> FullyBooked(((Date Fully Locked)))
        OfflineEmail --> FullyBooked
    end

    subgraph Final_Balance_Automation
        DB_100Dep -.->|14 Days Before Event| CronBalance[cron_check_balances]
        CronBalance --> CalcBalance[Remaining = total_price - deposit_paid from DB]
        CalcBalance --> GenFinalLink[Auto-Generate Stripe Final Balance Link]
        GenFinalLink --> DB_FinalSent[(DB: 'Final Balance Sent')]
        DB_FinalSent --> EmailFinalLink[Email Customer Final Balance Link]
        EmailFinalLink --> CustPaysFinal{Customer Pays Final Balance}
        CustPaysFinal --> WebhookFinal[Webhook: 'softplay_final_balance']
        WebhookFinal -->|Idempotency Guard| DB_PaidFull[(DB: 'Paid In Full')]
        DB_PaidFull --> ReceiptFinal[System Emails Final Payment Receipt]
        ReceiptFinal --> FullyBooked
    end
```

</details>

<details>
<summary><strong>Post-Event Autopilot</strong></summary>

```mermaid
graph TD
    HourlyCron[Cloud Scheduler Runs Every Hour] -->|verify_cron guard| ScanDB{Scan DB for 'Approved' Orders}
    ScanDB -->|Order Type: Favors| CheckFavorTime{Past 9AM day after pickup?}
    ScanDB -->|Order Type: Softplay| CheckSPTime{Past start + 3hrs + extra hours?}
    CheckFavorTime -->|Yes| MarkComplete[(Update DB: 'Completed')]
    CheckSPTime -->|Yes| MarkComplete

    MarkComplete --> SyncAction[Accounting Sync]
    MarkComplete --> ReviewAction[Marketing Automation]

    subgraph Ledger_Sync
        SyncAction --> PushSheets[Google Sheets API]
        PushSheets --> WriteRow[(Insert 16-Column Row into Master Ledger)]
        WriteRow --> TypeTab[(Insert into Type-Specific Tab: 'Party Favors' or 'Soft Play')]
        WriteRow -.->|Per-Order Error Isolation| SheetErr[If One Fails, Others Continue]
    end

    subgraph Review_Generator
        ReviewAction --> BuildEmail[Generate Thank You Email]
        BuildEmail --> SendEmail[Email Customer: Request Google/Yelp Review]
    end
```

</details>

<details>
<summary><strong>Order Lifecycle State Machine</strong></summary>

```mermaid
stateDiagram-v2
    direction TB

    state "Soft Play Rental Lifecycle" as SP {
        direction TB

        [*] --> PendingUnpaid
        state "Pending Approval / Unpaid" as PendingUnpaid

        PendingUnpaid --> Denied : Admin rejects (reject_order)
        state "Denied / Order Closed" as Denied
        Denied --> [*]

        PendingUnpaid --> PendingDeposit : Admin approves (generate_deposit_link)
        state "Pending Deposit / Unpaid — payment link emailed" as PendingDeposit

        PendingDeposit --> DepositPaid : Customer pays deposit (webhook softplay_deposit)
        state "Approved / Security Deposit Paid — deposit_paid stored" as DepositPaid

        DepositPaid --> FinalBalanceSent : 14 days before event (cron_check_balances) or admin sends manually
        state "Approved / Final Balance Sent — balance link emailed" as FinalBalanceSent

        FinalBalanceSent --> PaidInFull_SP : Customer pays balance (webhook softplay_final_balance)

        PendingDeposit --> PaidInFull_SP : Customer pays 100% upfront (webhook softplay_full)
        state "Approved / Paid in Full — date fully locked" as PaidInFull_SP

        PaidInFull_SP --> Completed_SP : Event date passes (cron_auto_complete_orders)
        state "Completed — ledger synced, thank-you email sent" as Completed_SP
        Completed_SP --> [*]
    }

    state "Party Favors E-Commerce Lifecycle" as EC {
        direction TB

        [*] --> StripeCheckout
        state "Stripe Checkout — 100% upfront (+$50 rush if < 14 days)" as StripeCheckout

        StripeCheckout --> ApprovedEC : Payment succeeds (webhook ecommerce_pickup)
        state "Approved / Paid in Full — receipt emailed" as ApprovedEC

        ApprovedEC --> CompletedEC : Day after pickup past 9 AM (cron_auto_complete_orders)
        state "Completed — ledger synced, thank-you email sent" as CompletedEC
        CompletedEC --> [*]
    }

    state "Admin-Created Order Lifecycle" as AO {
        direction TB

        [*] --> AdminChoice
        state "Admin Creates Order (admin_create_order)" as AdminChoice

        AdminChoice --> AO_PendingDeposit : action deposit or full — Stripe link generated
        state "Pending Deposit / Unpaid — follows Softplay paths above" as AO_PendingDeposit
        AO_PendingDeposit --> [*]

        AdminChoice --> AO_Offline : action offline — marked paid immediately
        state "Approved / Paid in Full — offline receipt emailed" as AO_Offline
        AO_Offline --> AO_Completed : Event date passes (cron_auto_complete_orders)
        state "Completed — ledger synced" as AO_Completed
        AO_Completed --> [*]
    }
```

</details>

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, Vanilla JavaScript, Tailwind CSS (CDN) |
| Backend | Python 3.11, Flask, Google Cloud Functions (Gen2) |
| Database | Google Cloud Firestore (NoSQL) |
| Payments | Stripe Checkout + Webhooks |
| Maps | Google Maps Distance Matrix API |
| Email | Gmail SMTP |
| Ledger | Google Sheets API (gspread) |
| Hosting | Firebase Hosting (multi-site: prod + test) |
| Storage | Google Cloud Storage |

---

## Team

| Name | GitHub | Role / Contributions |
|------|--------|---------------------|
| Armando | [@Armando-ic](https://github.com/Armando-ic) | Project Lead, Backend & DevOps, Cloud Architecture |
| Jerome | *TBD* | *TBD* |
| Rohan | *TBD* | *TBD* |
| Donia | *TBD* | *TBD* |
| Israel | *TBD* | *TBD* |
| Zaid | *TBD* | *TBD* |

*Built as part of IT-493-005 (Senior Capstone) at George Mason University, Spring 2026.*

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

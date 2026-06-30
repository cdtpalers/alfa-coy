Listed directory alfa
Listed directory src
Listed directory components
Listed directory pages
Listed directory lib
Listed directory utils
Listed directory public
Viewed package.json:1-37
Viewed README.md:1-17

Here is a clear and organized breakdown of your project's file structure, tailored to help you explain it during your presentation to your users.

---

### **Project Architecture Overview**
The application is built as a modern Single Page Web Application (SPA) leveraging **React** for the frontend, **Vite** as the fast build tool, and **Supabase** as the backend database service. It is designed to manage cadet/company rosters, academic records, fitness trackers, and administrative workflows.

---

### **1. Source Code Directory (`src/`)**
This is where the application logic, page views, styling, and reusable components live.

*   #### **[pages/](file:///Users/palerski/alfa/src/pages)**: Main views & routers
    *   [Home.jsx](file:///Users/palerski/alfa/src/pages/Home.jsx): The landing page containing a bulletin board, tickers, and quick updates.
    *   [AdminDashboard.jsx](file:///Users/palerski/alfa/src/pages/AdminDashboard.jsx) & [ExoPage.jsx](file:///Users/palerski/alfa/src/pages/ExoPage.jsx): Administrative panels for company command elements (like the Executive Officer) to manage statuses and permissions.
    *   [Calendar.jsx](file:///Users/palerski/alfa/src/pages/Calendar.jsx): Interactive visual scheduler displaying training schedules and milestones.
    *   [RosterPage.jsx](file:///Users/palerski/alfa/src/pages/RosterPage.jsx) & [CompanyStaff.jsx](file:///Users/palerski/alfa/src/pages/CompanyStaff.jsx): Member directory and leadership organization listings.
    *   [HonorCommittee.jsx](file:///Users/palerski/alfa/src/pages/HonorCommittee.jsx) & [CouncilPage.jsx](file:///Users/palerski/alfa/src/pages/CouncilPage.jsx): Dedicated spaces for cadet councils and honor boards.
    *   [SmartphoneRack.jsx](file:///Users/palerski/alfa/src/pages/SmartphoneRack.jsx): Inventory management dashboard specifically for tracking cadet smartphone check-ins/check-outs.
    *   [TacoCorner.jsx](file:///Users/palerski/alfa/src/pages/TacoCorner.jsx): A specialized utility page or cadet snack-bar/recreation coordination center.

*   #### **[components/](file:///Users/palerski/alfa/src/components)**: Reusable UI elements
    *   [AcademicDeficiencies.jsx](file:///Users/palerski/alfa/src/components/AcademicDeficiencies.jsx): Track lists of academic subjects needing attention/remediation.
    *   [PFTTracker.jsx](file:///Users/palerski/alfa/src/components/PFTTracker.jsx): Visual analytics dashboard for tracking Physical Fitness Test scores.
    *   [FinanceDashboard.jsx](file:///Users/palerski/alfa/src/components/FinanceDashboard.jsx): Visual helper for budgeting, dues, or payment distributions.
    *   [PrivilegeLeaveForm.jsx](file:///Users/palerski/alfa/src/components/PrivilegeLeaveForm.jsx): Request form for leaves of absence and privileges.
    *   [SideBar.jsx](file:///Users/palerski/alfa/src/components/SideBar.jsx): Core navigation dashboard layout.
    *   [AnnCard.jsx](file:///Users/palerski/alfa/src/components/AnnCard.jsx), [AnnouncementModal.jsx](file:///Users/palerski/alfa/src/components/AnnouncementModal.jsx), and [EventModal.jsx](file:///Users/palerski/alfa/src/components/EventModal.jsx): Layout containers for bulletin boards and calendars.
    *   [Ticker.jsx](file:///Users/palerski/alfa/src/components/Ticker.jsx) & [Toast.jsx](file:///Users/palerski/alfa/src/components/Toast.jsx): Micro-interaction utilities for active alerts and status notifications.

*   #### **[lib/](file:///Users/palerski/alfa/src/lib)**: Integrations
    *   [supabase.js](file:///Users/palerski/alfa/src/lib/supabase.js): Database connection setup to sync real-time application data securely.

*   #### **Core Styles & Startup**:
    *   [App.jsx](file:///Users/palerski/alfa/src/App.jsx) & [main.jsx](file:///Users/palerski/alfa/src/main.jsx): Root structure and router initialization.
    *   [index.css](file:///Users/palerski/alfa/src/index.css) & [App.css](file:///Users/palerski/alfa/src/App.css): Application-wide global styling, custom fonts, glassmorphism templates, and themes.

---

### **2. Public Assets (`public/`)**
Contains static files that are directly served to the client browser without going through Javascript build bundling.

*   **Rosters & Schedules (CSV/PDF)**: Initial seeding data files (such as `roster.csv`, `finance.csv`, and academic/fitness deficiency lists).
*   **Media Assets**: High-definition avatar mockups (e.g., `cocoy.webp`, `decierdo.webp`) for roster cards, along with logos and custom vector icon sheets (`icons.svg`).

---

### **3. Configuration Files**
*   [package.json](file:///Users/palerski/alfa/package.json): Defines app dependencies, including UI libraries (`recharts` for tracking graphs, `marked`/`easymde` for text editing, and `papaparse` for CSV parsing).
*   [vite.config.js](file:///Users/palerski/alfa/vite.config.js): Handles build rules and PWA caching configurations.
*   [.env.local](file:///Users/palerski/alfa/.env.local): Environment variables containing local development credentials.
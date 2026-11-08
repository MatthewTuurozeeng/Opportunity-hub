# OpportunityHub

**opportunities. applications. progress.**

Matthew's OpportunityHub is a private, responsive web application designed to help  organize, manage and track opportunity applications throughout entire lifecycle.

The platform provides a centralized workspace for managing opportunities, recording application details, organizing documents, tracking application progress, maintaining communication records, scheduling important events and evaluating application outcomes.

It is designed to replace scattered spreadsheets, folders, emails and personal notes with one organized and accessible application management system.

---

# 1. Project Overview

## 1.1 Background

Applying for scholarships, internships, jobs, fellowships, grants and other opportunities often involves managing several applications simultaneously.

Each application may require different documents, submission deadlines, application procedures, interviews, assessments and follow-up communications.

Without a centralized management system, important information can become scattered across email accounts, local folders, spreadsheets and external application portals.

OpportunityHub addresses this problem by providing a single platform where user(s) can manage the complete application process, from recording an opportunity to submitting an application and documenting its final outcome.

## 1.2 Project Vision

To build a reliable, intuitive and secure personal application management platform that makes managing multiple opportunities easier, more organized and measurable.

## 1.3 Project Objectives

The primary objectives are to:

1. Centralize information about opportunities and their associated applications.
2. Provide an organized document library for storing and retrieving application materials.
3. Track application statuses and maintain a history of status changes.
4. Record important dates, deadlines, interviews, assessments and follow-up activities.
5. Maintain records of application-related communications.
6. Provide meaningful dashboard statistics and application performance insights.
7. Offer a responsive experience across desktop and mobile devices.
8. Protect personal information and provide reliable data export and backup options.

## 1.4 Target User

The platform belongs to one individual: the owner. The owner can invite other people to create their own accounts; each account is completely private, and accounts never share data.

It is not intended to be a multi-user collaboration system or a public opportunity-discovery platform.

The application prioritizes personal productivity, privacy, usability and simplicity.

---

# 2. Core Features and Functional Modules

## 2.1 Dashboard

The dashboard provides a high-level overview of all recorded applications.

**Key elements:**
- Total submitted applications.
- Applications currently in progress.
- Successful applications.
- Unsuccessful applications.
- Upcoming interviews and assessments.
- Upcoming application deadlines.
- Recently updated applications.
- Recent activities.
- Application success rate.

**Dashboard design considerations:**
- Prioritize important information above the fold.
- Use compact statistic cards with clear labels.
- Include a small number of meaningful charts.
- Display upcoming events in an easily scannable section.
- Provide quick actions such as Add Application and Upload Document.
- Avoid overcrowding the dashboard with unnecessary statistics.

Draft opportunities should not be counted as submitted applications. Applications awaiting responses should not be treated as unsuccessful.

## 2.2 Opportunity and Application Management

This is the central module of the application.

Users should be able to create, view, edit, search, filter and delete opportunity and application records.

**Opportunity information:**
- Opportunity title.
- Organization or institution.
- Opportunity category.
- Location.
- Opportunity description.
- Opportunity website or application link.
- Source of the opportunity.
- Application deadline.
- Date added.

**Application information:**
- Associated opportunity.
- Current application status.
- Date submitted.
- Application method.
- Application reference number.
- Personal notes.
- Date created and last updated.

**Supported opportunity categories:**
- Scholarships.
- Internships.
- Employment.
- Fellowships.
- Grants and funding.
- Conferences and programmes.
- Competitions.
- Other opportunities.

**Core capabilities:**
- Add new opportunities.
- Save opportunities as drafts before applying.
- Record submitted applications.
- Edit application details.
- Search by opportunity, organization or keyword.
- Filter by category, status and date.
- Sort by submission date, deadline or last updated.
- View complete application details.
- Delete records with confirmation.

## 2.3 Application Status Tracking

Each application should have a clearly defined status representing its current stage.

| Status | Description |
|---|---|
| Draft | Opportunity recorded but application not submitted. |
| Submitted | Application successfully submitted. |
| Under Review | Application is being reviewed. |
| Shortlisted | Applicant has been shortlisted. |
| Interview | Interview stage reached. |
| Assessment | Additional assessment or evaluation required. |
| Successful | Application resulted in a positive outcome. |
| Unsuccessful | Application was rejected. |
| Withdrawn | Application voluntarily withdrawn. |
| No Response | No final response recorded. |

Every status change should be recorded in a status history containing:
- Previous status.
- New status.
- Date and time of change.
- Optional notes.

This allows users to understand the progression of each application rather than seeing only its current status.

## 2.4 Document Management

The platform should provide both a centralized document library and the ability to associate documents with individual applications.

**Document categories:**
- Curriculum Vitae.
- Cover Letters.
- Academic Transcripts.
- Recommendation Letters.
- Certificates.
- Personal Statements.
- Essays and Writing Samples.
- Identification Documents.
- Application Forms.
- Other Documents.

**Core capabilities:**
- Upload documents.
- View all uploaded documents in one library.
- Categorize documents.
- Search and filter documents.
- Associate documents with applications.
- Associate one document with multiple applications.
- Download documents.
- View document details.
- Maintain document versions.
- Add descriptions and notes.

**Important design decision:**

The document library must be independent of individual applications.

For example, a user may upload one general CV and associate it with several applications. If a CV is revised, the new version should be stored separately rather than silently replacing the version previously submitted.

The system should retain the document's name, category, file type, file size, upload date, version and storage location.

## 2.5 Communication Management

This module records communications related to individual applications.

It should initially support manual recording rather than requiring direct email integration.

**Communication information:**
- Associated application.
- Communication subject.
- Communication type.
- Direction: Received or Sent.
- Sender.
- Recipient.
- Date and time.
- Message summary.
- Optional message content.
- External email or message link.
- Optional attachment.

**Communication types:**
- Application confirmation.
- Interview invitation.
- Follow-up email.
- Assessment notification.
- Acceptance notification.
- Rejection notification.
- General inquiry.
- Other communication.

Users should be able to view communication records from both the main communication module and the associated application's detail page.

## 2.6 Calendar and Timeline

The platform should provide a calendar and chronological activity timeline.

**Supported events:**
- Application deadlines.
- Submission dates.
- Shortlisting notifications.
- Interview invitations.
- Interviews.
- Assessments.
- Follow-up reminders.
- Acceptance notifications.
- Rejection notifications.
- Other important events.

Users should be able to create, edit and delete events, associate them with applications, view upcoming events, navigate between calendar months and view activities chronologically.

The calendar should make important dates easy to identify without overwhelming the interface.

## 2.7 Analytics and Insights

The analytics module should provide meaningful insights into application activity and outcomes.

**Suggested metrics:**
- Total applications submitted.
- Successful applications.
- Unsuccessful applications.
- Applications still pending.
- Interview invitation rate.
- Application success rate.
- Applications by category.
- Applications by year.
- Application outcomes over time.

**Calculated rates:**

| Metric | Formula |
|---|---|
| Success Rate | Successful Applications / Decided Applications × 100 |
| Interview Rate | Applications Reaching Interview Stage / Submitted Applications × 100 |

Pending applications should not be classified as unsuccessful.

The analytics module should use clear charts and simple visual explanations rather than presenting excessive statistical information.

## 2.8 Notes and Reflections

This module provides a place to record personal observations and lessons from the application process.

Examples include:
- Interview preparation notes.
- Questions asked during interviews.
- Personal interview reflections.
- Feedback received.
- Strengths demonstrated.
- Areas requiring improvement.
- Lessons learned.
- Follow-up considerations.

Notes should be associable with specific applications.

## 2.9 Settings and Data Management

The settings module should support:
- Personal profile information.
- Application categories.
- Document categories.
- Account settings.
- Password management.
- Data export.
- Backup options.
- Sign out.

Users should be able to export application records in CSV format.

---

# 3. Application Navigation and Page Structure

The interface should use a consistent navigation structure.

## Main Navigation

| Navigation Item | Purpose |
|---|---|
| Dashboard | Overview and important statistics. |
| Applications | Manage all opportunities and applications. |
| Document Library | Manage reusable and application-specific documents. |
| Communications | Record sent and received communications. |
| Calendar & Timeline | View important dates and activities. |
| Analytics | Review application performance. |
| Notes & Reflections | Store personal application notes. |
| Settings | Manage preferences and data. |

A prominent **Add Application** action should be accessible from the main navigation and relevant application pages.

## Suggested Application Routes

| Route | Page |
|---|---|
| `/login` | Login |
| `/dashboard` | Dashboard |
| `/applications` | Applications list |
| `/applications/new` | Add application |
| `/applications/:id` | Application details |
| `/applications/:id/edit` | Edit application |
| `/documents` | Document Library |
| `/communication` | Communications |
| `/calendar` | Calendar & Timeline |
| `/analytics` | Analytics |
| `/notes` | Notes & Reflections |
| `/settings` | Settings |

## Application Detail Page

Each application should have a dedicated detail page with five sections:

1. Overview
2. Timeline
3. Documents
4. Communication
5. Notes

This keeps related information together and reduces unnecessary navigation.

---

# 4. User Interface and Visual Design System

The interface should communicate professionalism, clarity, reliability and approachability.

The design should feel like a carefully designed productivity application rather than a generic dashboard template.

## 4.1 Design Direction

The visual direction should be:

- Clean and minimal.
- Bright and naturally colored.
- Professional without being overly corporate.
- Warm and approachable.
- Consistent across all pages.
- Focused on readability and usability.
- Spacious without wasting screen space.

Avoid excessive gradients, glassmorphism, unnecessary shadows, decorative illustrations and excessive rounded cards.

Use solid colors, subtle borders, restrained shadows and consistent spacing.

## 4.2 Color Palette

The primary visual identity is based on a deep midnight navy with cool neutrals and a golden accent.

| Color | Hex Code | Usage |
|---|---|---|
| Midnight Navy | `#0F1B2D` | Primary brand color, primary actions, headings and focus rings. |
| Navy Hover | `#1E2F4D` | Hover states for primary actions. |
| Soft Sky | `#E8EEF8` | Selected states, active navigation and subtle highlights. |
| Cloud White | `#F6F8FB` | Main application background. |
| Pure White | `#FFFFFF` | Cards, panels, forms and modal backgrounds. |
| Ink | `#1A2436` | Main body text. |
| Slate Grey | `#5E6B80` | Secondary text and metadata. |
| Border Mist | `#E2E7EF` | Dividers and component borders. |
| Golden Yellow | `#E6B653` | Brand accent, deadline warnings and attention indicators. |
| Success Green | `#1F7A4D` | Successful outcomes only. |

**Navigation icon colors:** each main navigation item has its own bright icon on a tinted chip (blue, violet, amber, cyan, rose, emerald, orange and slate) so sections are easy to recognize at a glance.

**Color usage guidelines:**
- Midnight navy is the primary interactive color and the heading color.
- Cloud white provides a calm background; white is used for content surfaces.
- Body text uses ink, and secondary text uses slate grey (both meet WCAG AA contrast).
- Golden yellow communicates deadlines and warnings.
- Green is reserved for successful outcomes, and red for destructive actions and errors.

Do not use every accent color on every screen.

## 4.3 Application Status Colors

| Status | Suggested Color |
|---|---|
| Draft | Neutral grey |
| Submitted | Blue |
| Under Review | Soft blue |
| Shortlisted | Green |
| Interview | Purple |
| Assessment | Amber |
| Successful | Success green |
| Unsuccessful | Muted red |
| Withdrawn | Grey |
| No Response | Muted orange |

Use accessible text and labels alongside colors. Never communicate application status using color alone.

## 4.4 Typography

**Inter** is the primary interface font.

| Font Weight | Usage |
|---|---|
| Inter Medium/Semibold | Page headings, card titles and important labels. |
| Inter Regular | Body text and descriptions. |

| Element | Suggested Size |
|---|---|
| Main page title | 24–28px |
| Section heading | 18–20px |
| Card title | 15–16px |
| Body text | 14–15px |
| Supporting text | 12–13px |
| Button text | 14px |

Avoid using too many font sizes or weights.

## 4.5 Layout and Component Arrangement

**Desktop layout:**
- Fixed or collapsible left sidebar.
- Main content area.
- Consistent page header.
- Page-specific content sections.
- Responsive grids for dashboard cards.
- Clearly separated content panels.

**Mobile layout:**
- Compact top navigation or accessible navigation drawer.
- Full-width content.
- Single-column layouts where appropriate.
- Touch-friendly buttons and controls.
- Tables adapted into cards or horizontally scrollable layouts.
- Forms optimized for smaller screens.

## 4.6 Dashboard Arrangement

The dashboard should follow this general hierarchy:

1. Page heading and short welcome message.
2. Primary Add Application action.
3. Application statistics.
4. Application activity and progress visualization.
5. Upcoming deadlines and interviews.
6. Recently updated applications.

The most important information should be visible without excessive scrolling.

## 4.7 Component Design Guidelines

Use consistent reusable components.

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Dialog
│   ├── Badge
│   ├── Card
│   ├── Dropdown
│   └── Tooltip
│
├── layout/
│   ├── AppSidebar
│   ├── AppHeader
│   ├── MainLayout
│   └── MobileNavigation
│
└── shared/
    ├── PageHeader
    ├── EmptyState
    ├── ConfirmDialog
    ├── LoadingState
    └── SearchInput
```

Buttons, input fields, cards, tables, status badges and dialogs should maintain consistent styling across all modules.

---

# 5. Human-Computer Interaction and Usability Principles

The interface should be developed using established Human-Computer Interaction principles.

## 5.1 Visibility of System Status

The application should clearly communicate what is happening.

Examples:
- Display loading indicators during data retrieval.
- Show upload progress during document uploads.
- Confirm successful application creation.
- Display clear error messages.
- Show the current application status.
- Indicate when a record has been updated.

## 5.2 Consistency and Standards

Use consistent layouts, colors, buttons, labels, icons and interaction patterns.

For example, the Add Application button should look and behave consistently throughout the application.

## 5.3 Recognition Rather Than Recall

Users should not need to remember important information.

Examples:
- Display recently accessed applications.
- Provide searchable document lists.
- Use dropdowns for predefined categories.
- Display application histories.
- Show upcoming events on the dashboard.

## 5.4 Error Prevention

Prevent common user errors before they occur.

Examples:
- Validate required fields before submission.
- Confirm destructive actions.
- Validate uploaded file types and sizes.
- Warn users when navigating away from unsaved forms.
- Prevent duplicate records where appropriate.

## 5.5 User Control and Freedom

Users should be able to edit records, cancel actions, delete records with confirmation, update application statuses, correct previously entered information and navigate back to previous pages.

## 5.6 Accessibility

Follow WCAG 2.2 AA principles as the accessibility target.

Consider:
- Sufficient color contrast.
- Keyboard navigation.
- Visible focus indicators.
- Semantic HTML.
- Proper form labels.
- Accessible dialogs.
- Screen-reader-friendly controls.
- Meaningful icon labels.
- Responsive layouts.

## 5.7 Minimalist Design

Every interface element should serve a purpose.

Avoid unnecessary animations, decorative cards, excessive icons and information overload.

Prioritize information hierarchy and task completion.

---

# 6. Technology Stack

## Frontend

| Technology | Purpose |
|---|---|
| React | User interface development. |
| TypeScript | Type safety and maintainability. |
| Vite | Development environment and build tool. |
| Tailwind CSS | Utility-first styling. |
| shadcn/ui | Reusable accessible UI components. |
| Lucide React | Consistent interface icons. |
| React Router | Application navigation. |
| React Hook Form | Form management. |
| Zod | Form and data validation. |
| TanStack Query | Server-state management and data fetching. |
| Recharts | Dashboard and analytics charts. |
| Custom calendar components | Month and agenda views, built in-house for a smaller bundle, consistent styling and full keyboard support. |

## Backend and Database

| Technology | Purpose |
|---|---|
| Supabase | Backend-as-a-Service. |
| PostgreSQL | Relational database. |
| Supabase Auth | User authentication. |
| Supabase Storage | Document storage. |
| Row Level Security | Database access protection. |
| Supabase Edge Functions | Optional future server-side operations. |

## Deployment and Development

| Technology | Purpose |
|---|---|
| Git | Version control. |
| GitHub | Source code repository. |
| Vercel | Frontend hosting. |
| vite-plugin-pwa | Progressive Web App support. |
| Vitest | Unit testing. |
| React Testing Library | Component testing. |
| Playwright | End-to-end testing. |

## Why Supabase?

Supabase provides hosted PostgreSQL, authentication, file storage and database APIs without requiring a separate custom backend for the initial application.

The project will initially use the Supabase Free plan.

PostgreSQL itself is free and open source. The application should remain portable so that the database can be migrated to another PostgreSQL provider if necessary.

There is no requirement to introduce an Express.js backend in the initial version.

---

# 7. System Architecture

The project will follow a client-server separation while using Supabase as its managed backend.

```text
                  USER
                   |
          Desktop / Mobile Browser
                   |
                   v
          CLIENT APPLICATION
          React + TypeScript + Vite
                   |
          -----------------------
          |         |           |
          v         v           v
       Pages    Components    Hooks
          |         |           |
          -----------------------
                   |
            Feature Services
                   |
             Supabase Client
                   |
                   v
          SUPABASE BACKEND
          ---------------------
          |         |         |
          v         v         v
      PostgreSQL   Auth    Storage
          |         |         |
          ---------------------
                   |
             Row Level Security
                   |
             Protected Data
```

### Client Responsibilities

The client application is responsible for:
- Displaying the user interface.
- Managing navigation.
- Handling user interactions.
- Validating forms.
- Communicating with Supabase.
- Displaying records.
- Managing loading, error and empty states.
- Providing responsive desktop and mobile experiences.

### Server Responsibilities

The backend infrastructure is responsible for:
- User authentication.
- Relational data storage.
- Document storage.
- Database access control.
- Data integrity.
- Secure server-side operations when required.

Supabase provides these backend capabilities as a managed service.

### Document Upload Workflow

1. The user selects a document.
2. The frontend validates its file type and size.
3. The file is uploaded to a private Supabase Storage bucket.
4. The storage path is recorded in PostgreSQL.
5. The document appears in the central library.
6. The user can associate the document with one or more applications.
7. Authorized users retrieve documents through secure access mechanisms such as signed URLs.

The physical document should be stored in Supabase Storage, while its metadata and relationships should be stored in PostgreSQL.

---

# 8. Database Design

The database should use a relational model with clearly defined entities and relationships.

## Main Database Tables

The initial database will contain nine primary tables.

| Table | Responsibility |
|---|---|
| `profiles` | User profile information. |
| `categories` | Opportunity categories. |
| `opportunities` | Information about recorded opportunities. |
| `applications` | Individual application records and current statuses. |
| `documents` | Central document library and metadata. |
| `application_documents` | Associates documents with applications. |
| `application_events` | Deadlines, interviews and other activities. |
| `communications` | Sent and received communication records. |
| `application_status_history` | Historical application status changes. |

## Important Relationships

| Entity | Related Entity | Relationship |
|---|---|---|
| User | Opportunities | One-to-many |
| User | Applications | One-to-many |
| Category | Opportunities | One-to-many |
| Opportunity | Application | One-to-one (initial version) |
| Application | Events | One-to-many |
| Application | Communication records | One-to-many |
| Application | Status history entries | One-to-many |
| Application | Documents | Many-to-many |

The `application_documents` table provides the many-to-many relationship between applications and documents.

## Database Standards

- Use UUID primary keys.
- Use PostgreSQL foreign keys.
- Use appropriate unique constraints.
- Use `TIMESTAMPTZ` for date and time records.
- Use `created_at` and `updated_at` where appropriate.
- Add indexes for frequently queried columns.
- Use database triggers for reliable status history and update timestamps.
- Use cascading deletes only where appropriate.
- Enforce ownership relationships at the database level.

## Important Database Design Decisions

| Decision | Rationale |
|---|---|
| Separate opportunities from applications | An opportunity can be recorded before an application is submitted. This allows users to save opportunities and return to them later. |
| Use a separate events table | Do not store all interview and assessment dates directly in the applications table. An application may have several interviews or assessments. |
| Keep documents independent | Documents should exist in the central library regardless of whether they are currently associated with an application. |
| Preserve status history | Application status changes should be recorded automatically through database logic rather than relying exclusively on frontend code. |

---

# 9. Security and Privacy

Since the application stores personal information and potentially sensitive documents, security must be considered from the beginning.

## Security Requirements

1. Authentication must be required to access protected pages.
2. Enable Row Level Security on all user-owned database tables.
3. Ensure users can access only their own records.
4. Use a private Supabase Storage bucket.
5. Restrict document access through appropriate storage policies.
6. Validate uploaded file types and sizes.
7. Never expose the Supabase service-role key in frontend code.
8. Store public configuration in environment variables.
9. Use secure authentication and session handling.
10. Validate important operations at the database level.

## Environment Variables

Example client configuration:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_PUBLISHABLE_KEY=
```

Do not commit actual credentials to GitHub.

The Supabase service-role key must never be placed in frontend environment variables.

## Document Privacy

Documents should not be publicly accessible.

The application should use authenticated access and signed URLs where appropriate.

The initial version should not cache private documents or sensitive application records for offline use.

PWA installation support and full offline functionality are separate capabilities.

---

# 10. Project Folder Structure

The project should use a clear separation between the frontend and backend.

The root directory will contain two major folders:

| Folder | Contents |
|---|---|
| `client/` | All frontend application code. |
| `server/` | Backend-related configuration, database migrations and server-side functions. |

This structure improves organization, maintainability and future extensibility.

## Recommended Structure

```text
opportunity-hub/
│
├── client/
│   │
│   ├── public/
│   │   ├── icons/
│   │   ├── favicon.svg
│   │   └── manifest.webmanifest
│   │
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── fonts/
│   │   │
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── shared/
│   │   │
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── applications/
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── schemas/
│   │   │   │   ├── types/
│   │   │   │   └── pages/
│   │   │   │
│   │   │   ├── documents/
│   │   │   ├── communications/
│   │   │   ├── calendar/
│   │   │   ├── analytics/
│   │   │   ├── notes/
│   │   │   └── settings/
│   │   │
│   │   ├── hooks/
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   ├── queryClient.ts
│   │   │   └── utils.ts
│   │   │
│   │   ├── services/
│   │   │   └── storage.service.ts
│   │   │
│   │   ├── types/
│   │   │   ├── database.types.ts
│   │   │   └── common.types.ts
│   │   │
│   │   ├── routes/
│   │   │   └── AppRouter.tsx
│   │   │
│   │   ├── styles/
│   │   │   └── globals.css
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/
│   │
│   └── supabase/
│       ├── migrations/
│       ├── functions/
│       ├── seed.sql
│       └── config.toml
│
├── docs/
│   ├── architecture/
│   ├── database/
│   └── design/
│
├── .gitignore
├── README.md
└── package.json
```

### Folder Responsibilities

| Folder | Purpose | Contains |
|---|---|---|
| `client/` | Everything responsible for the frontend | React components, pages and routes, styling, frontend services, hooks, form validation, UI configuration and client-side application logic. |
| `server/` | Backend-related development resources | Supabase database migrations, database seed data, Supabase configuration and Supabase Edge Functions for future server-side operations. |
| `docs/` | Supporting technical documentation | Architecture diagrams, database diagrams, design system documentation and architectural decision records. |

The actual hosted PostgreSQL database, authentication and storage services run on Supabase, not inside the `server/` folder.

### Folder Organization Guidelines

- Keep components reusable and focused.
- Keep database queries out of presentation components.
- Use feature services and hooks to separate data operations from UI logic.
- Keep database migrations in `server/supabase/migrations/`.
- Keep frontend configuration in `client/`.
- Keep project-wide documentation in `docs/`.

---

# 11. Development Roadmap

Development should follow an incremental approach. Each phase should produce a working and testable part of the system.

## Phase 1: Project Foundation

- Create the GitHub repository.
- Create the `client/`, `server/` and `docs/` folders.
- Initialize React, TypeScript and Vite inside `client/`.
- Configure Tailwind CSS.
- Install and configure shadcn/ui.
- Establish the design system.
- Create the initial frontend folder structure.
- Create the Supabase project.
- Configure environment variables.
- Establish the application layout and routing.

**Expected outcome:** A working frontend foundation with consistent branding, navigation and reusable UI components.

## Phase 2: Database and Authentication

- Design and implement database migrations.
- Establish table relationships and constraints.
- Configure Row Level Security.
- Create the private document storage bucket.
- Implement authentication.
- Implement login and logout.
- Create protected routes.
- Generate TypeScript database types.

**Expected outcome:** A secure application foundation connected to Supabase.

## Phase 3: Opportunity and Application Management

- Create opportunity and application forms.
- Implement application listing.
- Implement application details.
- Implement editing and deletion.
- Implement search and filtering.
- Implement status management.
- Implement status history.

**Expected outcome:** Users can manage their complete opportunity and application records.

## Phase 4: Document Management

- Implement document uploads.
- Create the central document library.
- Implement document categorization.
- Implement document search.
- Associate documents with applications.
- Implement document versions.
- Implement secure downloads.

**Expected outcome:** Documents can be securely stored, organized and reused.

## Phase 5: Timeline and Status Tracking

- Implement application events.
- Add deadlines and interviews.
- Add assessments and follow-up events.
- Display application timelines.
- Implement chronological status history.

**Expected outcome:** Users can track important application activities.

## Phase 6: Communication Management

- Implement communication records.
- Support sent and received communications.
- Associate communications with applications.
- Add message summaries and optional content.
- Display communication history.

**Expected outcome:** Application-related communication is centralized.

## Phase 7: Dashboard and Analytics

- Implement dashboard metrics.
- Display recent applications.
- Display upcoming events.
- Implement application performance charts.
- Calculate success and interview rates.

**Expected outcome:** Users can understand their application activity and outcomes.

## Phase 8: Calendar and Notes

- Implement calendar views.
- Display application-related events.
- Implement personal notes.
- Associate notes with applications.

**Expected outcome:** The application provides additional productivity features.

## Phase 9: Testing and Security

- Test application CRUD operations.
- Test document uploads and downloads.
- Test application-document relationships.
- Test status history.
- Test communication records.
- Test authentication and RLS policies.
- Test responsive layouts.
- Test error handling and validation.

**Expected outcome:** A stable, secure and usable application.

## Phase 10: PWA and Deployment

- Configure PWA support.
- Create application icons.
- Configure the web manifest.
- Test installation on desktop and mobile.
- Deploy the frontend to Vercel.
- Configure production environment variables.
- Perform final production checks.

**Expected outcome:** A deployed application accessible through desktop and mobile browsers and installable as a PWA.

---

# 12. Testing Strategy

Testing should be incorporated throughout development rather than postponed until the end.

| Testing Type | Tool | What to Test |
|---|---|---|
| Unit Testing | Vitest | Utility functions, data calculations, application status logic, validation functions and analytics calculations. |
| Component Testing | React Testing Library | Forms, buttons, dialogs, application cards, search and filter components, and loading and empty states. |
| End-to-End Testing | Playwright | Complete user workflows (see examples below). |
| Security Testing | Manual and automated checks | Access control, data ownership and data validation (see checks below). |

### End-to-End Testing

Use Playwright to test complete user workflows.

Examples:
- User logs in.
- User creates an opportunity.
- User submits an application.
- User updates application status.
- User uploads a document.
- User associates a document with an application.
- User records an interview.
- User logs a communication.
- User views dashboard statistics.

### Security Testing

Verify that:
- Unauthenticated users cannot access protected pages.
- Users cannot retrieve another user's records.
- Users cannot access another user's documents.
- Storage policies enforce ownership.
- Invalid data is rejected.

---

# 13. Future Enhancements

The first version should focus on the core application management workflow.

| Version | Focus | Features |
|---|---|---|
| 1.0 | Core Application Management | Authentication, opportunity and application management, application status tracking, document library, communication records and dashboard. |
| 1.1 | Productivity Improvements | Calendar and timeline, notes and reflections, application reminders, enhanced analytics, CSV export and improved document management. |
| 2.0 | Intelligent Features | Gmail integration, AI-assisted document search, AI-assisted application preparation, reusable application materials, interview preparation assistance, and application insights and recommendations. |

AI features should be introduced only when they provide clear practical value. They should not complicate the initial architecture.

---

# 14. Development Standards and Best Practices

The project should follow professional software engineering conventions.

## Naming Conventions

| Element | Convention | Example |
|---|---|---|
| React components | PascalCase | `ApplicationCard.tsx` |
| Hooks | camelCase with `use` | `useApplications.ts` |
| Services | camelCase | `application.service.ts` |
| Types and interfaces | PascalCase | `Application.ts` |
| Constants | UPPER_SNAKE_CASE | `APPLICATION_STATUSES` |
| Database tables | snake_case | `application_events` |
| Functions | camelCase | `createApplication()` |

## General Standards

- Use TypeScript consistently.
- Avoid unnecessary use of `any`.
- Keep components focused and reusable.
- Separate business logic from presentation.
- Use centralized validation schemas.
- Handle loading, errors and empty states.
- Use database migrations for schema changes.
- Avoid duplicating business logic.
- Write meaningful Git commit messages.
- Document important architectural decisions.
- Use environment variables for configuration.
- Avoid unnecessary dependencies.

## Recommended Git Commit Style

```text
feat: add application management module
fix: resolve document upload validation
refactor: improve dashboard component structure
style: update application color system
test: add application form tests
docs: update project documentation
```

---

# 15. Project Success Criteria

The initial version will be considered successful when:

- The user can securely log in.
- Opportunities can be recorded and managed.
- Applications can be created and updated.
- Application statuses can be tracked.
- Status history is preserved.
- Documents can be uploaded and downloaded securely.
- A centralized document library is available.
- Documents can be associated with applications.
- Communications can be recorded.
- Interviews and assessments can be scheduled.
- The dashboard displays accurate statistics.
- Users can search and filter application records.
- The application works on desktop and mobile.
- Database security policies are verified.
- Application records can be exported.

---

# 16. Important Development Recommendations

The following principles should guide implementation from the beginning.

## 16.1 Establish a Consistent Design System Before Building Individual Modules

Do not start by independently designing the dashboard, applications page, document library and other screens.

First, define the application's visual language and reusable design tokens.

Establish:
- Primary and secondary colors.
- Typography scale.
- Spacing system.
- Border and radius conventions.
- Button styles.
- Form field styles.
- Card styles.
- Status badge styles.
- Responsive layout rules.

Implement these consistently using Tailwind CSS and reusable UI components.

This will ensure that every module feels like part of one professionally designed product.

## 16.2 Build the Application Layout Before Individual Features

Establish the overall application shell first.

Implement:
- Sidebar navigation.
- Application header.
- Main content container.
- Page header component.
- Responsive navigation.
- Consistent page spacing.
- Reusable buttons and form elements.

Get the navigation and layout right before building the individual functional modules.

## 16.3 Design and Implement the Database Before Connecting Feature Interfaces

Establish the database structure before building interfaces that depend on it.

The process should be:

1. Identify the entities and relationships.
2. Design the database schema.
3. Define primary and foreign keys.
4. Establish constraints and indexes.
5. Create database migrations.
6. Configure Row Level Security.
7. Implement database triggers where required.
8. Generate TypeScript database types.
9. Connect frontend services to the database.

This reduces structural changes and prevents the frontend from being built around an inconsistent data model.

## 16.4 Develop Incrementally

Do not attempt to build all modules simultaneously.

Complete one feature at a time using the following workflow:

1. Define the feature requirements.
2. Identify its database requirements.
3. Create or update the necessary database migration.
4. Define TypeScript types and validation schemas.
5. Implement service functions.
6. Create reusable UI components.
7. Connect the interface to the backend.
8. Implement loading, error and empty states.
9. Test the feature.
10. Commit the completed work to GitHub.

Each feature should be functional before moving to the next major feature.

## 16.5 Prioritize Security and Data Portability

Implement database ownership policies and private document storage from the beginning.

Keep migrations version-controlled, maintain periodic database exports and retain independent copies of important documents.

Do not design the application in a way that makes it unnecessarily dependent on a single hosting provider.

## 16.6 Prioritize Usability Over Visual Complexity

The application should look professional because of its information hierarchy, spacing, consistency, typography and thoughtful interactions.

Do not introduce unnecessary animations, excessive cards, gradients or decorative elements simply to make the interface look modern.

Every component should support a clear user task.

---

# 17. Project Information

| Item | Description |
|---|---|
| Project Name | Matthew's OpportunityHub |
| Repository Name | `opportunity-hub` |
| Project Type | Personal Application Management Platform |
| Architecture | Client-Server Separation with Supabase Backend |
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase |
| Database | PostgreSQL |
| Authentication | Supabase Auth |
| File Storage | Supabase Storage |
| Hosting | Vercel |
| Target Devices | Desktop and Mobile |
| Deployment Model | Progressive Web Application |
| Initial Infrastructure Budget | $0 target using free plans |
| Version | 1.0.0 |

---

# 18. Final Development Direction

OpportunityHub should be developed as a well-structured, secure and maintainable software product.

The priority is not to build every feature immediately. Instead, establish a strong foundation, implement the core application management workflow and expand the platform incrementally.

Every feature should be designed around a clear user need, implemented with appropriate software engineering practices and evaluated against usability, accessibility, security and maintainability requirements.

**The guiding principle: Build a platform that makes managing opportunities simpler, keeps important information organized and gives the user a clear understanding of their application journey.**
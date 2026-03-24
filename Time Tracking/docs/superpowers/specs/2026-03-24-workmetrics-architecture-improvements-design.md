---
name: workmetrics-architecture-improvements
description: Comprehensive architecture improvements for WorkMetrics based on Clockify reference
status: draft
created: 2026-03-24
owner: Erick
---

# WorkMetrics Architecture Improvements - Design Spec

## 1. Concept & Vision

Transform WorkMetrics from a basic time tracking MVP into a **full-featured enterprise time management platform** inspired by Clockify. The system should provide seamless time tracking, advanced reporting, team collaboration, and extensibility through integrations - all while maintaining clean architecture and developer experience.

**Core Philosophy:**
- Scale-adaptive: Works for freelancers, small teams, and enterprises
- Integration-first: API-first design enabling all features to be accessed programmatically
- Privacy-compliant: GDPR-ready with audit trails and data controls
- Cross-platform: Web, Mobile, Desktop, and Browser Extensions

---

## 2. Current State Analysis

### WorkMetrics Today
- **Backend:** NestJS + Prisma + PostgreSQL (MVP stage)
- **Frontend:** Next.js 14 + React 18 + Tailwind + Zustand
- **Auth:** JWT + Passport.js (basic)
- **Modules:** auth, users, projects, tasks, time-entries, teams, reports, invoices
- **Git:** Only 2 commits (early stage)

### Clockify Reference (Target)
- 8 feature categories: Integrations, Getting Started, Track Time, Reports, Projects, Administration, Apps, Troubleshooting
- Enterprise-grade: SSO, GDPR, SOC2, ISO compliance
- Multi-platform: Windows, Linux, Mac, iOS, Android, Browser extensions
- 100+ integrations

### Gaps Identified
1. No Calendar view for time entries
2. No scheduling features
3. No approval workflows
4. Reports are basic (no advanced filters/exports)
5. No time-off management
6. No robust role hierarchy (only ADMIN/MANAGER/USER)
7. No public API
8. No webhook system
9. No multi-platform support
10. No enterprise features (SSO, GDPR)

---

## 3. Feature Phases

### Phase 1: Core Time Tracking v2 (HIGH PRIORITY)
**Goal:** Enhance the core timer and timesheet experience

#### Features:
- **Calendar View**
  - Monthly/weekly/daily calendar display of time entries
  - Drag-and-drop editing
  - Color-coded by project/task
  - Integration with device calendar (optional)

- **Scheduling**
  - Schedule time entries in advance
  - Recurring time entries (daily, weekly, monthly)
  - Project deadline tracking

- **Approval Workflows**
  - Submit timesheets for approval
  - Manager approval/rejection
  - Comments on rejected entries
  - Approval history audit trail

- **Enhanced Auto-Tracker**
  - Activity level monitoring
  - App/website activity detection (with opt-in consent)
  - Idle detection and prompts
  - Privacy controls

#### Backend Changes:
```
new modules/
├── calendar/          # Calendar view service
├── scheduling/        # Scheduling and recurring entries
├── approvals/        # Time entry approvals
└── activity-tracker/  # Auto-tracking enhancements
```

#### Frontend Changes:
```
new pages/
├── /calendar          # Calendar view
├── /schedules         # Scheduled entries
└── /timesheet         # Enhanced timesheet with approvals

new components/
├── CalendarView.tsx
├── ScheduleEntry.tsx
├── ApprovalFlow.tsx
└── ActivityMonitor.tsx
```

---

### Phase 2: Reports & Analytics v2 (HIGH PRIORITY)
**Goal:** Transform reporting into a powerful decision-support tool

#### Features:
- **Advanced Filters**
  - Filter by user, project, task, date range, billable status
  - Custom filter combinations
  - Save filter presets

- **Report Types**
  - Time summary by project/task/user/team
  - Activity reports (who did what, when)
  - Attendance reports
  - Time-off reports
  - Billable vs non-billable analysis

- **Exports**
  - PDF (formatted reports)
  - CSV (raw data)
  - Excel (.xlsx with charts)
  - Scheduled report delivery via email

- **Dashboards**
  - Personal dashboard (my metrics)
  - Team dashboard (manager view)
  - Executive dashboard (aggregated company metrics)
  - Customizable widgets

#### Backend Changes:
```
new modules/
├── reports/           # Enhanced reports service
│   ├── summary-reports/
│   ├── activity-reports/
│   ├── attendance-reports/
│   └── exports/        # PDF, CSV, Excel generation
└── dashboards/        # Dashboard data aggregation
```

---

### Phase 3: Administration v2 (MEDIUM PRIORITY)
**Goal:** Robust team and organizational management

#### Features:
- **Time-Off Management**
  - Define time-off policies (PTO, sick, parental, etc.)
  - Request time off
  - Manager approval
  - Calendar integration for time-off
  - Accrual tracking
  - Carry-over rules

- **Billing & Invoicing Enhancements**
  - Multiple currency support
  - Per-project billing rates
  - Per-task billing rates
  - Expense tracking
  - Invoice templates
  - Invoice status tracking (draft, sent, paid)
  - Client portal for invoice review

- **Enhanced RBAC**
  - More granular roles:
    - `OWNER` - Full org access, billing, settings
    - `ADMIN` - User management, all projects
    - `MANAGER` - Team and project management
    - `MEMBER` - Basic time tracking
    - `CLIENT` - View-only access to assigned projects
  - Custom permission sets
  - Team-level permissions

- **Organization Settings**
  - Company profile
  - Default hourly rates
  - Work week configuration
  - Holiday calendar
  - Notification preferences

#### Backend Changes:
```
new modules/
├── time-off/          # Time-off policies and requests
├── billing/           # Enhanced invoicing
├── organizations/     # Org-level settings
└── permissions/       # Granular RBAC
```

---

### Phase 4: Integrations (MEDIUM PRIORITY)
**Goal:** Enable connectivity with external tools

#### Features:
- **Public REST API**
  - Full CRUD for all entities
  - GraphQL option
  - Rate limiting
  - API versioning (v1, v2)
  - OpenAPI/Swagger documentation
  - API keys per integration

- **Webhook System**
  - Event-driven webhooks
  - Events: time-entry.created, time-entry.updated, project.created, user.invited, etc.
  - Retry logic
  - Webhook signing for security

- **Native Integrations (Phase 4b)**
  - Slack (time tracking notifications, standup summaries)
  - Jira/Linear (link time entries to tasks)
  - Google Calendar (sync time-off)
  - QuickBooks/Xero (accounting sync)
  - Zapier/Make (no-code automation)

#### Backend Changes:
```
new modules/
├── api/               # Public API endpoints
│   ├── controllers/
│   ├── services/
│   └── guards/        # API key auth
├── webhooks/          # Webhook delivery system
└── integrations/      # Native integration connectors
```

---

### Phase 5: Multi-Platform (LOWER PRIORITY)
**Goal:** Access from anywhere

#### Features:
- **Mobile Apps**
  - iOS app (React Native or Swift)
  - Android app (React Native or Kotlin)
  - Offline-first with sync
  - Widgets for quick timer access

- **Desktop Apps**
  - Windows, Mac, Linux (Electron or Tauri)
  - System tray timer
  - Global hotkeys
  - Native notifications

- **Browser Extensions**
  - Chrome extension
  - Firefox extension
  - Edge extension
  - Quick timer in popup
  - Activity detection

---

### Phase 6: Enterprise Features (LOWER PRIORITY)
**Goal:** Meet enterprise security and compliance requirements

#### Features:
- **Single Sign-On (SSO)**
  - SAML 2.0
  - OAuth 2.0 / OpenID Connect
  - LDAP / Active Directory
  - Just-in-time provisioning

- **Security & Compliance**
  - SOC 2 Type II readiness
  - ISO 27001 alignment
  - GDPR compliance:
    - Data export (all user data)
    - Data deletion (right to be forgotten)
    - Consent management
    - Privacy-by-design
  - Audit logging (all admin actions)
  - IP allowlisting
  - Session management

- **Advanced Admin**
  - User provisioning/deprovisioning
  - Bulk user import (CSV)
  - Domain-based user auto-join
  - Data retention policies
  - Backup and export

#### Backend Changes:
```
new modules/
├── sso/               # SSO providers
├── audit/             # Audit logging
├── compliance/        # GDPR, SOC2 tools
└── provisioning/      # User provisioning
```

---

## 4. Implementation Priorities

### Iteration 1 (Current - MVP Enhancement)
1. **Calendar View** - Most impactful for UX
2. **Enhanced Reports** - Export, filters
3. **Improved RBAC** - Better permissions

### Iteration 2 (Feature Parity)
4. **Scheduling** - Recurring entries
5. **Approval Workflows** - Timesheet approvals
6. **Time-Off Management** - PTO requests

### Iteration 3 (Extensibility)
7. **Public API** - Enable integrations
8. **Webhooks** - Event system
9. **Native Integrations** - Slack, Jira

### Iteration 4 (Enterprise)
10. **SSO** - SAML/OIDC
11. **GDPR Tools** - Compliance
12. **Audit Logging** - Security

---

## 5. Technical Architecture Decisions

### Backend Architecture
- **Microservices-ready:** Module boundaries defined for future extraction
- **Event-driven:** Event emitter for webhooks and async operations
- **Repository pattern:** Clean data access layer
- **Service layer:** All business logic in services (not controllers)

### Frontend Architecture
- **Feature-based folders:** Organize by feature, not by type
- **Shared components library:** Reusable UI components
- **State management:** Zustand with proper slices
- **API client:** Centralized with React Query for caching

### Database
- **Soft deletes:** For audit trail
- **UUID primary keys:** Better distributed systems support
- **Indexes:** All foreign keys and common query fields
- **Migrations:** Version-controlled schema changes

---

## 6. API Design

### REST API Structure
```
/v1
├── /auth
│   ├── POST /login
│   ├── POST /register
│   └── POST /refresh
├── /users
├── /projects
├── /tasks
├── /time-entries
│   ├── GET /calendar
│   ├── POST /scheduled
│   └── POST /approve
├── /reports
│   ├── GET /summary
│   ├── GET /activity
│   └── GET /export
├── /time-off
├── /invoices
├── /teams
├── /organizations
└── /integrations
    ├── GET /api-keys
    ├── POST /webhooks
    └── GET /connected
```

---

## 7. Security Model

### Authentication
- JWT with short expiry (15 min) + refresh tokens
- API keys for integrations
- SSO for enterprise

### Authorization
- Permission-based (not just role-based)
- Row-level security for team data isolation
- Audit logging for sensitive operations

---

## 8. Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| Phase 1 | Calendar adoption | >70% daily active users |
| Phase 2 | Report exports | >10 exports/day |
| Phase 3 | Time-off requests processed | 100% with 48hr SLA |
| Phase 4 | API usage | >1000 calls/day |
| Phase 5 | Mobile installs | >500 |
| Phase 6 | Enterprise deals | >3 pilot customers |

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Scope creep | High | Strict phase gates, user validation per iteration |
| Performance degradation | Medium | Database indexes, query optimization, caching |
| Integration complexity | Medium | Start with simple webhooks, build up |
| Enterprise compliance | High | Engage security auditor early |

---

## 10. Next Steps

1. **SPEC APPROVAL** - Review and approve this design
2. **ITERATION 1 PLANNING** - Detailed task breakdown for Phase 1
3. **ARCHITECTURE SETUP** - Refactor current code to support new patterns
4. **PHASE 1 IMPLEMENTATION** - Start with Calendar View

---

*Document Status: DRAFT - Pending approval*

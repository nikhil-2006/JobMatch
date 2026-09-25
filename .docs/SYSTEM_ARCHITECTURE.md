# MVGR JobMatch - System Architecture Plan

## 1. Executive Summary

**MVGR JobMatch** is a dedicated campus job discovery and recruitment platform designed for **MVGR College of Engineering, Vizianagaram**. The platform bridges the gap between engineering students looking for flexible part-time/contract work and campus partners (hostel canteens, central library, printing/xerox stores, coding lab assistants, and local businesses).

The platform features role-tailored dashboards for **Students**, **Employers**, and **System Administrators**, powered by real-time spatial geo-proximity mapping, database-driven server actions, and direct bi-directional chat messaging.

---

## 2. High-Level Architecture Overview

```mermaid
graph TD
    Client["Browser / Client Tier (React 19 + Tailwind CSS)"]

    subgraph AppRouter ["Next.js 16 App Router (Node.js Server Tier)"]
        Pages["UI Pages & Layouts (Student / Employer / Admin)"]
        ServerActions["Next.js Server Actions ('use server')"]
        AuthModule["Better-Auth Engine"]
        GeoEngine["Spatial Proximity Calculator (Haversine Formula)"]
    end

    subgraph DataTier ["Data Persistence Tier"]
        Drizzle["Drizzle ORM Engine"]
        Database[("SQLite / PostgreSQL Database (csp.db)")]
    end

    Client <-->|HTTP / React Server Components| Pages
    Pages <--> ServerActions
    ServerActions <--> AuthModule
    ServerActions <--> GeoEngine
    ServerActions <--> Drizzle
    Drizzle <--> Database
```

---

## 3. Technology Stack & Layering

| Layer | Technologies | Responsibility |
|---|---|---|
| **Frontend Tier** | Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React | Modern responsive UI, glassmorphism design, client state management, interactive Leaflet maps |
| **Server Tier** | Next.js Server Actions (`app/actions/*`), Node.js | Secure server-side business logic, database mutations, role permissions |
| **Authentication** | Better-Auth with Drizzle Adapter | Session management, role fallback validation, secure cookie attributes |
| **Spatial / Mapping** | Leaflet & React-Leaflet, Haversine Math Utility | Dynamic coordinate calculation relative to MVGR Hostel (18.0601° N, 83.4005° E) |
| **ORM & Database** | Drizzle ORM (`drizzle-orm/better-sqlite3`), SQLite (`csp.db`) / PostgreSQL | Type-safe schema definition, transactional persistence, database migrations |
| **Analytics Engine** | Recharts, Custom SQL Aggregations | Dynamic graphical metrics for applicants, job types, and conversion rates |

---

## 4. Subsystems & Role-Based Portals

```mermaid
mindmap
  root((MVGR JobMatch System))
    Student Portal
      Browse Jobs & Proximity Map
      Submit Job Applications
      Set Weekly Shift Availability
      Real-Time Employer Chat
      Student Profile Settings
    Employer Portal
      Post & Pin Campus Jobs
      Review Applicants & Hire
      Store Analytics & Impressions
      Real-Time Candidate Chat
      Shop Location Management
    Admin Portal
      Platform User Management
      Job Verification & Flagging
      System-Wide Real-Time Analytics
      Platform Policies & Configuration
```

### 4.1. Student Portal (`/student/*`)
- **Job Discovery & Proximity**: Interactive Leaflet map rendering registered shops within a dynamic kilometer radius of the MVGR Hostel.
- **My Applications**: Track status (`pending`, `reviewed`, `accepted`, `rejected`, `withdrawn`) of submitted applications.
- **My Schedule**: Visual 7-day grid to define shift availability slots and export confirmed shifts to `.ics` calendar files.
- **Messaging**: Direct 3-second live auto-polling chat thread with store managers.

### 4.2. Employer Portal (`/employer/*`)
- **My Jobs**: Create new job postings with exact campus map coordinates (latitude/longitude), hourly pay rate (`₹`), and required skill tags.
- **Applicants**: Review cover notes, inspect student profiles, and update hiring statuses (`Hire`, `Decline`).
- **Analytics**: Graphic breakdown of store map impressions, applicant conversion rates, and weekly application trends via Recharts.
- **Messaging**: Dedicated chat interface to converse with applicants.

### 4.3. Admin Portal (`/admin/*`)
- **User Management**: View, verify/unverify, create, or soft-delete student, employer, and admin accounts.
- **Job Moderation**: Audit active campus job postings, flag inappropriate listings, or approve pending roles.
- **Analytics**: System-wide distribution of user roles, employment categories, and hiring metrics.

---

## 5. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o{ USER_PROFILES : "has profile"
    USER ||--o{ SESSION : "owns"
    USER_PROFILES ||--o{ JOBS : "posts (employer)"
    USER_PROFILES ||--o{ APPLICATIONS : "submits (student)"
    JOBS ||--o{ APPLICATIONS : "receives"
    APPLICATIONS ||--o{ SCHEDULES : "generates shift"
    USER_PROFILES ||--o{ AVAILABILITY : "defines"
    USER_PROFILES ||--o{ CONVERSATIONS : "participates in"
    CONVERSATIONS ||--o{ MESSAGES : "contains"
    USER_PROFILES ||--o{ NOTIFICATIONS : "receives"

    USER_PROFILES {
        string id PK
        string userId FK
        string role
        string firstName
        string lastName
        string phone
        string skills
        boolean isVerified
    }

    JOBS {
        string id PK
        string userId FK
        string title
        string location
        real latitude
        real longitude
        string hourlyRate
        string jobType
        string status
    }

    APPLICATIONS {
        string id PK
        string studentId FK
        string jobId FK
        string employerId FK
        string status
        string coverLetter
        string appliedAt
    }

    MESSAGES {
        string id PK
        string conversationId FK
        string senderId FK
        string recipientId FK
        string content
        boolean isRead
        string createdAt
    }
```

---

## 6. Key Data Pipelines

### 6.1. Job Application Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Student
    participant UI as Student Jobs Page
    participant Action as applyToJob() Action
    participant DB as SQLite / PostgreSQL

    Student->>UI: Selects Job & Enters Cover Note
    UI->>Action: applyToJob(jobId, coverLetter)
    Action->>DB: Check existing application for studentId + jobId
    alt Already Applied
        DB-->>Action: Return existing row
        Action-->>UI: Return { success: false, message: "Already applied" }
    else New Application
        Action->>DB: INSERT INTO applications
        Action->>DB: UPDATE jobs SET applicantCount = applicantCount + 1
        DB-->>Action: Transaction complete
        Action-->>UI: Return { success: true }
        UI-->>Student: Display "Application Submitted!" Success Banner
    end
```

### 6.2. Live Bi-Directional Messaging Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor Student
    actor Employer
    participant StudentUI as Student Messages Page
    participant EmployerUI as Employer Messages Page
    participant Action as sendMessage() / getMessages() Actions
    participant DB as csp.db (SQLite)

    Student->>StudentUI: Types & submits message content
    StudentUI->>Action: sendMessage(convId, recipientId, content, 'student')
    Action->>DB: INSERT INTO messages (senderId = student_demo_1)
    Action->>DB: UPDATE conversations SET lastMessageAt = NOW()
    DB-->>Action: Success
    Action-->>StudentUI: Refresh thread
    
    note over EmployerUI: Auto-polls getMessages(convId, 'employer') every 3s
    EmployerUI->>Action: getMessages(convId, 'employer')
    Action->>DB: SELECT * FROM messages WHERE conversationId = convId
    DB-->>Action: Return message list
    Action-->>EmployerUI: Render new message on left (them)
```

---

## 7. Security, Environment & Portability

- **Environment Configuration**: Key settings are defined in `.env.local` (`DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`).
- **Database Flexibility**: Uses **Drizzle ORM**, allowing zero-config local execution using **SQLite** (`better-sqlite3`, `csp.db`) while supporting seamless migration to **PostgreSQL** by switching the dialect driver.
- **Input & Type Validation**: Strict TypeScript types enforced across server actions and component props (`npx tsc --noEmit` clean).

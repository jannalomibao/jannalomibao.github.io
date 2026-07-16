# Product Requirements Document (PRD) — Personal Portfolio Website

## 1. Overview

A personal portfolio website for Janna Lomibao, built to advance her **software developer
career** — supporting job hunting and presenting a recruiter/hiring-manager-facing showcase of
technical skills, experience, and projects. The site is a full-stack application (not a static
site) because content — projects, blog posts, and contact messages — is managed dynamically
through an admin-only CMS backed by a real database, and because the build itself doubles as a
demonstration of full-stack engineering ability to prospective employers.

## 2. Goals

- Give recruiters and hiring managers a fast, credible view of who I am as a software developer,
  what I've built, and how to reach me.
- Showcase technical depth per project (problem, stack, my role, outcome) — not just a list of
  links — since technical reviewers will judge engineering judgment, not just output.
- Let me update projects, blog posts, and resume content myself, without redeploying code.
- Capture and manage inbound contact messages (recruiter outreach, interview requests) in one
  place instead of relying on email alone.
- Serve as a working, shippable demonstration of full-stack ability (React/Vite, NestJS,
  Supabase, Docker) — the site itself is evidence in the job search, not just a container for one.

## 3. Non-Goals

- No public user accounts or social features (likes, comments, follows) in v1.
- No multi-author support — single admin (owner) only.
- No e-commerce, payments, or monetization.
- No native mobile app.

## 4. Target Audience

| Audience | Need |
|---|---|
| Recruiters / hiring managers (primary) | Quickly assess skills, experience, and fit for a software developer role; download/view resume; find contact info |
| Technical interviewers / engineering peers | Review project details, tech stack per project, links to source/live demo, technical writing (blog) as code-quality and judgment signals |
| Me (site owner) | Manage projects, blog posts, and view contact submissions via admin dashboard |

## 5. Scope — Pages & Sections

| Page | Purpose | Access |
|---|---|---|
| Home | Hero intro, summary, highlighted projects, CTA to resume/contact | Public |
| About | Background, skills, experience narrative | Public |
| Projects | List + detail view of projects (case-study style) | Public |
| Blog | List + detail view of articles | Public |
| Resume/CV | Structured work history & skills; downloadable PDF | Public |
| Contact | Contact form (stores submission + triggers notification) | Public |
| Admin Dashboard | Manage projects, blog posts, and view contact submissions | Private (auth-gated) |

Full navigation and page relationships are defined in the [User Flow & Sitemap](03-user-flow-sitemap.md).

## 6. Functional Requirements

### 6.1 Public site
- FR-1: Visitor can view Home, About, Projects, Blog, Resume, and Contact pages.
- FR-2: Visitor can view a list of projects and open an individual project's case-study detail,
  including tech stack tags and links to source code (e.g. GitHub) and live demo where available.
- FR-3: Visitor can view a list of blog posts and open an individual post.
- FR-4: Visitor can view/download the resume as a PDF.
- FR-5: Visitor can submit a contact form (name, email, message) and receive on-page confirmation.
- FR-6: Site is responsive across mobile, tablet, and desktop breakpoints.

### 6.2 Admin / CMS
- FR-7: Owner can log in to an admin dashboard (auth-gated, single-user).
- FR-8: Owner can create, edit, delete, and publish/unpublish projects.
- FR-9: Owner can create, edit, delete, and publish/unpublish blog posts.
- FR-10: Owner can view a list of contact form submissions and mark them as read/archived.
- FR-11: Owner can update resume content/data without a code deploy.

### 6.3 Backend / data
- FR-12: All dynamic content (projects, blog posts, contact submissions, resume data) is
  persisted in Supabase (Postgres).
- FR-13: Backend (NestJS) exposes an API consumed by the React frontend for all dynamic reads/writes.
- FR-14: Contact form submissions trigger an email/notification to the owner (mechanism TBD in
  architecture doc).

## 7. Non-Functional Requirements

- NFR-1: Initial page load (Home) under ~2s on a standard broadband connection.
- NFR-2: Site is fully responsive (mobile-first) and passes basic accessibility checks (WCAG AA
  contrast, semantic HTML, keyboard navigability).
- NFR-3: Admin routes are protected — no dynamic content mutation is possible without
  authentication.
- NFR-4: Entire stack (frontend, backend, and any supporting services) runs via Docker/Docker
  Compose for local dev and deployment parity.
- NFR-5: Basic SEO support on public pages (meta tags, Open Graph, sitemap.xml).

## 8. Tech Stack (constraints, not decisions of this doc)

- Frontend: React + Vite
- Backend: NestJS (Node.js)
- Database: Supabase (Postgres)
- Containerization: Docker for all services

Full architecture, service boundaries, and infrastructure are defined in the
[Architecture & Infrastructure doc](06-architecture-infrastructure.md).

## 9. Success Metrics

- Site is live and publicly accessible with all six public pages functional.
- Owner can publish a new project or blog post end-to-end via the admin dashboard without a
  code change.
- Contact form submissions are reliably captured and visible in the admin dashboard.
- Site used as a live link in job applications / recruiter conversations.

## 10. Open Questions

- What is the resume PDF source of truth — generated from CMS data, or a manually uploaded file?
- Notification channel for new contact submissions — email (which provider), Slack, or
  in-dashboard only for v1?
- Is a single hardcoded admin account sufficient, or is Supabase Auth (email/password or
  magic link) required?

## 11. Related Documents

- [User Flow & Sitemap](03-user-flow-sitemap.md)
- [Design System / Branding](04-design-system.md)
- [User Stories & Technical Approach](05-user-stories.md)
- [Architecture & Infrastructure](06-architecture-infrastructure.md)

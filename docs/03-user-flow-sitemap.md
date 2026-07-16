# User Flow & Sitemap — Personal Portfolio Website

Related: [PRD](02-prd.md)

## 1. Sitemap

```mermaid
graph TD
    Root["/"] --> Home["Home (/)"]
    Root --> About["About (/about)"]
    Root --> Projects["Projects (/projects)"]
    Projects --> ProjectDetail["Project Detail (/projects/:slug)"]
    Root --> Blog["Blog (/blog)"]
    Blog --> BlogDetail["Blog Post (/blog/:slug)"]
    Root --> Resume["Resume/CV (/resume)"]
    Root --> Contact["Contact (/contact)"]
    Root --> AdminLogin["Admin Login (/admin/login)"]
    AdminLogin --> AdminDashboard["Admin Dashboard (/admin)"]
    AdminDashboard --> AdminProjects["Manage Projects (/admin/projects)"]
    AdminProjects --> AdminProjectForm["Create/Edit Project (/admin/projects/:id)"]
    AdminDashboard --> AdminBlog["Manage Blog (/admin/blog)"]
    AdminBlog --> AdminBlogForm["Create/Edit Post (/admin/blog/:id)"]
    AdminDashboard --> AdminMessages["Contact Submissions (/admin/messages)"]
    AdminDashboard --> AdminResume["Manage Resume Data (/admin/resume)"]

    classDef public fill:#e8f4fd,stroke:#1c7ed6,color:#0b3d5c;
    classDef admin fill:#fff3e0,stroke:#e8590c,color:#5c2c06;

    class Home,About,Projects,ProjectDetail,Blog,BlogDetail,Resume,Contact public;
    class AdminLogin,AdminDashboard,AdminProjects,AdminProjectForm,AdminBlog,AdminBlogForm,AdminMessages,AdminResume admin;
```

**Legend:** blue = public pages, orange = admin (auth-gated) pages.

### Route table

| Path | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/about` | About | Public |
| `/projects` | Projects list | Public |
| `/projects/:slug` | Project detail (case study) | Public |
| `/blog` | Blog list | Public |
| `/blog/:slug` | Blog post detail | Public |
| `/resume` | Resume/CV (view + download PDF) | Public |
| `/contact` | Contact form | Public |
| `/admin/login` | Admin login | Public (form), redirects if authed |
| `/admin` | Admin dashboard (overview) | Private |
| `/admin/projects` | Manage projects (list) | Private |
| `/admin/projects/:id` | Create/edit project | Private |
| `/admin/blog` | Manage blog posts (list) | Private |
| `/admin/blog/:id` | Create/edit blog post | Private |
| `/admin/messages` | View contact submissions | Private |
| `/admin/resume` | Edit resume/CV data | Private |

## 2. Primary Visitor Flow (Recruiter / Hiring Manager)

```mermaid
flowchart TD
    Start([Visitor lands on site]) --> Entry{Entry point?}
    Entry -->|Direct link / search| Home[Home page]
    Entry -->|Shared project link| ProjectDetail[Project detail]
    Entry -->|Shared blog link| BlogDetail[Blog post]

    Home --> Decision{What do they want?}
    Decision -->|Learn background| About[About page]
    Decision -->|See work| Projects[Projects list]
    Decision -->|See experience| Resume[Resume/CV page]
    Decision -->|Read technical writing| Blog[Blog list]
    Decision -->|Reach out now| Contact[Contact page]

    Projects --> ProjectDetail
    ProjectDetail --> ProjectCTA{Impressed?}
    ProjectCTA -->|Yes| Contact
    ProjectCTA -->|Want more examples| Projects

    Blog --> BlogDetail
    BlogDetail --> Contact

    About --> Resume
    Resume --> DownloadPDF[Download resume PDF]
    Resume --> Contact

    Contact --> FillForm[Fill out name / email / message]
    FillForm --> Submit{Valid?}
    Submit -->|No| FormError[Inline validation error]
    FormError --> FillForm
    Submit -->|Yes| Confirmation[Confirmation shown]
    Confirmation --> End([Visitor done])
    DownloadPDF --> End
```

## 3. Admin (CMS) Flow

```mermaid
flowchart TD
    Start([Owner navigates to /admin]) --> AuthCheck{Authenticated?}
    AuthCheck -->|No| Login[Login form]
    Login --> Credentials{Valid credentials?}
    Credentials -->|No| LoginError[Show error, retry]
    LoginError --> Login
    Credentials -->|Yes| Dashboard[Admin dashboard]
    AuthCheck -->|Yes| Dashboard

    Dashboard --> Choice{Manage what?}
    Choice -->|Projects| ProjectsList[Projects list]
    ProjectsList --> ProjectAction{Action}
    ProjectAction -->|Create| ProjectForm[Project form]
    ProjectAction -->|Edit| ProjectForm
    ProjectAction -->|Delete| ConfirmDeleteProject[Confirm delete]
    ProjectForm --> SaveProject[Save to Supabase via NestJS API]
    SaveProject --> ProjectsList
    ConfirmDeleteProject --> ProjectsList

    Choice -->|Blog| BlogList[Blog posts list]
    BlogList --> BlogAction{Action}
    BlogAction -->|Create| BlogForm[Blog post form]
    BlogAction -->|Edit| BlogForm
    BlogAction -->|Publish/Unpublish| TogglePublish[Toggle status]
    BlogForm --> SaveBlog[Save to Supabase via NestJS API]
    SaveBlog --> BlogList
    TogglePublish --> BlogList

    Choice -->|Contact messages| Messages[Messages list]
    Messages --> MessageAction{Action}
    MessageAction -->|Read| MarkRead[Mark as read]
    MessageAction -->|Archive| Archive[Archive message]
    MarkRead --> Messages
    Archive --> Messages

    Choice -->|Resume data| ResumeEdit[Edit resume/CV fields]
    ResumeEdit --> SaveResume[Save to Supabase via NestJS API]
    SaveResume --> Dashboard
```

## 4. Global Navigation

Present on every public page (header/footer):

- Logo/name → `/`
- Nav links: About, Projects, Blog, Resume, Contact
- Footer: social links (GitHub, LinkedIn), email, copyright

Admin pages use a separate authenticated layout (sidebar nav: Dashboard, Projects, Blog,
Messages, Resume) and are not linked from the public nav.

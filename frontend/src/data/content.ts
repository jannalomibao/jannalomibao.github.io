// Placeholder content — replace with real bio, projects, posts, and resume data.

export const profile = {
  name: "Janna Lomibao",
  role: "Software Developer",
  tagline: "I build clean, considered software — from database to interface.",
  location: "Philippines",
  email: "jannalomibao2000@gmail.com",
  github: "https://github.com/",
  linkedin: "https://linkedin.com/",
  bio: [
    "I'm a software developer who enjoys the full stack — designing data models, building APIs, and shaping the interfaces people actually touch.",
    "Recently I've been deep in React, Node/NestJS, and Postgres, with a growing interest in developer tooling and clean system design.",
    "Outside of code, I care about craft: interfaces that feel considered, and systems that are easy to reason about six months later.",
  ],
  skills: [
    "TypeScript",
    "React",
    "Node.js",
    "NestJS",
    "PostgreSQL",
    "Supabase",
    "Docker",
    "REST APIs",
    "Tailwind CSS",
    "Git",
  ],
};

export type Project = {
  slug: string;
  title: string;
  summary: string;
  problem: string;
  role: string;
  outcome: string;
  stack: string[];
  image: string;
  repoUrl?: string;
  demoUrl?: string;
  featured?: boolean;
};

export const projects: Project[] = [
  {
    slug: "ledgerline",
    title: "Ledgerline",
    summary: "A self-hosted expense tracker with shared household budgets.",
    problem:
      "Existing budgeting apps were either subscription-locked or too rigid for a household splitting shared and personal expenses.",
    role: "Sole developer — designed the schema, built the API, and shipped the UI end to end.",
    outcome:
      "Replaced a spreadsheet workflow for two households; now tracks 18 months of transactions with monthly rollups and category budgets.",
    stack: ["React", "NestJS", "PostgreSQL", "Docker"],
    image:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop",
    repoUrl: "https://github.com/",
    demoUrl: "https://example.com/",
    featured: true,
  },
  {
    slug: "shelfspace",
    title: "Shelfspace",
    summary: "A minimal reading tracker with a focus on fast entry and stats.",
    problem:
      "Popular reading trackers were cluttered with social features I didn't want, when all I needed was fast logging and honest stats.",
    role: "Designed and built the frontend and API; handled deployment.",
    outcome:
      "Used daily by a small group of beta readers; sub-200ms add-book flow was the core design constraint.",
    stack: ["React", "Supabase", "Tailwind CSS"],
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop",
    repoUrl: "https://github.com/",
    featured: true,
  },
  {
    slug: "signal-board",
    title: "Signal Board",
    summary: "A status-page and uptime monitor for small side projects.",
    problem:
      "Enterprise status-page tools were overkill for a handful of personal side projects that just needed a public uptime page.",
    role: "Built the ping worker, the public status page, and the incident timeline.",
    outcome:
      "Monitors 6 personal services with a public status page and email alerts on downtime.",
    stack: ["Node.js", "PostgreSQL", "Docker"],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop",
    repoUrl: "https://github.com/",
    featured: true,
  },
  {
    slug: "type-drift",
    title: "Type Drift",
    summary: "A typing practice tool with real code snippets instead of prose.",
    problem: "Typing trainers use plain prose; developers actually need to practice symbols and syntax.",
    role: "Built solo as a weekend project to explore Canvas-based text rendering.",
    outcome: "Small but consistent daily-use tool; used it myself to warm up before work.",
    stack: ["TypeScript", "React"],
    image:
      "https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=1600&auto=format&fit=crop",
    repoUrl: "https://github.com/",
  },
];

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  date: string;
  readMinutes: number;
  image: string;
};

export const posts: Post[] = [
  {
    slug: "designing-apis-for-change",
    title: "Designing APIs for the change you haven't made yet",
    excerpt:
      "Notes on versioning, optional fields, and the small decisions that keep an API bendable instead of brittle.",
    content: [
      "Most API design mistakes aren't visible on day one — they show up eight months later when you need to change something and can't without breaking a client.",
      "A few habits that have paid off: default new fields to optional, avoid encoding business logic in resource shapes, and treat every response as a contract you'll regret rushing.",
      "None of this is exotic. It's mostly about writing down what you're actually promising callers, and being honest with yourself about how likely it is to change.",
    ],
    date: "2026-05-12",
    readMinutes: 6,
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=1600&auto=format&fit=crop",
  },
  {
    slug: "docker-compose-for-side-projects",
    title: "Docker Compose is enough for most side projects",
    excerpt:
      "You probably don't need Kubernetes. A single docker-compose.yml can take you further than you'd think.",
    content: [
      "There's a point in every side project where infra starts to feel like a real decision instead of an afterthought. It's tempting to reach for whatever the big companies use.",
      "For a single-developer project, docker-compose gets you reproducible environments, easy local dev, and a deploy story that fits on one page.",
      "Scale the infrastructure when the project earns it — not before.",
    ],
    date: "2026-03-02",
    readMinutes: 4,
    image:
      "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1600&auto=format&fit=crop",
  },
  {
    slug: "what-six-months-of-nestjs-taught-me",
    title: "What six months of NestJS taught me",
    excerpt:
      "Modules, providers, and dependency injection — the parts that clicked, and the parts I fought.",
    content: [
      "Coming from a more freeform Express background, NestJS's structure felt heavy at first. Six months in, that structure is exactly what I'd ask for on a team project.",
      "Dependency injection made testing dramatically easier once I stopped fighting it and started designing services around it from the start.",
      "The biggest shift was mental: stop thinking in routes, start thinking in modules and boundaries.",
    ],
    date: "2026-01-20",
    readMinutes: 5,
    image:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1600&auto=format&fit=crop",
  },
];

export const resume = {
  summary:
    "Software developer with full-stack experience across React, Node/NestJS, and Postgres-backed systems. Comfortable owning a feature from schema to shipped UI.",
  experience: [
    {
      role: "Software Developer",
      org: "Company Name",
      period: "2023 — Present",
      points: [
        "Built and maintained full-stack features across a React frontend and Node backend.",
        "Designed database schemas and API contracts for new product areas.",
        "Collaborated with design to implement responsive, accessible interfaces.",
      ],
    },
    {
      role: "Junior Developer",
      org: "Previous Company",
      period: "2021 — 2023",
      points: [
        "Shipped bug fixes and small features in a production web application.",
        "Wrote and maintained integration tests, improving release confidence.",
      ],
    },
  ],
  education: [
    {
      school: "University Name",
      credential: "B.S. Computer Science",
      period: "2017 — 2021",
    },
  ],
  resumeUrl: "#",
};

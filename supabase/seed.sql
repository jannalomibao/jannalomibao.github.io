-- Local dev seed data, generated from supabase/seed-content.yaml.
-- Re-run safe: ON CONFLICT / "where not exists" guards make this idempotent,
-- so `supabase db reset` (which replays this every time) never duplicates
-- rows or errors on a second run. See docs/08-seed-data.md for the process.
-- Regenerate by re-running this against an updated seed-content.yaml rather
-- than hand-editing — it's a generated file.

-- Projects

insert into projects (slug, title, summary, problem, role, outcome, stack, image_url, repo_url, demo_url, featured, published)
values (
  'cura-mobile-app',
  'Cura Mobile App',
  'A mobile app that streamlines care coordination among caregivers, family members, supported persons, and healthcare professionals.',
  'Care coordination between caregivers, family members, supported persons, and healthcare
professionals is scattered across disconnected channels, making collaboration and
knowledge-sharing difficult.',
  'Developer — building caregiver support features.',
  'Ongoing. Caregiver support features shipped so far include a support chat and a
community forum for collaboration and knowledge sharing.',
  array['React Native', 'Java Spring Boot', 'Supabase', 'AWS'],
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1600&auto=format&fit=crop',
  NULL,
  NULL,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  problem = excluded.problem,
  role = excluded.role,
  outcome = excluded.outcome,
  stack = excluded.stack,
  image_url = excluded.image_url,
  repo_url = excluded.repo_url,
  demo_url = excluded.demo_url,
  featured = excluded.featured,
  published = excluded.published,
  updated_at = now();

insert into projects (slug, title, summary, problem, role, outcome, stack, image_url, repo_url, demo_url, featured, published)
values (
  'portfolio-website',
  'Website Portfolio',
  'A full-stack personal portfolio to showcase projects, technical skills, resume, and professional experience.',
  'Needed a single, professional place to showcase projects, technical skills, resume, and
experience to recruiters and collaborators.',
  'Full-stack developer — designed and built the entire site (frontend, backend, and deployment).',
  'Built and shipped a full-stack personal portfolio covering project showcases, a blog, and
a resume section. (This is the site you''re looking at.)',
  array['React', 'NestJS', 'Supabase', 'AWS'],
  'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?q=80&w=1600&auto=format&fit=crop',
  'https://github.com/jannalomibao',
  NULL,
  true,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  problem = excluded.problem,
  role = excluded.role,
  outcome = excluded.outcome,
  stack = excluded.stack,
  image_url = excluded.image_url,
  repo_url = excluded.repo_url,
  demo_url = excluded.demo_url,
  featured = excluded.featured,
  published = excluded.published,
  updated_at = now();

insert into projects (slug, title, summary, problem, role, outcome, stack, image_url, repo_url, demo_url, featured, published)
values (
  'nail-salon-website',
  'Nail Salon Website (Real Client Project)',
  'A responsive website for a real nail salon client, with bookings, customer management, and third-party integrations.',
  'A nail salon client needed an online presence with real booking and customer-management
capability, not just a static brochure site.',
  'Freelance developer — collaborating directly with the client to build the site to their business needs.',
  'Ongoing, not yet finished. Building a responsive site with back-end booking and
customer-management systems, integrated with Instagram, Google Maps, and Square.',
  array['Bootstrap', 'HTML', 'CSS', 'JavaScript', 'PHP', 'Instagram API', 'Google Maps API', 'Square API', 'phpMyAdmin'],
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?q=80&w=1600&auto=format&fit=crop',
  NULL,
  NULL,
  false,
  false
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  problem = excluded.problem,
  role = excluded.role,
  outcome = excluded.outcome,
  stack = excluded.stack,
  image_url = excluded.image_url,
  repo_url = excluded.repo_url,
  demo_url = excluded.demo_url,
  featured = excluded.featured,
  published = excluded.published,
  updated_at = now();

insert into projects (slug, title, summary, problem, role, outcome, stack, image_url, repo_url, demo_url, featured, published)
values (
  'todo-list-app',
  'Mobile App for To-Do List',
  'A cross-platform to-do app with real-time collaboration and location-aware suggestions.',
  'Wanted a to-do app that supported real-time collaboration between users, not just
single-user task lists.',
  'Developer.',
  'Shipped a cross-platform Flutter/Dart to-do app with Firebase real-time sync, real-time
collaborative task management, and integrated motivational-quote and nearby-places APIs.',
  array['Dart', 'Flutter', 'Firebase', 'Google Maps API'],
  'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1600&auto=format&fit=crop',
  NULL,
  NULL,
  false,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  problem = excluded.problem,
  role = excluded.role,
  outcome = excluded.outcome,
  stack = excluded.stack,
  image_url = excluded.image_url,
  repo_url = excluded.repo_url,
  demo_url = excluded.demo_url,
  featured = excluded.featured,
  published = excluded.published,
  updated_at = now();

insert into projects (slug, title, summary, problem, role, outcome, stack, image_url, repo_url, demo_url, featured, published)
values (
  'travel-agency-website',
  'Travel Agency Website',
  'A responsive travel agency website with interactive booking forms and dynamic content.',
  'A travel agency needed a user-friendly site with interactive booking rather than a static
brochure page.',
  'Developer.',
  'Built a responsive site with interactive booking forms and dynamic JavaScript-driven
content.',
  array['HTML', 'CSS', 'JavaScript'],
  'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?q=80&w=1600&auto=format&fit=crop',
  NULL,
  NULL,
  false,
  true
)
on conflict (slug) do update set
  title = excluded.title,
  summary = excluded.summary,
  problem = excluded.problem,
  role = excluded.role,
  outcome = excluded.outcome,
  stack = excluded.stack,
  image_url = excluded.image_url,
  repo_url = excluded.repo_url,
  demo_url = excluded.demo_url,
  featured = excluded.featured,
  published = excluded.published,
  updated_at = now();


-- Posts: none yet — nothing in seed-content.yaml's "posts" list. Add entries
-- there and regenerate this file once you have blog content to seed.


-- Resume — single row. Insert only if the table's empty (no unique slug to
-- key an ON CONFLICT off); update in place if a row already exists, rather
-- than inserting a second one.
do $$
begin
  if not exists (select 1 from resume) then
    insert into resume (summary, experience, education, skills)
    values (
      'Computer Science student at Concordia University with hands-on experience building full-stack apps (React, Next.js, NestJS, Supabase/PostgreSQL, PHP) and cross-platform mobile apps (React Native, Flutter). Comfortable owning a project end to end, including a real freelance client engagement.',
      '[{"role":"Software Developer Intern","org":"Consultation SOS","period":"Fall 2025","points":["Consolidated volunteer shelter contact and case information that had previously been scattered across 9 separate spreadsheets into a single system.","Built a web interface for volunteers to search, update, and retrieve shelter contacts and information, speeding up finding a shelter for animals under a 72-hour euthanization notice."]},{"role":"Website Developer, Website Department","org":"Concordia Robotics Club (CRC Robotics Competition site)","period":"August 2024 – December 2024","points":["Helped design and implement the competition website in Vue.js, featuring the team''s \"Plants vs. Zombies\" theme — robot info, team journey, and videos."]}]'::jsonb,
      '[{"school":"Concordia University, Montreal, Quebec","credential":"Bachelor of Computer Science","period":"Started Fall 2026"},{"school":"Vanier College, Montreal, Quebec","credential":"Computer Science and Technology","period":"Finished Fall 2025"},{"school":"St. Laurent Adult Centre","credential":"High School Diploma","period":"Finished Dec 2022"}]'::jsonb,
      array['HTML', 'CSS', 'Bootstrap', 'React', 'Next.js', 'Supabase', 'PHP', 'PostgreSQL', 'MySQL', 'Microsoft SQL Server', 'SQLite', 'JavaScript', 'Java', 'C#', 'Python', 'Dart', 'SQL', 'Git', 'GitHub', 'Visual Studio Code', 'XAMPP', 'Agile']
    );
  else
    update resume set
      summary = 'Computer Science student at Concordia University with hands-on experience building full-stack apps (React, Next.js, NestJS, Supabase/PostgreSQL, PHP) and cross-platform mobile apps (React Native, Flutter). Comfortable owning a project end to end, including a real freelance client engagement.',
      experience = '[{"role":"Software Developer Intern","org":"Consultation SOS","period":"Fall 2025","points":["Consolidated volunteer shelter contact and case information that had previously been scattered across 9 separate spreadsheets into a single system.","Built a web interface for volunteers to search, update, and retrieve shelter contacts and information, speeding up finding a shelter for animals under a 72-hour euthanization notice."]},{"role":"Website Developer, Website Department","org":"Concordia Robotics Club (CRC Robotics Competition site)","period":"August 2024 – December 2024","points":["Helped design and implement the competition website in Vue.js, featuring the team''s \"Plants vs. Zombies\" theme — robot info, team journey, and videos."]}]'::jsonb,
      education = '[{"school":"Concordia University, Montreal, Quebec","credential":"Bachelor of Computer Science","period":"Started Fall 2026"},{"school":"Vanier College, Montreal, Quebec","credential":"Computer Science and Technology","period":"Finished Fall 2025"},{"school":"St. Laurent Adult Centre","credential":"High School Diploma","period":"Finished Dec 2022"}]'::jsonb,
      skills = array['HTML', 'CSS', 'Bootstrap', 'React', 'Next.js', 'Supabase', 'PHP', 'PostgreSQL', 'MySQL', 'Microsoft SQL Server', 'SQLite', 'JavaScript', 'Java', 'C#', 'Python', 'Dart', 'SQL', 'Git', 'GitHub', 'Visual Studio Code', 'XAMPP', 'Agile'],
      updated_at = now();
  end if;
end $$;

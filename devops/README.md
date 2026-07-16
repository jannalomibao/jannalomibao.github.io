# Deployment — GitHub Pages

This deploys `frontend/` as a static site to `https://jannalomibao.github.io/`, a GitHub
*user* Pages site (the repo must be named exactly `jannalomibao.github.io` — GitHub serves that
specific repo at the domain root instead of `/repo-name/`).

## How it fits together

- **`terraform/`** — one-time infra config. Turns on GitHub Pages for the repo with the build
  source set to "GitHub Actions." Does *not* create the repo (you do that by hand) and does not
  build or ship any code.
- **`.github/workflows/deploy.yml`** (repo root, required location for GitHub Actions) — builds
  `frontend/` and deploys it to Pages on every push to `main`. This is where the actual
  deployment happens.
- **`deploy.sh`** — the command you run. Verifies the build succeeds locally, then commits and
  pushes, which triggers the workflow above.

## One-time setup

1. **Create the repo.** On GitHub, create a new **public** repository named exactly
   `jannalomibao.github.io`. Leave it empty — don't add a README, license, or `.gitignore` from
   the GitHub UI (this project already pushes its own).

2. **Get a GitHub token for Terraform.** Create a classic Personal Access Token with the `repo`
   scope: <https://github.com/settings/tokens> → Generate new token (classic).

   ```bash
   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   ```

3. **Adopt the repo into Terraform and enable Pages.**

   ```bash
   cd devops/terraform
   terraform init
   terraform import github_repository.portfolio jannalomibao.github.io
   terraform plan    # review — should only show the `pages` block being added
   terraform apply
   ```

   This must happen *before* the first deploy — the workflow's `actions/deploy-pages` step
   fails if Pages isn't already enabled with "GitHub Actions" as the source.

4. **Deploy.**

   ```bash
   ./devops/deploy.sh
   ```

   First run needs `git` configured with access to the repo. The script pushes over HTTPS by
   default and relies on a credential helper being set up (e.g. `gh auth login`, which
   configures one automatically) — override with `REPO_URL=git@github.com:...` if you'd rather
   push over SSH.

5. **Confirm.** Watch the run at
   `https://github.com/jannalomibao/jannalomibao.github.io/actions`, then visit
   `https://jannalomibao.github.io/`.

## Every deploy after that

```bash
./devops/deploy.sh
```

That's it — it builds, commits whatever changed, pushes, and GitHub Actions takes it from
there. No need to re-run Terraform unless you're changing the Pages configuration itself.

## Notes

- **Client-side routing:** this app uses React Router (`BrowserRouter`), but GitHub Pages only
  serves static files — a direct link to `/projects/ledgerline` would 404 at the CDN before
  React ever loads. `frontend/public/404.html` plus a small snippet in `frontend/index.html`
  implement the standard workaround (redirect → decode → `history.replaceState`), so deep links
  work. If you ever add a build-time `base` path (e.g. switching to a project Pages site under
  `/repo-name/`), update `pathSegmentsToKeep` in `404.html` to match.
- **Terraform scope is deliberately narrow.** `main.tf` only manages the repo's visibility,
  description, and Pages settings, with `lifecycle.ignore_changes` on everything else (issues,
  wiki, merge options, etc.) so it won't fight settings you change by hand in the GitHub UI.
- **State is local** (no remote backend configured) — fine for a single-maintainer personal
  site. `*.tfstate` is gitignored; don't lose it. If that ever becomes a problem, move to an
  S3/GCS backend.

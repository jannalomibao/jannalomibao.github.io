# Manages GitHub Pages configuration on an EXISTING repo.
#
# This does not create the repo — you create jannalomibao.github.io by hand
# first (see ../README.md), then `terraform import` it so Terraform adopts
# the existing repo instead of trying to create a duplicate.
#
# The `lifecycle.ignore_changes` list below is intentional: this resource's
# job is narrowly "turn on Pages with GitHub Actions as the build source,"
# not "own every setting on the repo." Without it, `terraform apply` would
# reset unrelated settings (issues, wiki, merge options, etc.) to provider
# defaults the first time you run it against a repo you configured by hand
# in the GitHub UI.
resource "github_repository" "portfolio" {
  name        = var.repo_name
  description = var.repo_description
  visibility  = "public"

  lifecycle {
    ignore_changes = [
      pages, # managed via github_repository_pages below; the inline block is deprecated
      has_issues,
      has_projects,
      has_wiki,
      has_downloads,
      has_discussions,
      allow_merge_commit,
      allow_squash_merge,
      allow_rebase_merge,
      allow_auto_merge,
      delete_branch_on_merge,
      squash_merge_commit_title,
      squash_merge_commit_message,
      merge_commit_title,
      merge_commit_message,
      topics,
      homepage_url,
      archived,
      vulnerability_alerts,
    ]
  }
}

resource "github_repository_pages" "portfolio" {
  repository = github_repository.portfolio.name
  build_type = "workflow"
}

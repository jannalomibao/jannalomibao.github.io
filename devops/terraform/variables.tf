variable "github_owner" {
  description = "GitHub username that owns the Pages repo."
  type        = string
  default     = "jannalomibao"
}

variable "repo_name" {
  description = <<-EOT
    Name of the GitHub Pages repo. For a *user* Pages site (as opposed to a
    project Pages site under /repo-name/), this MUST be exactly
    "<username>.github.io" — GitHub special-cases that name to serve the repo
    at the domain root.
  EOT
  type        = string
  default     = "jannalomibao.github.io"
}

variable "repo_description" {
  description = "Repository description shown on GitHub."
  type        = string
  default     = "Personal portfolio — jannalomibao.github.io"
}

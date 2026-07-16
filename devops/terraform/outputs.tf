output "pages_url" {
  description = "Public URL of the deployed GitHub Pages site."
  value       = "https://${var.repo_name}"
}

output "repo_url" {
  description = "GitHub URL of the repo."
  value       = github_repository.portfolio.html_url
}

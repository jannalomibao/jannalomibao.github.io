# Auth: the provider reads the GITHUB_TOKEN environment variable automatically.
# Export a Personal Access Token (classic, "repo" scope) before running terraform:
#   export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
provider "github" {
  owner = var.github_owner
}

terraform {
  backend "gcs" {
    bucket = "qwiklabs-gcp-01-4966a7ce7870-terraform-state"
    prefix = "zoi-agentic-era-hackathon/prod"
  }
}

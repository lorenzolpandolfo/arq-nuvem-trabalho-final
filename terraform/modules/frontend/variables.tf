variable "project"         { type = string }
variable "environment"     { type = string }
variable "api_gateway_dns" { type = string }

terraform {
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}

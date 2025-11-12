variable "location" {
  description = "Azure region for frontend resources"
  type        = string
  default     = "australiaeast"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "whatdoesgrassiwant"
}

variable "domain_name" {
  description = "Root DNS name for the site"
  type        = string
  default     = "whatdoesgrassiwant.com"
}
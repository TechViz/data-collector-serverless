variable "method" {
  type = string
}

variable "path" {
  type = string
}

variable "handler_filename" {
  type = string
}

variable "handler_entry_point" {
  type = string
}

variable "project_prefix" {
  type = string
}

variable "environment_name" {
  type = string
}

variable "api_gateway_id" {
  type = string
}

variable "api_gateway_execution_arn" {
  type = string
}

variable "code_bucket" {
  type = string
}

variable "environment_variables" {
  description = "Environment variables available to the function"
  type        = any
}

variable "timeout" {
  description = "Time (in seconds) for the function to timeout"
  type        = number
  default     = 3
}

locals {
  lambda_name = "${var.project_prefix}-${var.handler_filename}-${var.handler_entry_point}-${var.environment_name}"
}

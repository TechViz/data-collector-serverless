terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.27"
    }
  }

  required_version = ">= 0.14.9"

  backend "s3" {
    bucket               = "techviz-terraform-states"
    key                  = "techviz-data-collector"
    workspace_key_prefix = "environments"
    region               = "us-east-1"
    profile              = "tech_viz"
  }
}

provider "aws" {
  profile = "tech_viz"
  region  = "us-east-1"
}


resource "aws_s3_bucket" "s3_lambda_source_code_bucket" {
  bucket = "${local.project_prefix}-${local.environment_name}-lambda-source-code"
  acl    = "private"
  versioning {
    enabled = true
  }

  lifecycle {
    prevent_destroy = true
  }
}

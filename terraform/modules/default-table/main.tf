variable "table_name" {
  type = string
}

variable "hash_key" {
  type = string
}

resource "aws_dynamodb_table" "users_table" {
  name     = var.table_name
  hash_key = var.hash_key

  billing_mode = "PAY_PER_REQUEST"
  attribute {
    name = var.hash_key
    type = "S"
  }

  lifecycle {
    prevent_destroy = true
  }
}

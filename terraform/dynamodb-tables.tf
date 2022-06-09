# Tables
module "table_users" {
  source = "./modules/default-table"

  table_name = local.table_users_name
  hash_key   = "cpf"
}

module "table_pre_initialization_users" {
  source = "./modules/default-table"

  table_name = local.table_pre_initialization_users_name
  hash_key   = "email"
}

module "table_submissions" {
  source = "./modules/default-table"

  table_name = local.table_submissions_name
  hash_key   = "userCpf"
}

module "table_access_keys" {
  source = "./modules/default-table"

  table_name = local.table_access_key_name
  hash_key   = "key"
}

module "table_ratings" {
  source = "./modules/default-table"

  table_name = local.table_ratings_name
  hash_key   = "id"
}

module "table_tos_refusal_message" {
  source = "./modules/default-table"

  table_name = local.table_tos_refusal_message_name
  hash_key   = "id"
}

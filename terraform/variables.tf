locals {
  project_prefix   = "techviz-data-collector"
	environment_name = local.workspace_vars.environment_name

	JWT_SECRET = sensitive(local.workspace_vars.JWT_SECRET)
	SIGNUP_SECRET = sensitive(local.workspace_vars.SIGNUP_SECRET)

	workspace_vars = jsondecode(file("./env/${terraform.workspace}.json"))
}

locals {
	table_users_name = "${local.project_prefix}-${local.environment_name}-users"
	table_pre_initialization_users_name = "${local.project_prefix}-${local.environment_name}-pre-initialization-users"
	table_access_key_name = "${local.project_prefix}-${local.environment_name}-access-key"
	table_submissions_name = "${local.project_prefix}-${local.environment_name}-submissions"
	table_ratings_name = "${local.project_prefix}-${local.environment_name}-ratings"
	table_tos_refusal_message_name = "${local.project_prefix}-${local.environment_name}-tos-refusal-message"
}

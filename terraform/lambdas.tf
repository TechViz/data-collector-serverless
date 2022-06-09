# User
module "lambda_users_create" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/users/create"
  handler_filename = "users"
  handler_entry_point = "create"

  environment_variables = {
    SIGNUP_SECRET = local.SIGNUP_SECRET
    DYNAMODB_PRE_INITIALIZATION_USERS_TABLE = local.table_pre_initialization_users_name
    DYNAMODB_ACCESS_KEY_TABLE = local.table_access_key_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

module "lambda_users_create_Login_credentials" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/users/create-login-credentials"
  handler_filename = "users"
  handler_entry_point = "createLoginCredentials"

  timeout = 10
  environment_variables = {
    JWT_SECRET = local.JWT_SECRET
    DYNAMODB_PRE_INITIALIZATION_USERS_TABLE = local.table_pre_initialization_users_name
    DYNAMODB_USERS_TABLE = local.table_users_name
    DYNAMODB_ACCESS_KEY_TABLE = local.table_access_key_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

module "lambda_users_create_name" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/users/create-name"
  handler_filename = "users"
  handler_entry_point = "createName"

  environment_variables = {
    JWT_SECRET = local.JWT_SECRET
    DYNAMODB_USERS_TABLE = local.table_users_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

module "lambda_users_login" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/users/login"
  handler_filename = "users"
  handler_entry_point = "login"

  timeout = 10
  environment_variables = {
    JWT_SECRET = local.JWT_SECRET
    DYNAMODB_USERS_TABLE = local.table_users_name
    DYNAMODB_SUBMISSIONS_TABLE = local.table_submissions_name
    DYNAMODB_ACCESS_KEY_TABLE = local.table_access_key_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

module "lambda_validate_access_key" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/users/validate-access-key"
  handler_filename = "users"
  handler_entry_point = "validateAccessKey"

  environment_variables = {
    JWT_SECRET = local.JWT_SECRET
    DYNAMODB_ACCESS_KEY_TABLE = local.table_access_key_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

module "lambda_fetch_access_key" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/users/fetch-access-key"
  handler_filename = "users"
  handler_entry_point = "fetchAccessKey"

  environment_variables = {
    SIGNUP_SECRET = local.SIGNUP_SECRET
    DYNAMODB_PRE_INITIALIZATION_USERS_TABLE = local.table_pre_initialization_users_name
    DYNAMODB_ACCESS_KEY_TABLE = local.table_access_key_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

# Submissions Functions
module "lambda_submissions_add_category" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/submissions/add-category"
  handler_filename = "submissions"
  handler_entry_point = "addCategory"

  environment_variables = {
    DYNAMODB_USERS_TABLE = local.table_users_name
    DYNAMODB_SUBMISSIONS_TABLE = local.table_submissions_name
    JWT_SECRET = local.JWT_SECRET
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

module "lambda_submissions_get" {
  source = "./modules/default-lambda"

  method = "GET"
  path = "/submissions"
  handler_filename = "submissions"
  handler_entry_point = "get"

  environment_variables = {
    DYNAMODB_USERS_TABLE = local.table_users_name
    DYNAMODB_SUBMISSIONS_TABLE = local.table_submissions_name
    JWT_SECRET = local.JWT_SECRET
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

# Ratings functions
module "lambda_create_rating" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/ratings"
  handler_filename = "ratings"
  handler_entry_point = "create"

  environment_variables = {
    DYNAMODB_RATINGS_TABLE = local.table_ratings_name
    DYNAMODB_USERS_TABLE = local.table_users_name
    JWT_SECRET = local.JWT_SECRET
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}

# TOS Refusal functions
module "lambda_TOS_refusal_message_create" {
  source = "./modules/default-lambda"

  method = "POST"
  path = "/tos-refusal"
  handler_filename = "tos-refusal"
  handler_entry_point = "create"

  environment_variables = {
    DYNAMODB_TOS_REFUSAL_MESSAGE_TABLE = local.table_tos_refusal_message_name
  }

  project_prefix = local.project_prefix
  environment_name = local.environment_name
	api_gateway_id = aws_apigatewayv2_api.lambda.id
  api_gateway_execution_arn = aws_apigatewayv2_api.lambda.execution_arn
  code_bucket = aws_s3_bucket.s3_lambda_source_code_bucket.bucket
}
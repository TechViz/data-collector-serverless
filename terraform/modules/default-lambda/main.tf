resource "aws_iam_role" "iam_for_lambda" {
  name = "iam-${local.lambda_name}"
  inline_policy {
    name   = "lambda_policy"
    policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Action": ["dynamodb:*", "lambda:*"],
			"Effect": "Allow",
			"Resource": "*",
			"Sid": ""
		}
	]
}
EOF
  }

  assume_role_policy = <<EOF
{
	"Version": "2012-10-17",
	"Statement": [
		{
			"Action": "sts:AssumeRole",
			"Principal": {
				"Service": "lambda.amazonaws.com"
			},
			"Effect": "Allow",
			"Sid": ""
		}
	]
}
EOF
}

resource "aws_lambda_function" "lambda" {
  function_name = local.lambda_name
  role          = aws_iam_role.iam_for_lambda.arn
  handler       = "${var.handler_filename}.${var.handler_entry_point}"

  s3_bucket = var.code_bucket
  s3_key    = aws_s3_bucket_object.source_code_object.key

  runtime = "nodejs12.x"
  timeout = var.timeout

  source_code_hash = data.archive_file.lambda_code.output_base64sha256

  environment {
    variables = var.environment_variables
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_logs,
    aws_cloudwatch_log_group.log_group,
  ]
}

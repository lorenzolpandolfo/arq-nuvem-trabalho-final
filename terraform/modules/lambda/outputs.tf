output "function_name"    { value = aws_lambda_function.notificacao.function_name }
output "function_arn"     { value = aws_lambda_function.notificacao.arn }
output "api_endpoint"     { value = "${aws_apigatewayv2_api.lambda.api_endpoint}/notify" }

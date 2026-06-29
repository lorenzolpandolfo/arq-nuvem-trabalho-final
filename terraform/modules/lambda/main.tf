# ──────────────────────────────────────────────
# Lambda Serverless: Processador de Notificações
# Consome eventos do RabbitMQ via SQS (bridge)
# Atende ao requisito obrigatório da disciplina
# ──────────────────────────────────────────────

locals {
  name = "${var.project}-${var.environment}"
}

# ── IAM Role para a Lambda ────────────────────
resource "aws_iam_role" "lambda" {
  name = "${local.name}-lambda-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_basic" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_vpc" {
  role       = aws_iam_role.lambda.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
}

resource "aws_iam_role_policy" "lambda_ses" {
  name = "${local.name}-lambda-ses-policy"
  role = aws_iam_role.lambda.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = ["ses:SendEmail", "ses:SendRawEmail"]
      Resource = "*"
    }]
  })
}

# ── Security Group da Lambda ──────────────────
resource "aws_security_group" "lambda" {
  name        = "${local.name}-sg-lambda"
  description = "SG da funcao Lambda"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-sg-lambda" }
}

# ── Código da Lambda (inline zip) ────────────
# Em produção, substituir pelo zip do seu código real
data "archive_file" "lambda_zip" {
  type        = "zip"
  output_path = "/tmp/lambda_notificacao.zip"

  source {
    content  = <<-PYTHON
import json
import logging
import os

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    """
    Função serverless de notificação.
    Processa eventos de novos posts/likes e envia notificações.
    
    Pode ser triggerada via:
    - API Gateway (POST /notify)
    - SQS (fila de eventos do RabbitMQ)
    - EventBridge (agendamento)
    """
    logger.info(f"Evento recebido: {json.dumps(event)}")
    
    for record in event.get("Records", [event]):
        body = record.get("body", record)
        if isinstance(body, str):
            body = json.loads(body)
        
        event_type = body.get("type", "unknown")
        user_id    = body.get("user_id")
        
        logger.info(f"Processando evento '{event_type}' para usuario {user_id}")
        
        # Aqui viria a lógica de notificação:
        # - Enviar e-mail via SES
        # - Push notification
        # - Registrar no banco
        
        if event_type == "new_post":
            logger.info(f"Novo post criado pelo usuario {user_id}")
        elif event_type == "new_like":
            logger.info(f"Usuario {user_id} recebeu um like")
        elif event_type == "new_follower":
            logger.info(f"Usuario {user_id} ganhou um seguidor")
    
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Notificacoes processadas com sucesso"})
    }
    PYTHON
    filename = "lambda_function.py"
  }
}

# ── Lambda Function ───────────────────────────
resource "aws_lambda_function" "notificacao" {
  function_name    = "${local.name}-notificacao"
  role             = aws_iam_role.lambda.arn
  runtime          = "python3.12"
  handler          = "lambda_function.handler"
  filename         = data.archive_file.lambda_zip.output_path
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256
  timeout          = 30
  memory_size      = 128

  vpc_config {
    subnet_ids         = var.private_subnet_ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      RABBITMQ_URL = var.rabbitmq_url
      LOG_LEVEL    = "INFO"
    }
  }

  tags = { Name = "${local.name}-lambda-notificacao" }
}

# ── CloudWatch Log Group ──────────────────────
resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.notificacao.function_name}"
  retention_in_days = 7
}

# ── API Gateway HTTP (trigger HTTP para a Lambda) ──
resource "aws_apigatewayv2_api" "lambda" {
  name          = "${local.name}-lambda-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id      = aws_apigatewayv2_api.lambda.id
  name        = "$default"
  auto_deploy = true
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id             = aws_apigatewayv2_api.lambda.id
  integration_type   = "AWS_PROXY"
  integration_uri    = aws_lambda_function.notificacao.invoke_arn
}

resource "aws_apigatewayv2_route" "lambda" {
  api_id    = aws_apigatewayv2_api.lambda.id
  route_key = "POST /notify"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.notificacao.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.lambda.execution_arn}/*/*"
}

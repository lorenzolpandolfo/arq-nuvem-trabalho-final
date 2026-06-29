output "frontend_url" {
  description = "URL pública do frontend via CloudFront"
  value       = "https://${module.frontend.cloudfront_domain}"
}

output "api_gateway_url" {
  description = "URL do API Gateway (Nginx ALB)"
  value       = "http://${module.ec2.nginx_alb_dns}"
}

output "grafana_url" {
  description = "URL do Grafana (porta 3000)"
  value       = "http://${module.monitoring.monitoring_public_ip}:3000"
}

output "prometheus_url" {
  description = "URL do Prometheus (porta 9090)"
  value       = "http://${module.monitoring.monitoring_public_ip}:9090"
}

output "rabbitmq_dashboard_url" {
  description = "URL do dashboard do RabbitMQ (porta 15672)"
  value       = "http://${module.rabbitmq.rabbitmq_endpoint}:15672"
}

output "customer_db_endpoint" {
  description = "Endpoint do banco PostgreSQL do customer-service"
  value       = module.rds.customer_db_endpoint
  sensitive   = true
}

output "content_db_endpoint" {
  description = "Endpoint do banco PostgreSQL do content-service"
  value       = module.rds.content_db_endpoint
  sensitive   = true
}

output "lambda_function_name" {
  description = "Nome da função Lambda serverless"
  value       = module.lambda.function_name
}

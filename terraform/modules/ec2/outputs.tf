output "nginx_alb_dns"            { value = aws_lb.nginx.dns_name }
output "customer_service_private_ip" { value = aws_instance.customer_service.private_ip }
output "content_service_private_ip"  { value = aws_instance.content_service.private_ip }
output "app_sg_id"                { value = aws_security_group.app.id }

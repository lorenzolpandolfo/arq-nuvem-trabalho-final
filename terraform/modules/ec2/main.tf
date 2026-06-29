# ──────────────────────────────────────────────
# EC2: customer-service, content-service e Nginx (API Gateway)
# Application Load Balancer na frente do Nginx
# ──────────────────────────────────────────────

locals {
  name = "${var.project}-${var.environment}"
}

# ── Security Groups ───────────────────────────

# SG das aplicações (customer-service e content-service)
resource "aws_security_group" "app" {
  name        = "${local.name}-sg-app"
  description = "SG dos microsservicos FastAPI"
  vpc_id      = var.vpc_id

  ingress {
    description = "FastAPI customer-service"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    description = "FastAPI content-service"
    from_port   = 8001
    to_port     = 8001
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  ingress {
    description = "SSH (restrito à VPC)"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-sg-app" }
}

# SG do ALB (Nginx)
resource "aws_security_group" "alb" {
  name        = "${local.name}-sg-alb"
  description = "SG do Application Load Balancer / Nginx"
  vpc_id      = var.vpc_id

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-sg-alb" }
}

# ── User Data scripts ─────────────────────────

locals {
  customer_userdata = <<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin git
    systemctl enable docker && systemctl start docker

    # Clonar repositório
    git clone https://github.com/lorenzolpandolfo/arq-nuvem-trabalho-final /app
    cd /app/customer_service

    # Configurar variáveis de ambiente
    cat > .env <<'ENVFILE'
    DATABASE_URL=${var.customer_db_url}
    RABBITMQ_URL=${var.rabbitmq_url}
    SECRET_KEY=$(openssl rand -hex 32)
    ENVFILE

    docker compose up -d
  EOF

  content_userdata = <<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin git
    systemctl enable docker && systemctl start docker

    git clone https://github.com/lorenzolpandolfo/arq-nuvem-trabalho-final /app
    cd /app/content_service

    cat > .env <<'ENVFILE'
    DATABASE_URL=${var.content_db_url}
    RABBITMQ_URL=${var.rabbitmq_url}
    ENVFILE

    docker compose up -d
  EOF
}

# ── EC2: customer-service ─────────────────────
resource "aws_instance" "customer_service" {
  ami                    = var.customer_service_ami
  instance_type          = var.instance_type
  subnet_id              = var.private_subnet_ids[0]
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = var.key_pair_name
  user_data              = base64encode(local.customer_userdata)

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = { Name = "${local.name}-customer-service" }
}

# ── EC2: content-service ──────────────────────
resource "aws_instance" "content_service" {
  ami                    = var.content_service_ami
  instance_type          = var.instance_type
  subnet_id              = var.private_subnet_ids[1]
  vpc_security_group_ids = [aws_security_group.app.id]
  key_name               = var.key_pair_name
  user_data              = base64encode(local.content_userdata)

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = { Name = "${local.name}-content-service" }
}

# ── EC2: Nginx (API Gateway) ──────────────────
resource "aws_instance" "nginx" {
  ami                         = var.customer_service_ami
  instance_type               = var.instance_type
  subnet_id                   = var.public_subnet_ids[0]
  vpc_security_group_ids      = [aws_security_group.alb.id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  user_data = base64encode(<<-EOF
    #!/bin/bash
    apt-get update -y
    apt-get install -y nginx

    cat > /etc/nginx/conf.d/api-gateway.conf <<'NGINX'
    upstream customer_service {
        server ${aws_instance.customer_service.private_ip}:8000;
    }
    upstream content_service {
        server ${aws_instance.content_service.private_ip}:8001;
    }
    server {
        listen 80;
        location /api/auth/ {
            proxy_pass http://customer_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        location /api/users/ {
            proxy_pass http://customer_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
        location /api/content/ {
            proxy_pass http://content_service;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
    NGINX

    systemctl enable nginx && systemctl restart nginx
  EOF
  )

  tags = { Name = "${local.name}-nginx-gateway" }
}

# ── Application Load Balancer ─────────────────
resource "aws_lb" "nginx" {
  name               = "${local.name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = var.public_subnet_ids

  tags = { Name = "${local.name}-alb" }
}

resource "aws_lb_target_group" "nginx" {
  name     = "${local.name}-tg-nginx"
  port     = 80
  protocol = "HTTP"
  vpc_id   = var.vpc_id

  health_check {
    path                = "/"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }
}

resource "aws_lb_target_group_attachment" "nginx" {
  target_group_arn = aws_lb_target_group.nginx.arn
  target_id        = aws_instance.nginx.id
  port             = 80
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.nginx.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.nginx.arn
  }
}

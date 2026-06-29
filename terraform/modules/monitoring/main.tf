# ──────────────────────────────────────────────
# Monitoring: Instância EC2 dedicada ao Prometheus + Grafana
# Mesma stack do ambiente local, agora na AWS
# ──────────────────────────────────────────────

locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_security_group" "monitoring" {
  name        = "${local.name}-sg-monitoring"
  description = "SG da instancia de monitoramento"
  vpc_id      = var.vpc_id

  ingress {
    description = "Grafana"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Prometheus"
    from_port   = 9090
    to_port     = 9090
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description     = "Scrape dos servicos (porta 8000 e 8001)"
    from_port       = 8000
    to_port         = 8001
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-sg-monitoring" }
}

resource "aws_instance" "monitoring" {
  ami                         = var.monitoring_ami
  instance_type               = "t3.small"   # Prometheus precisa de um pouco mais de memória
  subnet_id                   = var.public_subnet_ids[0]
  vpc_security_group_ids      = [aws_security_group.monitoring.id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  user_data = base64encode(<<-EOF
    #!/bin/bash
    set -e
    apt-get update -y
    apt-get install -y docker.io docker-compose-plugin
    systemctl enable docker && systemctl start docker

    mkdir -p /opt/monitoring
    cat > /opt/monitoring/docker-compose.yml <<'COMPOSE'
    version: "3.8"
    services:
      prometheus:
        image: prom/prometheus:latest
        container_name: prometheus
        ports:
          - "9090:9090"
        volumes:
          - ./prometheus.yml:/etc/prometheus/prometheus.yml
          - prometheus_data:/prometheus
        command:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.retention.time=15d'
        restart: unless-stopped

      grafana:
        image: grafana/grafana:latest
        container_name: grafana
        ports:
          - "3000:3000"
        environment:
          - GF_SECURITY_ADMIN_USER=admin
          - GF_SECURITY_ADMIN_PASSWORD=admin
          - GF_USERS_ALLOW_SIGN_UP=false
        volumes:
          - grafana_data:/var/lib/grafana
        restart: unless-stopped
        depends_on:
          - prometheus

    volumes:
      prometheus_data:
      grafana_data:
    COMPOSE

    # prometheus.yml será gerado com os IPs das instâncias pelo Terraform
    cat > /opt/monitoring/prometheus.yml <<'PROM'
    global:
      scrape_interval: 15s
      evaluation_interval: 15s

    scrape_configs:
      - job_name: 'customer-service'
        static_configs:
          - targets: ['CUSTOMER_IP:8000']
        metrics_path: '/metrics'

      - job_name: 'content-service'
        static_configs:
          - targets: ['CONTENT_IP:8001']
        metrics_path: '/metrics'

      - job_name: 'prometheus'
        static_configs:
          - targets: ['localhost:9090']
    PROM

    cd /opt/monitoring
    docker compose up -d
  EOF
  )

  root_block_device {
    volume_size = 30
    volume_type = "gp3"
  }

  tags = { Name = "${local.name}-monitoring" }
}

# IP Elástico para a instância de monitoring (URL estável)
resource "aws_eip" "monitoring" {
  instance = aws_instance.monitoring.id
  domain   = "vpc"
  tags     = { Name = "${local.name}-monitoring-eip" }
}

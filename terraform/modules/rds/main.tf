# ──────────────────────────────────────────────
# RDS PostgreSQL
# Um banco para customer-service, outro para content-service
# Rodando em subnet privada (sem acesso externo)
# ──────────────────────────────────────────────

locals {
  name = "${var.project}-${var.environment}"
}

resource "aws_db_subnet_group" "main" {
  name       = "${local.name}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
  tags       = { Name = "${local.name}-db-subnet-group" }
}

resource "aws_security_group" "rds" {
  name        = "${local.name}-sg-rds"
  description = "Acesso ao PostgreSQL somente pelos servicos da aplicacao"
  vpc_id      = var.vpc_id

  ingress {
    description     = "PostgreSQL"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.app_sg_id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${local.name}-sg-rds" }
}

# ── Banco do customer-service ─────────────────
resource "aws_db_instance" "customer" {
  identifier             = "${local.name}-customer-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = "customer_db"
  username               = "app"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true   # mude para false em produção real
  publicly_accessible    = false
  deletion_protection    = false  # mude para true em produção real

  tags = { Name = "${local.name}-customer-db" }
}

# ── Banco do content-service ──────────────────
resource "aws_db_instance" "content" {
  identifier             = "${local.name}-content-db"
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.t3.micro"
  allocated_storage      = 20
  storage_type           = "gp2"
  db_name                = "content_db"
  username               = "app"
  password               = var.db_password
  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  skip_final_snapshot    = true
  publicly_accessible    = false
  deletion_protection    = false

  tags = { Name = "${local.name}-content-db" }
}

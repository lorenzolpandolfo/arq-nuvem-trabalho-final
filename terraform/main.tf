terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Descomente para usar state remoto no S3 (recomendado em produção)
  # backend "s3" {
  #   bucket = "arq-nuvem-tfstate"
  #   key    = "prod/terraform.tfstate"
  #   region = var.aws_region
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "arq-nuvem-social"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}

# ──────────────────────────────────────────────
# MÓDULOS
# ──────────────────────────────────────────────

module "vpc" {
  source      = "./modules/vpc"
  project     = var.project
  environment = var.environment
  aws_region  = var.aws_region
}

module "rds" {
  source             = "./modules/rds"
  project            = var.project
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  db_password        = var.db_password
  app_sg_id          = module.ec2.app_sg_id
}

module "rabbitmq" {
  source             = "./modules/rabbitmq"
  project            = var.project
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  app_sg_id          = module.ec2.app_sg_id
  rabbitmq_password  = var.rabbitmq_password
}

module "ec2" {
  source               = "./modules/ec2"
  project              = var.project
  environment          = var.environment
  vpc_id               = module.vpc.vpc_id
  public_subnet_ids    = module.vpc.public_subnet_ids
  private_subnet_ids   = module.vpc.private_subnet_ids
  key_pair_name        = var.key_pair_name
  customer_service_ami = var.app_ami
  content_service_ami  = var.app_ami
  instance_type        = var.instance_type

  # Injeção de variáveis de ambiente para os serviços
  customer_db_url  = "postgresql://app:${var.db_password}@${module.rds.customer_db_endpoint}/customer_db"
  content_db_url   = "postgresql://app:${var.db_password}@${module.rds.content_db_endpoint}/content_db"
  rabbitmq_url     = "amqp://admin:${var.rabbitmq_password}@${module.rabbitmq.rabbitmq_endpoint}:5672/"
}

module "frontend" {
  source      = "./modules/frontend"
  project     = var.project
  environment = var.environment
  api_gateway_dns = module.ec2.nginx_alb_dns
}

module "lambda" {
  source      = "./modules/lambda"
  project     = var.project
  environment = var.environment
  vpc_id      = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  rabbitmq_url = "amqp://admin:${var.rabbitmq_password}@${module.rabbitmq.rabbitmq_endpoint}:5672/"
}

module "monitoring" {
  source             = "./modules/monitoring"
  project            = var.project
  environment        = var.environment
  vpc_id             = module.vpc.vpc_id
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
  app_sg_id          = module.ec2.app_sg_id
  key_pair_name      = var.key_pair_name
  monitoring_ami     = var.app_ami
}

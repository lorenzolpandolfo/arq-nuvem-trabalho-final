variable "aws_region" {
  description = "Região AWS onde os recursos serão criados"
  type        = string
  default     = "us-east-1"
}

variable "project" {
  description = "Nome do projeto (usado como prefixo nos recursos)"
  type        = string
  default     = "arq-nuvem"
}

variable "environment" {
  description = "Ambiente (prod, staging, dev)"
  type        = string
  default     = "prod"
}

variable "app_ami" {
  description = "ID da AMI para as instâncias EC2 (Ubuntu 22.04 LTS)"
  type        = string
  default     = "ami-0c7217cdde317cfec" # Ubuntu 22.04 us-east-1
}

variable "instance_type" {
  description = "Tipo de instância EC2"
  type        = string
  default     = "t3.micro" # Free tier eligible
}

variable "key_pair_name" {
  description = "Nome do Key Pair para acesso SSH às instâncias EC2"
  type        = string
  # Crie via: aws ec2 create-key-pair --key-name arq-nuvem-key
}

variable "db_password" {
  description = "Senha do banco de dados PostgreSQL"
  type        = string
  sensitive   = true
}

variable "rabbitmq_password" {
  description = "Senha do RabbitMQ (usuário: admin)"
  type        = string
  sensitive   = true
}

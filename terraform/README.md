# Infraestrutura AWS — Terraform
### Arquitetura de Computação em Nuvem — UniSenac 2026-1

## Visão Geral da Arquitetura

```
Internet
    │
    ▼
[CloudFront CDN]──────── S3 (React SPA)
    │
    ▼
[ALB - Application Load Balancer]  (público)
    │
    ▼
[EC2: Nginx API Gateway]  (pública)
    ├────────────────────────────────────┐
    ▼                                    ▼
[EC2: customer-service]        [EC2: content-service]
    │   (FastAPI, porta 8000)       │   (FastAPI, porta 8001)
    ▼                               ▼
[RDS PostgreSQL: customer_db] [RDS PostgreSQL: content_db]
    └──────────────┬───────────────┘
                   ▼
         [Amazon MQ: RabbitMQ]  ←── [Lambda: notificacao]
                   
         [EC2: Monitoring]
           ├── Prometheus :9090
           └── Grafana    :3000
```

## Pré-requisitos

- [Terraform >= 1.5](https://developer.hashicorp.com/terraform/install)
- [AWS CLI](https://aws.amazon.com/cli/) configurado (`aws configure`)
- Key Pair criado na AWS:
  ```bash
  aws ec2 create-key-pair --key-name arq-nuvem-key \
    --query 'KeyMaterial' --output text > arq-nuvem-key.pem
  chmod 400 arq-nuvem-key.pem
  ```

## Como usar

### 1. Configurar variáveis

```bash
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars com suas senhas e configurações
```

### 2. Inicializar e aplicar

```bash
terraform init
terraform plan    # revisar o que será criado
terraform apply   # confirmar com 'yes'
```

### 3. Deploy do Frontend

Após o `terraform apply`, fazer o build e deploy do React:

```bash
cd ../app
npm run build

# Pegar o nome do bucket do output do Terraform:
BUCKET=$(terraform -chdir=../terraform output -raw s3_bucket_name)
DIST_ID=$(terraform -chdir=../terraform output -raw cloudfront_id)

aws s3 sync dist/ s3://$BUCKET --delete
aws cloudfront create-invalidation --distribution-id $DIST_ID --paths "/*"
```

### 4. Acessar os serviços

```bash
terraform output   # mostra todas as URLs
```

| Serviço        | URL                                         |
|----------------|---------------------------------------------|
| Frontend       | `https://<cloudfront_domain>`               |
| API Gateway    | `http://<alb_dns>`                          |
| Grafana        | `http://<monitoring_ip>:3000`               |
| Prometheus     | `http://<monitoring_ip>:9090`               |
| Lambda notify  | `POST https://<api_endpoint>/notify`        |

### 5. Destruir a infraestrutura

```bash
terraform destroy   # CUIDADO: remove tudo
```

## Estrutura de arquivos

```
terraform/
├── main.tf                    # Entrypoint — chama todos os módulos
├── variables.tf               # Variáveis globais
├── outputs.tf                 # Outputs (URLs, endpoints)
├── terraform.tfvars.example   # Exemplo de variáveis (commitar)
├── .gitignore
└── modules/
    ├── vpc/        # VPC, subnets, NAT Gateway
    ├── ec2/        # customer-service, content-service, Nginx + ALB
    ├── rds/        # PostgreSQL (dois bancos separados)
    ├── rabbitmq/   # Amazon MQ (RabbitMQ gerenciado)
    ├── frontend/   # S3 + CloudFront
    ├── lambda/     # Função serverless de notificação
    └── monitoring/ # Prometheus + Grafana
```

## Requisito Serverless

A função Lambda `arq-nuvem-prod-notificacao` atende ao requisito da disciplina.
Ela pode ser invocada via HTTP:

```bash
curl -X POST https://<api_endpoint>/notify \
  -H "Content-Type: application/json" \
  -d '{"type": "new_post", "user_id": "123"}'
```

Ou integrada ao RabbitMQ/SQS para processar eventos assíncronos da plataforma.

## Estimativa de Custo (Free Tier)

| Serviço         | Instância   | Custo estimado/mês |
|-----------------|-------------|--------------------|
| EC2 (×3)        | t3.micro    | ~$0 (free tier)    |
| EC2 monitoring  | t3.small    | ~$15               |
| RDS (×2)        | db.t3.micro | ~$30               |
| Amazon MQ       | mq.t3.micro | ~$18               |
| CloudFront      | —           | ~$0 (baixo tráfego)|
| Lambda          | —           | ~$0 (free tier)    |
| **Total**       |             | **~$63/mês**       |

> Para o trabalho, lembre de rodar `terraform destroy` ao terminar para evitar cobranças.

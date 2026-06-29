variable "project"              { type = string }
variable "environment"          { type = string }
variable "vpc_id"               { type = string }
variable "public_subnet_ids"    { type = list(string) }
variable "private_subnet_ids"   { type = list(string) }
variable "key_pair_name"        { type = string }
variable "customer_service_ami" { type = string }
variable "content_service_ami"  { type = string }
variable "instance_type"        { type = string }
variable "customer_db_url"      { type = string; sensitive = true }
variable "content_db_url"       { type = string; sensitive = true }
variable "rabbitmq_url"         { type = string; sensitive = true }

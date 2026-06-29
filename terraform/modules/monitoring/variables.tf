variable "project"            { type = string }
variable "environment"        { type = string }
variable "vpc_id"             { type = string }
variable "public_subnet_ids"  { type = list(string) }
variable "private_subnet_ids" { type = list(string) }
variable "app_sg_id"          { type = string }
variable "key_pair_name"      { type = string }
variable "monitoring_ami"     { type = string }

output "url" {
  description = "La URL de preprod."
  value       = "http://201.32.128.192:${var.puerto}"
}

output "salud" {
  description = "El endpoint de vida, que toca la base y dice qué commit corre."
  value       = "http://201.32.128.192:${var.puerto}/salud"
}

output "app_password" {
  description = "La contraseña para entrar. `terraform output -raw app_password`."
  value       = random_password.app.result
  sensitive   = true
}

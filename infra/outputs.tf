output "url" {
  description = "La URL de preprod."
  value       = "http://52.67.201.116:${var.puerto}"
}

output "salud" {
  description = "El endpoint de vida, que toca la base y dice qué commit corre."
  value       = "http://52.67.201.116:${var.puerto}/salud"
}

output "app_password" {
  description = "La contraseña para entrar. `terraform output -raw app_password`."
  value       = random_password.app.result
  sensitive   = true
}

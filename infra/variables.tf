variable "docker_host" {
  description = "Dónde corre Docker. El VPS, por SSH, como el usuario de deploy."
  type        = string
  default     = "ssh://notia-deploy@201.32.128.192:5078"
}

variable "ssh_key" {
  description = "Ruta a la clave privada SSH del usuario de deploy. La ruta, no la clave: la clave nunca entra al código."
  type        = string
}

variable "imagen_tag" {
  description = "La imagen del registry que corre preprod: sha-<commit>, la misma que publica el pipeline."
  type        = string
}

variable "puerto" {
  description = "El único puerto que preprod publica."
  type        = number
  default     = 8083
}

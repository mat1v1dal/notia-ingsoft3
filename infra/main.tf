provider "docker" {
  host     = var.docker_host
  ssh_opts = ["-i", var.ssh_key, "-o", "IdentitiesOnly=yes"]
}

locals {
  entorno = "preprod"
  nombre  = "notia-${local.entorno}"

  # Los mismos que el daemon del VPS pone por defecto (/etc/docker/daemon.json).
  # Si no se declaran, Docker los aplica igual, el estado los lee, y el plan
  # siguiente ve una diferencia que fuerza a recrear cada contenedor: el
  # segundo `plan` nunca diría «No changes».
  logs = { "max-size" = "10m", "max-file" = "3" }
}

# ── secretos: los genera Terraform, no se escriben en ningún lado ──────────
resource "random_password" "postgres" {
  length  = 32
  special = false
}

resource "random_password" "app" {
  length  = 20
  special = false
}

resource "random_password" "secret" {
  length  = 48
  special = false
}

resource "random_password" "webhook" {
  length  = 48
  special = false
}

# ── red y datos ──────────────────────────────────────────────────────────
resource "docker_network" "preprod" {
  name = local.nombre
}

resource "docker_volume" "pgdata" {
  name = "${local.nombre}_pgdata"
}

# ── imágenes ─────────────────────────────────────────────────────────────
resource "docker_image" "postgres" {
  name         = "postgres:16-alpine"
  keep_locally = true
}

resource "docker_image" "api" {
  name         = "ghcr.io/mat1v1dal/notia-api:${var.imagen_tag}"
  keep_locally = true
}

resource "docker_image" "web" {
  name         = "ghcr.io/mat1v1dal/notia-web:${var.imagen_tag}"
  keep_locally = true
}

# ── contenedores ─────────────────────────────────────────────────────────
resource "docker_container" "postgres" {
  name       = "${local.nombre}-postgres"
  log_driver = "json-file"
  log_opts   = local.logs
  image      = docker_image.postgres.image_id
  restart    = "unless-stopped"
  command    = ["postgres", "-c", "shared_buffers=64MB", "-c", "max_connections=30"]
  memory     = 256
  # Docker pone el swap en el doble de la memoria si no se dice: declararlo
  # evita que cada plan quiera «corregirlo».
  memory_swap = 512

  env = [
    "POSTGRES_USER=notia",
    "POSTGRES_PASSWORD=${random_password.postgres.result}",
    "POSTGRES_DB=notia",
  ]

  networks_advanced {
    name = docker_network.preprod.id
  }

  volumes {
    volume_name    = docker_volume.pgdata.name
    container_path = "/var/lib/postgresql/data"
  }

  healthcheck {
    test     = ["CMD-SHELL", "pg_isready -U notia -d notia"]
    interval = "5s"
    timeout  = "5s"
    retries  = 10
  }

  wait = true
}

resource "docker_container" "api" {
  name       = "${local.nombre}-api"
  log_driver = "json-file"
  log_opts   = local.logs
  image      = docker_image.api.image_id
  restart    = "unless-stopped"
  memory     = 384
  # Docker pone el swap en el doble de la memoria si no se dice: declararlo
  # evita que cada plan quiera «corregirlo».
  memory_swap = 768

  env = [
    # DERIVADA: el host es el nombre del contenedor de Postgres y la
    # contraseña es la que Terraform generó. No se copia de ningún lado.
    "DATABASE_URL=postgres://notia:${random_password.postgres.result}@${docker_container.postgres.name}:5432/notia",
    "APP_PASSWORD=${random_password.app.result}",
    "APP_SECRET=${random_password.secret.result}",
    "WEBHOOK_TOKEN=${random_password.webhook.result}",
    "PORT=3000",
  ]

  networks_advanced {
    name = docker_network.preprod.id
  }

  healthcheck {
    test         = ["CMD-SHELL", "wget -qO- http://localhost:3000/salud || exit 1"]
    interval     = "10s"
    timeout      = "5s"
    retries      = 5
    start_period = "20s"
  }

  wait         = true
  wait_timeout = 120
}

resource "docker_container" "web" {
  name       = "${local.nombre}-web"
  log_driver = "json-file"
  log_opts   = local.logs
  image      = docker_image.web.image_id
  restart    = "unless-stopped"
  memory     = 64
  # Docker pone el swap en el doble de la memoria si no se dice: declararlo
  # evita que cada plan quiera «corregirlo».
  memory_swap = 128

  env = [
    # DERIVADA: la dirección del backend sale del contenedor de la API.
    "BACKEND_URL=http://${docker_container.api.name}:3000",
    "DNS_RESOLVER=127.0.0.11",
  ]

  networks_advanced {
    name = docker_network.preprod.id
  }

  ports {
    internal = 80
    external = var.puerto
  }
}

terraform {
  required_version = ">= 1.9"

  required_providers {
    # Plan C con provider Docker: el preprod corre en el mismo VPS que QA y
    # PROD, como contenedores. Versiones fijadas: un `apply` de marzo tiene
    # que producir lo mismo que el de hoy.
    docker = {
      source  = "kreuzwerker/docker"
      version = "3.6.2"
    }
    random = {
      source  = "hashicorp/random"
      version = "3.7.2"
    }
  }
}

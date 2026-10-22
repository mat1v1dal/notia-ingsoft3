# infra: el entorno `preprod`, como código

Un entorno entero de notia —Postgres, API y web, corriendo las imágenes que
publica el pipeline— que nace y muere con un comando. Vive en el mismo VPS
que QA y PROD, como contenedores, y **no los toca**: tiene su red, su
volumen y su puerto (8083).

## Requisitos

- Terraform ≥ 1.9.
- La clave SSH del usuario de deploy del VPS.

## Nacer

```bash
cd infra
cat > preprod.auto.tfvars <<'VARS'      # ignorado por git
ssh_key    = "/ruta/a/la/clave/del/usuario/de/deploy"
imagen_tag = "sha-<commit>"             # la imagen del registry que corre
VARS
terraform init
terraform apply
curl "$(terraform output -raw salud)"   # → {"ok":true,"db":true,"commit":"<commit>"}
terraform output -raw app_password      # la contraseña para entrar
```

## Morir

```bash
terraform destroy
```

Se lleva todo: contenedores, red y volumen. QA y PROD siguen intactos.

## Qué se deriva y qué no

- `DATABASE_URL` de la API se arma con el nombre del contenedor de Postgres
  y la contraseña que genera Terraform: no se copia de ningún lado.
- `BACKEND_URL` del front sale del nombre del contenedor de la API.
- Los secretos los genera `random_password` y viven sólo en el estado, que
  no se versiona.

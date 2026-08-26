# Evidencias

---

## TP1 — Git colaborativo

### 1. Push directo a `main` rechazado

La protección alcanza también al dueño del repositorio (*Do not allow
bypassing*). Intento real contra `origin/main`:

```console
$ echo "" >> .gitignore
$ git commit -am "test: intento de push directo"
$ git push
remote: error: GH006: Protected branch update failed for refs/heads/main.
remote:
remote: - Changes must be made through a pull request.
To https://github.com/mat1v1dal/notia-ingsoft3.git
 ! [remote rejected] main -> main (protected branch hook declined)
error: failed to push some refs to 'https://github.com/mat1v1dal/notia-ingsoft3.git'
```

`protected branch hook declined` es el rechazo **del lado del servidor**: el
commit llegó a existir en local, pero nunca entró a `main`. Después se deshizo
con `git reset --hard HEAD~1`.

La configuración que lo produce, leída de vuelta desde la API:

```console
$ gh api repos/mat1v1dal/notia-ingsoft3/branches/main/protection \
    -q '{aprobaciones: .required_pull_request_reviews.required_approving_review_count, sin_bypass: .enforce_admins.enabled}'
{"aprobaciones":0,"sin_bypass":true}
```

> 📸 **Falta la captura de pantalla** de *Settings → Branches* con la regla
> configurada. Sacarla antes de entregar.

### 2. El PR con el conflicto

[PR #3 — *docs: nombrar la app del semestre*](../../pull/3)

Al mergearse el [PR #2](../../pull/2), que reescribió el mismo párrafo del
README, GitHub marcó el #3 como no mergeable:

```console
$ gh pr view 3 --json number,mergeable,mergeStateStatus
{"mergeStateStatus":"DIRTY","mergeable":"CONFLICTING","number":3}
```

En la web esto se ve como *"This branch has conflicts that must be resolved"*,
con el botón de merge deshabilitado.

> 📸 **Falta la captura** del PR #3 mostrando ese aviso.

### 3. Los marcadores del conflicto

Traer `main` a la rama para resolver en local:

```console
$ git merge origin/main
Auto-merging README.md
CONFLICT (content): Merge conflict in README.md
Automatic merge failed; fix conflicts and then commit the result.
```

Y el archivo, con las dos versiones enfrentadas:

```text
<<<<<<< HEAD
La **app del semestre** es [notia](https://github.com/mat1v1dal/notia) y entra
a este mismo repositorio en el TP2. Hasta entonces acá vive el flujo de
trabajo y nada más.
=======
La **app del semestre** se elige en el TP2 y entra a este mismo repositorio,
con su propio arranque documentado. Hasta entonces acá vive el flujo de
trabajo y nada más: no hay nada para levantar todavía.
>>>>>>> origin/main
```

- `<<<<<<< HEAD` … `=======` → lo que traía **mi rama**.
- `=======` … `>>>>>>> origin/main` → lo que traía **main**.

Resuelto quedándome con los dos lados, porque eran datos complementarios y no
versiones alternativas del mismo dato. El razonamiento completo está en
[`decisiones.md`](decisiones.md).

### 4. La release publicada

Tag `v1.0.0` sobre `main`, con su release en la pestaña *Releases*.

> 📸 **Falta la captura** de la release publicada.

---

## Resumen del historial

```console
$ gh pr list --state merged --json number,title
#1  docs(sdd): fijar el flujo de trabajo y las condiciones del uso de IA
#2  docs: aclarar que todavía no hay nada para levantar
#3  docs: nombrar la app del semestre          ← el del conflicto
#4  docs: decisiones y evidencias del TP1
```

Todo cambio entró por pull request, incluidos estos dos archivos: es lo que
las protecciones dejaron configurado y no hay forma de saltearlo.

import { useCallback, useEffect, useState } from "react";
import { SinSesion } from "./api.js";
import { versionCorta } from "./version.js";
import { Buscar } from "./vistas/Buscar.js";
import { Chats } from "./vistas/Chats.js";
import { Entrar } from "./vistas/Entrar.js";
import { Inbox } from "./vistas/Inbox.js";
import { Log } from "./vistas/Log.js";

/** Router por hash: la API redirige a /#/item/:id después de deshacer. */
function useRuta(): string {
  const [ruta, setRuta] = useState(() => location.hash.slice(1) || "/");
  useEffect(() => {
    const alCambiar = () => setRuta(location.hash.slice(1) || "/");
    addEventListener("hashchange", alCambiar);
    return () => removeEventListener("hashchange", alCambiar);
  }, []);
  return ruta;
}

const SECCIONES = [
  { href: "#/", etiqueta: "Pendientes" },
  { href: "#/buscar", etiqueta: "Buscar" },
  { href: "#/chats", etiqueta: "Chats" },
  { href: "#/log", etiqueta: "Log" },
];

/** El commit que corre en este entorno, según /salud. */
function useVersion(): string | null {
  const [version, setVersion] = useState<string | null>(null);
  useEffect(() => {
    fetch("/salud")
      .then((r) => r.json())
      .then((salud) => setVersion(versionCorta(salud)))
      .catch(() => setVersion(null));
  }, []);
  return version;
}

export function App() {
  const ruta = useRuta();
  const version = useVersion();
  const [conSesion, setConSesion] = useState(true);

  // Cualquier vista puede descubrir que la sesión venció; la app entera
  // cae al login en vez de dejar pantallas a medio cargar.
  const alFallar = useCallback((e: unknown) => {
    if (e instanceof SinSesion) setConSesion(false);
  }, []);

  if (!conSesion) return <Entrar alEntrar={() => setConSesion(true)} />;

  const base = ruta.split("?")[0] ?? "/";

  return (
    <>
      <div className="app">
        <header className="barra">
          <h1 className="marca">
            not<span>ia</span>
          </h1>
          {version ? (
            <span className="cuenta" title="El commit que corre en este entorno">
              v{version}
            </span>
          ) : null}
        </header>

        {base === "/" || base.startsWith("/item") ? <Inbox alFallar={alFallar} /> : null}
        {base === "/buscar" ? <Buscar alFallar={alFallar} /> : null}
        {base === "/chats" ? <Chats alFallar={alFallar} /> : null}
        {base === "/log" ? <Log alFallar={alFallar} /> : null}
      </div>

      <nav className="nav">
        {SECCIONES.map((s) => (
          <a
            key={s.href}
            href={s.href}
            aria-current={`#${base}` === s.href ? "page" : undefined}
          >
            {s.etiqueta}
          </a>
        ))}
      </nav>
    </>
  );
}

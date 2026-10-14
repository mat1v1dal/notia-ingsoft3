// Convierte el coverage-summary.json de vitest en la tabla que se ve en la
// página del run. Uso: node resumen-cobertura.mjs <lado> <ruta al json>
//
// Falla a propósito en dos casos que, si pasaran en silencio, dejarían el
// job verde sin haber medido nada: que el archivo no exista, y que exista
// pero con cero archivos medidos (un `include` que no matchea nada).
import { readFileSync } from "node:fs";

const [lado, ruta] = process.argv.slice(2);

let total;
try {
  total = JSON.parse(readFileSync(ruta, "utf8")).total;
} catch (e) {
  console.error(`no se pudo leer ${ruta}: ${e.message}`);
  process.exit(1);
}

if (!total.lines.total) {
  console.error("se midieron 0 archivos: revisá el `include` de la config de coverage");
  process.exit(1);
}

const fila = (nombre, m) => `| ${nombre} | ${m.pct}% | ${m.covered} / ${m.total} |`;
console.log(`### Cobertura del ${lado}`);
console.log("");
console.log("| métrica | % | cubierto / total |");
console.log("|---|---|---|");
console.log(fila("líneas", total.lines));
console.log(fila("ramas", total.branches));
console.log(fila("funciones", total.functions));
console.log("");
console.log("El reporte HTML completo está en los artefactos de esta corrida.");

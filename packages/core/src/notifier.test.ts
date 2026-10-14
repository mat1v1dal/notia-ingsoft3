import { expect, test, vi } from "vitest";
import { createEvolutionNotifier, type Fetch } from "./notifier.js";

const OPCIONES = {
  baseUrl: "http://evolution:8080",
  instance: "notia",
  apiKey: "clave-secreta",
  destinoJid: "5491122334455@s.whatsapp.net",
};

/** Una respuesta HTTP mínima, sin red. */
function respuesta(status: number, cuerpo = ""): Response {
  return { ok: status >= 200 && status < 300, status, text: async () => cuerpo } as Response;
}

test("manda el texto al chat propio, por la instancia configurada y con la apikey", async () => {
  // Arrange: un doble de fetch que acepta todo y registra con qué lo llamaron.
  const fetchDoble = vi.fn<Fetch>(async () => respuesta(201));
  const notifier = createEvolutionNotifier(OPCIONES, fetchDoble);

  // Act
  await notifier.send("⏰ Se viene:\n• entregar TP5 — 21:00");

  // Assert: una sola llamada, al endpoint de la instancia, y el destino es
  // el chat propio — nunca el grupo del que salió el item.
  expect(fetchDoble).toHaveBeenCalledTimes(1);
  const [url, init] = fetchDoble.mock.calls[0]!;
  expect(url).toBe("http://evolution:8080/message/sendText/notia");
  expect(init?.method).toBe("POST");
  expect((init?.headers as Record<string, string>).apikey).toBe("clave-secreta");
  expect(JSON.parse(init?.body as string)).toEqual({
    number: "5491122334455@s.whatsapp.net",
    text: "⏰ Se viene:\n• entregar TP5 — 21:00",
  });
});

test("si Evolution responde con error, send falla y el mensaje dice el status y el cuerpo", async () => {
  // Arrange: el doble simula una instancia caída.
  const fetchDoble = vi.fn<Fetch>(async () => respuesta(500, "instance not connected"));
  const notifier = createEvolutionNotifier(OPCIONES, fetchDoble);

  // Act + Assert: el error llega al que llamó (el worker lo loguea aislado),
  // y trae lo necesario para diagnosticar sin entrar a Evolution.
  await expect(notifier.send("hola")).rejects.toThrow(
    "Evolution respondió 500: instance not connected",
  );
});

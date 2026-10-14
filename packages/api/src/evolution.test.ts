import { expect, test } from "vitest";
import { normalizeEvolutionMessage } from "./evolution.js";

const base = {
  event: "messages.upsert",
  instance: "notia",
  data: {
    key: { remoteJid: "5491122334455@s.whatsapp.net", fromMe: false, id: "3EB0AAA" },
    pushName: "Ana",
    message: { conversation: "el TP3 se corre al viernes" },
    messageTimestamp: 1_754_838_180,
  },
};

test("un mensaje directo se normaliza con su jid, autor y texto", () => {
  const msg = normalizeEvolutionMessage(base);

  expect(msg).toEqual({
    jid: "5491122334455@s.whatsapp.net",
    nombre: "Ana",
    esGrupo: false,
    waMessageId: "3EB0AAA",
    autor: "Ana",
    body: "el TP3 se corre al viernes",
    sentAt: new Date(1_754_838_180 * 1000),
  });
});

test("en un grupo el jid es el del grupo y el autor es quien escribió", () => {
  const msg = normalizeEvolutionMessage({
    ...base,
    data: {
      ...base.data,
      key: {
        remoteJid: "120363000000000000@g.us",
        fromMe: false,
        id: "3EB0BBB",
        participant: "5491199887766@s.whatsapp.net",
      },
      pushName: "Juan",
    },
  });

  expect(msg?.jid).toBe("120363000000000000@g.us");
  expect(msg?.esGrupo).toBe(true);
  expect(msg?.autor).toBe("Juan");
});

test("el texto también se lee de extendedTextMessage", () => {
  const msg = normalizeEvolutionMessage({
    ...base,
    data: {
      ...base.data,
      message: { extendedTextMessage: { text: "mirá esto https://ejemplo.com/paper" } },
    },
  });

  expect(msg?.body).toBe("mirá esto https://ejemplo.com/paper");
});

test("los mensajes propios se aceptan: el chat con uno mismo es captura", () => {
  const msg = normalizeEvolutionMessage({
    ...base,
    data: { ...base.data, key: { ...base.data.key, fromMe: true } },
  });

  expect(msg).not.toBeNull();
  expect(msg?.autor).toBe("yo");
});

test("un evento que no es un mensaje se descarta", () => {
  expect(normalizeEvolutionMessage({ ...base, event: "connection.update" })).toBeNull();
});

test("un mensaje sin texto (sticker, imagen sin caption) se descarta", () => {
  expect(
    normalizeEvolutionMessage({
      ...base,
      data: { ...base.data, message: { stickerMessage: { url: "..." } } },
    }),
  ).toBeNull();
});

test("un payload malformado se descarta en vez de romper", () => {
  expect(normalizeEvolutionMessage(null)).toBeNull();
  expect(normalizeEvolutionMessage({})).toBeNull();
  expect(normalizeEvolutionMessage({ event: "messages.upsert", data: {} })).toBeNull();
  expect(normalizeEvolutionMessage("no soy un objeto")).toBeNull();
});

// ── de dónde sale el texto ──────────────────────────────────────────────────
// Una regla, cinco formas de llegar: WhatsApp manda el texto en un campo
// distinto según sea un mensaje plano, uno con link, o el caption de un adjunto.

test.each([
  { fuente: "conversation", message: { conversation: "el TP3 se corre al viernes" } },
  { fuente: "extendedTextMessage", message: { extendedTextMessage: { text: "el TP3 se corre al viernes" } } },
  { fuente: "caption de imageMessage", message: { imageMessage: { url: "…", caption: "el TP3 se corre al viernes" } } },
  { fuente: "caption de videoMessage", message: { videoMessage: { url: "…", caption: "el TP3 se corre al viernes" } } },
  { fuente: "caption de documentMessage", message: { documentMessage: { url: "…", caption: "el TP3 se corre al viernes" } } },
])("el texto se lee de $fuente", ({ message }) => {
  const msg = normalizeEvolutionMessage({ ...base, data: { ...base.data, message } });

  expect(msg?.body).toBe("el TP3 se corre al viernes");
});

test("un caption vacío o de solo espacios no cuenta como texto", () => {
  const msg = normalizeEvolutionMessage({
    ...base,
    data: { ...base.data, message: { imageMessage: { url: "…", caption: "   " } } },
  });

  expect(msg).toBeNull();
});

test("un timestamp inválido no produce una fecha inválida: se usa el momento de recepción", () => {
  const antes = Date.now();

  const msg = normalizeEvolutionMessage({
    ...base,
    data: { ...base.data, messageTimestamp: "no-es-un-numero" },
  });

  expect(msg?.sentAt.getTime()).not.toBeNaN();
  expect(msg!.sentAt.getTime()).toBeGreaterThanOrEqual(antes);
});

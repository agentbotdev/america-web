"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { MessageSquareText, X, Sparkles, Send, Minus, ChevronUp } from "lucide-react";
import { FLUJO, recomendar, type Opcion, type Paso, type Respuestas } from "./flujo";
import { ChatBody, type Burbuja } from "./chat-body";
import { useMounted } from "@/lib/use-client-hooks";
import type { Propiedad } from "@/types";

/* ------------------------------------------------------------------ */
/*  Asesor de América Cardozo — flujo guiado (sin LLM) para venta y    */
/*  alquiler de inmuebles.                                             */
/*  3 estados: cerrado (FAB) · abierto (panel) · minimizado (PIP).     */
/*  Vive en layout.tsx → su estado PERSISTE entre navegaciones del App */
/*  Router. Al elegir una propiedad navega a la ficha y minimiza a PIP. */
/* ------------------------------------------------------------------ */

type Modo = "cerrado" | "abierto" | "minimizado";

export function AsesorChat() {
  const reduce = useReducedMotion();
  const router = useRouter();

  const [modo, setModo] = useState<Modo>("cerrado");
  const [pasoId, setPasoId] = useState("inicio");
  const [burbujas, setBurbujas] = useState<Burbuja[]>([]);
  const [escribiendo, setEscribiendo] = useState(false);
  const [respuestas, setRespuestas] = useState<Respuestas>({});
  const [recomendados, setRecomendados] = useState<Propiedad[]>([]);
  const [interesados, setInteresados] = useState<Propiedad[]>([]);
  const [finalizado, setFinalizado] = useState(false);
  const [textoInput, setTextoInput] = useState("");
  const [tip, setTip] = useState(false);
  // Catálogo REAL para recomendar (mismo endpoint que favoritos). null = cargando.
  const [catalogo, setCatalogo] = useState<Propiedad[]>([]);
  // mounted: true solo tras hidratar (SSR-safe, sin setState en effect) → las
  // animaciones del FAB arrancan en cliente, sin hydration mismatch.
  const mounted = useMounted();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tooltip de bienvenida a los ~3.5s; se auto-oculta a los ~11s (una sola vez).
  // En el CSS se limita a desktop (lg+) para no tapar el contenido del hero en mobile.
  useEffect(() => {
    const show = setTimeout(() => setTip(true), 3500);
    const hide = setTimeout(() => setTip(false), 11000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  // Trae el catálogo real una sola vez (para que `recomendar` filtre stock real).
  useEffect(() => {
    let activo = true;
    fetch("/api/propiedades")
      .then((r) => r.json())
      .then((d: Propiedad[]) => activo && setCatalogo(Array.isArray(d) ? d : []))
      .catch(() => {});
    return () => {
      activo = false;
    };
  }, []);

  // Al abrir por primera vez, dispara el saludo del bot.
  useEffect(() => {
    if (modo === "abierto" && burbujas.length === 0) empujarBot(FLUJO.inicio.bot);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo]);

  // Autoscroll al último mensaje (solo cuando el panel está abierto).
  useEffect(() => {
    if (modo === "abierto") {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [burbujas, escribiendo, finalizado, recomendados, modo]);

  function empujarBot(texto: string) {
    setEscribiendo(true);
    const delay = reduce ? 200 : Math.min(1100, 350 + texto.length * 9);
    setTimeout(() => {
      setEscribiendo(false);
      setBurbujas((b) => [...b, { de: "bot", texto }]);
    }, delay);
  }

  // `respFinal` son las respuestas YA actualizadas con la última elección
  // (los setState son async, así que se las pasamos explícitas en vez de leer
  //  el estado stale del closure). Sin side-effects dentro de updaters → seguro
  //  en StrictMode.
  function avanzar(next: string, respFinal: Respuestas) {
    if (next === "reco") {
      setPasoId("reco");
      setTimeout(() => {
        const recos = recomendar(respFinal, catalogo);
        setRecomendados(recos);
        setInteresados(recos);
        empujarBot(
          recos.length
            ? "¡Tengo opciones para vos! 👇 Mirá estas propiedades que encajan con lo que buscás:"
            : "Con esto ya puedo asesorarte. Te paso con un asesor 🙌",
        );
        setTimeout(
          () => setFinalizado(true),
          recos.length ? (reduce ? 350 : 1400) : reduce ? 250 : 900,
        );
      }, 250);
      return;
    }
    if (next === "cierre") {
      setPasoId("cierre");
      setTimeout(() => {
        empujarBot("¡Perfecto! Te paso con un asesor por WhatsApp con tu consulta cargada 🙌");
        setTimeout(() => setFinalizado(true), reduce ? 250 : 1100);
      }, 250);
      return;
    }
    setPasoId(next);
    setTimeout(() => empujarBot(FLUJO[next].bot), 250);
  }

  function elegir(paso: Paso, op: Opcion) {
    setBurbujas((b) => [...b, { de: "user", texto: op.label }]);
    // Mezcla: la key del paso + cualquier dato extra que fije la opción (op.set).
    const respFinal: Respuestas = {
      ...respuestas,
      ...(paso.key ? { [paso.key]: op.value } : {}),
      ...(op.set ?? {}),
    };
    setRespuestas(respFinal);
    avanzar(op.next, respFinal);
  }

  function enviarTexto(paso: Paso) {
    const valor = textoInput.trim();
    if (!valor || !paso.input) return;
    setBurbujas((b) => [...b, { de: "user", texto: valor }]);
    const respFinal = { ...respuestas, [paso.input.key]: valor };
    setRespuestas(respFinal);
    setTextoInput("");
    avanzar(paso.input.next, respFinal);
  }

  // Click en miniatura → NO cierra: navega a la ficha y minimiza a PIP.
  function seleccionarPropiedad(p: Propiedad) {
    setInteresados((prev) => (prev.some((x) => x.id === p.id) ? prev : [...prev, p]));
    setModo("minimizado");
    router.push(`/propiedad/${p.slug}`);
  }

  function reiniciar() {
    setPasoId("inicio");
    setBurbujas([]);
    setRespuestas({});
    setRecomendados([]);
    setInteresados([]);
    setFinalizado(false);
    setEscribiendo(false);
    setTextoInput("");
    setTimeout(() => empujarBot(FLUJO.inicio.bot), 200);
  }

  const pasoActual = FLUJO[pasoId];
  const ultBot = burbujas.at(-1)?.de === "bot";
  const mostrarOpciones = !escribiendo && !finalizado && ultBot && pasoActual.opciones.length > 0;
  const mostrarInput = !escribiendo && !finalizado && ultBot && !!pasoActual.input;
  const ultimoTexto = burbujas.at(-1)?.texto ?? "¿Te ayudo a encontrar tu próxima propiedad?";

  return (
    <>
      {/* Overlay: oscurece y BLUREA el fondo cuando el chat está abierto.
          Click afuera → minimiza (no se pierde la conversación). */}
      <AnimatePresence>
        {modo === "abierto" && (
          <motion.div
            key="chat-overlay"
            data-no-print
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setModo("minimizado")}
            className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-md"
          />
        )}
      </AnimatePresence>
      <div data-no-print className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      <AnimatePresence mode="popLayout">
        {/* -------------------- PANEL COMPLETO -------------------- */}
        {modo === "abierto" && (
          <motion.div
            key="panel"
            layout
            initial={{ opacity: 0, y: 24, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.92 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            className="flex h-[32rem] w-[min(90vw,23rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl shadow-[rgba(60,50,25,0.35)]"
          >
            {/* Header: barra ROJA sólida — el chat es el CTA más fuerte de la web. */}
            <div className="flex items-center gap-3 border-b border-black/10 bg-brand px-4 py-3">
              <span className="relative flex size-9 items-center justify-center rounded-full bg-white/20 text-white">
                <Sparkles className="size-4" />
                <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-brand bg-emerald-400" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">Asesor América Cardozo</p>
                <p className="text-[11px] text-white/80">en línea · responde al instante</p>
              </div>
              <button
                onClick={() => setModo("minimizado")}
                aria-label="Minimizar"
                className="ml-auto rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <Minus className="size-4" />
              </button>
              <button
                onClick={() => setModo("cerrado")}
                aria-label="Cerrar"
                className="rounded-full p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
              >
                <X className="size-4" />
              </button>
            </div>

            <ChatBody
              ref={scrollRef}
              burbujas={burbujas}
              escribiendo={escribiendo}
              recomendados={recomendados}
              finalizado={finalizado}
              respuestas={respuestas}
              interesados={interesados}
              onSeleccionar={seleccionarPropiedad}
              onReiniciar={reiniciar}
            />

            {/* Opciones (botones) */}
            <AnimatePresence>
              {mostrarOpciones && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-2 border-t border-border bg-muted p-3"
                >
                  {pasoActual.opciones.map((op, i) => (
                    <motion.button
                      key={op.label}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => elegir(pasoActual, op)}
                      className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand hover:bg-brand/10 hover:text-brand-text active:scale-95"
                    >
                      {op.emoji ? `${op.emoji} ` : ""}
                      {op.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input de texto libre (ej. usado a permutar) */}
            <AnimatePresence>
              {mostrarInput && pasoActual.input && (
                <motion.form
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  onSubmit={(e) => {
                    e.preventDefault();
                    enviarTexto(pasoActual);
                  }}
                  className="flex items-center gap-2 border-t border-border bg-muted p-3"
                >
                  <input
                    value={textoInput}
                    onChange={(e) => setTextoInput(e.target.value)}
                    placeholder={pasoActual.input.placeholder}
                    aria-label={pasoActual.input.placeholder}
                    autoComplete="off"
                    className="min-w-0 flex-1 rounded-full border border-border bg-card px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand"
                  />
                  <button
                    type="submit"
                    disabled={!textoInput.trim()}
                    aria-label="Enviar"
                    className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand text-white transition hover:bg-electric disabled:opacity-40"
                  >
                    <Send className="size-4" />
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* -------------------- PIP MINIMIZADO -------------------- */}
        {modo === "minimizado" && (
          <motion.button
            key="pip"
            layout
            initial={{ opacity: 0, y: 20, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            onClick={() => setModo("abierto")}
            aria-label="Agrandar el asesor"
            className="flex w-[min(68vw,17rem)] items-center gap-2.5 rounded-2xl border border-border bg-card px-3 py-2.5 text-left shadow-2xl shadow-[rgba(60,50,25,0.3)]"
          >
            <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-brand text-white">
              <Sparkles className="size-3.5" />
              <span className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-card bg-emerald-500" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-semibold text-foreground">Asesor América Cardozo</span>
              <span className="block truncate text-[11px] text-muted-foreground">{ultimoTexto}</span>
            </span>
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                setModo("cerrado");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  setModo("cerrado");
                }
              }}
              aria-label="Cerrar asesor"
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </span>
            <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Tooltip de bienvenida */}
      <AnimatePresence>
        {tip && modo === "cerrado" && (
          <motion.button
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => {
              setModo("abierto");
              setTip(false);
            }}
            className="hidden max-w-[14rem] rounded-2xl rounded-br-md border border-border bg-card px-3.5 py-2 text-left text-xs text-foreground shadow-xl lg:block"
          >
            👋 ¿Te ayudo a encontrar tu próxima propiedad?
          </motion.button>
        )}
      </AnimatePresence>

      {/* FAB — solo cuando está cerrado */}
      <AnimatePresence>
        {modo === "cerrado" && (
          <motion.button
            key="fab"
            layout
            initial={mounted ? { opacity: 0, scale: 0.6 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            onClick={() => {
              setModo("abierto");
              setTip(false);
            }}
            aria-label="Abrir asesor"
            whileTap={{ scale: 0.92 }}
            className="glow-brand relative flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-xl shadow-[rgba(60,50,25,0.35)]"
          >
            {mounted && !reduce && (
              <motion.span
                aria-hidden
                className="absolute inset-0 rounded-full bg-brand"
                animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <MessageSquareText className="size-6" />
          </motion.button>
        )}
      </AnimatePresence>
      </div>
    </>
  );
}

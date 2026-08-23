// Exportar un nodo del DOM a PDF descargable.
//
// POR QUÉ EXISTE: el brochure usaba `window.print()`, que abre el diálogo de
// impresión del navegador y obliga al usuario a elegir "Guardar como PDF" a
// mano. El cliente lo marcó como poco intuitivo: quiere que "Exportar PDF"
// descargue un PDF, y punto.
//
// POR QUÉ CON IMPORT DINÁMICO: jsPDF + html2canvas pesan ~500 KB juntos. En un
// import normal entrarían al bundle de TODA persona que abre una ficha de
// propiedad, aunque nunca toque el botón — y venimos de que el cliente reportó
// que el sitio va lento. Con `await import()` el código se descarga recién al
// hacer click. Es la regla "cargar módulos solo cuando la función se activa".
//
// html2canvas-PRO, no html2canvas a secas: el original no entiende `oklch()` y
// este proyecto define TODA su paleta en oklch — reventaría al rasterizar.

/** Milímetros de una hoja A4. */
const A4 = { ancho: 210, alto: 297 } as const;

/**
 * Rasteriza `nodo` y lo descarga como PDF A4, partiéndolo en varias páginas si
 * no entra en una sola.
 *
 * @param nodo          Elemento del DOM a exportar.
 * @param nombreArchivo Nombre del archivo, sin la extensión .pdf.
 */
export async function exportarNodoAPdf(
  nodo: HTMLElement,
  nombreArchivo: string,
): Promise<void> {
  const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
    import("jspdf"),
    import("html2canvas-pro"),
  ]);

  const canvas = await html2canvas(nodo, {
    // 2x para que el texto no se vea pixelado al imprimir o hacer zoom.
    scale: 2,
    useCORS: true,
    // Fondo blanco explícito: el nodo es translúcido dentro del overlay oscuro,
    // y sin esto el PDF saldría con el gris del backdrop detrás del documento.
    backgroundColor: "#ffffff",
    logging: false,
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const imagen = canvas.toDataURL("image/jpeg", 0.92);

  // Alto que tendría el documento si se escala a lo ancho de la hoja.
  const altoNatural = (canvas.height * A4.ancho) / canvas.width;

  // UNA SOLA HOJA SIEMPRE QUE SE PUEDA (pedido del cliente: "a veces te deja
  // una partecita re chiquita abajo").
  // Si el documento se pasa del alto de A4 pero por poco, en vez de abrir una
  // segunda hoja con un resto mínimo se ACHICA todo para que entre justo. El
  // tope de 25% es el punto donde el texto todavía se lee cómodo impreso;
  // más allá, achicar sería peor que partir.
  const MAX_ACHIQUE = 1.25;

  if (altoNatural <= A4.alto * MAX_ACHIQUE) {
    const escala = Math.min(1, A4.alto / altoNatural);
    const ancho = A4.ancho * escala;
    const alto = altoNatural * escala;
    // Centrado horizontal cuando se achicó, para que no quede pegado al margen.
    const x = (A4.ancho - ancho) / 2;
    pdf.addImage(imagen, "JPEG", x, 0, ancho, alto);
    pdf.save(`${nombreArchivo}.pdf`);
    return;
  }

  // Documento realmente largo: se parte en hojas reposicionando la MISMA imagen
  // con offset negativo. Evita re-rasterizar por página (tiempo y memoria).
  let restante = altoNatural;
  let offset = 0;
  while (restante > 0) {
    if (offset > 0) pdf.addPage();
    pdf.addImage(imagen, "JPEG", 0, -offset, A4.ancho, altoNatural);
    restante -= A4.alto;
    offset += A4.alto;
  }

  pdf.save(`${nombreArchivo}.pdf`);
}

/** Convierte un título en un nombre de archivo sano (sin tildes ni símbolos). */
export function nombreArchivoSano(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase()
    .slice(0, 80);
}

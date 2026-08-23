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

  // Se escala el ancho del canvas al ancho de la hoja; el alto queda proporcional.
  const altoEnMm = (canvas.height * A4.ancho) / canvas.width;
  const imagen = canvas.toDataURL("image/jpeg", 0.92);

  // Una sola página: entra directo.
  if (altoEnMm <= A4.alto) {
    pdf.addImage(imagen, "JPEG", 0, A4.ancho ? 0 : 0, A4.ancho, altoEnMm);
    pdf.save(`${nombreArchivo}.pdf`);
    return;
  }

  // Varias páginas: se reposiciona la MISMA imagen con offset negativo y se
  // recorta con el alto de hoja. Es el patrón estándar — evita re-rasterizar
  // por página, que multiplicaría el tiempo y la memoria.
  let restante = altoEnMm;
  let offset = 0;
  while (restante > 0) {
    if (offset > 0) pdf.addPage();
    pdf.addImage(imagen, "JPEG", 0, -offset, A4.ancho, altoEnMm);
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

// Emprendimientos de AMERICAN GROUP (la desarrolladora del grupo).
// Boceto de la dueña: "proyectos terminados, loteos… se despliegan los
// proyectos 3/4; hacer hincapié en etapas de desarrollo e inversión".
//
// ⚠️ CARGAR SOLO PROYECTOS REALES confirmados por el cliente — nombres,
// ubicaciones y estados verdaderos. Las imágenes van en /public/emprendimientos/.
// Mientras el array esté vacío, la página muestra el estado "en preparación"
// (sin inventar desarrollos).

export type EstadoEmprendimiento = "En pozo" | "En obra" | "Terminado" | "Loteo";

export interface Emprendimiento {
  id: string;
  nombre: string;
  estado: EstadoEmprendimiento;
  ubicacion: string;
  descripcion: string;
  /** Ruta dentro de /public (ej. "/emprendimientos/torre-moreno.webp"). */
  imagen?: string;
  /** Unidades / tipologías, ej. "Monoambientes y 2 ambientes". */
  tipologias?: string;
}

// Ejemplo de carga (descomentar y completar con datos REALES):
// {
//   id: "torre-ejemplo",
//   nombre: "Torre Ejemplo",
//   estado: "En obra",
//   ubicacion: "Moreno Centro, Buenos Aires",
//   descripcion: "Unidades con balcón y amenities, a metros de la estación.",
//   imagen: "/emprendimientos/torre-ejemplo.webp",
//   tipologias: "Monoambientes, 2 y 3 ambientes",
// },
export const EMPRENDIMIENTOS: Emprendimiento[] = [];

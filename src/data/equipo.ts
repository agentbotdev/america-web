// Equipo de América Cardozo, tal como lo pasó la inmobiliaria (20/10). El orden es el de la
// lista original. `foto` es opcional: si el archivo está en /public/equipo/ se muestra; si no,
// va un círculo con las iniciales (así la página no queda rota mientras llegan las fotos).
export interface Integrante {
  nombre: string;
  cargo: string;
  /** Ruta bajo /public, por ejemplo "/equipo/daiana-godetti.webp". */
  foto?: string;
}

export const EQUIPO: Integrante[] = [
  { nombre: "América Cardozo", cargo: "CEO" },
  { nombre: "Daiana Godetti", cargo: "Gerente sede Ituzaingó" },
  { nombre: "Moria Cardozo", cargo: "Sub-gerente sede Paso del Rey" },
  { nombre: "Alejandro Papotti", cargo: "Asesor inmobiliario · Encargado del área alquileres" },
  { nombre: "Juan Ayala", cargo: "Asesor inmobiliario" },
  { nombre: "Cristian Catalán", cargo: "Asesor inmobiliario" },
  { nombre: "Juan Cruz Echeverry", cargo: "Asesor inmobiliario · Costa Atlántica" },
  { nombre: "Laura Sachini", cargo: "Asesora inmobiliaria" },
  { nombre: "Barby Lazarte", cargo: "Equipo de marketing" },
  { nombre: "Tatiana Bustos", cargo: "Equipo de marketing" },
  { nombre: "Franco Zeballos", cargo: "Community manager" },
  { nombre: "Lucas Mucaled", cargo: "Informática y sistemas" },
  { nombre: "Ignacio Barrientos", cargo: "Desarrollador CRM" },
];

"use client";

import dynamic from "next/dynamic";

// Envoltorio CLIENTE del asesor, sólo para poder diferirlo.
//
// POR QUÉ EXISTE ESTE ARCHIVO: `next/dynamic` con `ssr: false` no se puede usar
// dentro de un Server Component, y el layout raíz lo es. La forma soportada es
// hacer el import dinámico desde un Client Component como éste, que el layout
// renderiza normalmente.
//
// POR QUÉ SE DIFIERE: el asesor arrastra su árbol completo (flujo de la
// conversación, mini-cards de propiedades, animaciones) y vive en el layout, o
// sea en TODAS las páginas. Arranca cerrado y la enorme mayoría de las visitas
// nunca lo abre, pero todas pagaban su descarga y su parseo antes de poder
// interactuar. Con `ssr: false` tampoco se prerenderiza: no suma markup al HTML
// ni estado al payload de hidratación.
// No se le pone `loading`: es un botón flotante, no contenido — que aparezca
// unos milisegundos después no se percibe y evita un salto de layout.
const AsesorChat = dynamic(
  () => import("./asesor-chat").then((m) => m.AsesorChat),
  { ssr: false },
);

export function AsesorChatLazy() {
  return <AsesorChat />;
}

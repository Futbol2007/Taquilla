import { useState } from "react";
export function useDetalle(textos, idioma = "es") {
  const texto = textos?.footer?.columnas?.cuenta?.enlaces;
  const [detalle, setDetalle] = useState(null);
  function abrirCuenta(tipo) {
    if (tipo === "ingresar") {
      window.location.assign("/ingresar");
      return;
    }
    const en = idioma === "en";
    setDetalle({
      titulo: tipo === "registro" ? texto?.crearCuenta : texto?.ingresar,
      descripcion: en ? "Available soon." : "Disponibles muy pronto.",
      cerrar: en ? "Continue exploring" : "Seguir explorando",
    });
  }
  function abrirTerminos() {
    const en = idioma === "en";
    setDetalle({
      titulo: textos?.footer?.columnas?.legal?.enlaces?.terminos,
      descripcion: en
        ? "The terms of use are not available yet. You can keep exploring."
        : "Los términos de uso aún no están disponibles. Puedes seguir explorando.",
      cerrar: en ? "Continue exploring" : "Seguir explorando",
    });
  }
  return { detalle, setDetalle, abrirCuenta, abrirTerminos };
}

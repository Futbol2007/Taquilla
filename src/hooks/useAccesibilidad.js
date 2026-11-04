import { useEffect, useState } from "react";

function valoresDelSistema() {
  return {
    tamano: 100,
    tema: "sistema",
    contraste: window.matchMedia("(prefers-contrast: more)").matches,
    movimiento: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    subrayar: false,
    espaciado: false,
  };
}

export function useAccesibilidad() {
  const [accesibilidad, setAccesibilidad] = useState(valoresDelSistema);
  const [sistemaOscuro, setSistemaOscuro] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  useEffect(() => {
    const consulta = window.matchMedia("(prefers-color-scheme: dark)");
    const actualizarTema = (evento) => setSistemaOscuro(evento.matches);
    consulta.addEventListener("change", actualizarTema);
    return () => consulta.removeEventListener("change", actualizarTema);
  }, []);

  const temaOscuro =
    accesibilidad.tema === "oscuro" ||
    (accesibilidad.tema === "sistema" && sistemaOscuro);

  useEffect(() => {
    const html = document.documentElement;
    html.dataset.texto = accesibilidad.tamano;
    html.style.setProperty("--escala-texto", String(accesibilidad.tamano / 100));
    html.dataset.tema = temaOscuro ? "oscuro" : "claro";
    html.dataset.contraste = accesibilidad.contraste ? "si" : "no";
    html.dataset.movimiento = accesibilidad.movimiento ? "reducir" : "normal";
    html.dataset.subrayar = accesibilidad.subrayar ? "si" : "no";
    html.dataset.espaciado = accesibilidad.espaciado ? "si" : "no";
    localStorage.setItem("accesibilidad", JSON.stringify(accesibilidad));
  }, [accesibilidad, temaOscuro]);
  function cambiarValores(clave, valor) {
    setAccesibilidad((anterior) => ({ ...anterior, [clave]: valor }));
  }

  function restablecer() {
    setAccesibilidad(valoresDelSistema());
  }

  return { accesibilidad, cambiarValores, restablecer, temaOscuro };
}

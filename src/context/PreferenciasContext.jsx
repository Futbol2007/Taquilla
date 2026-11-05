import { createContext, useContext, useEffect, useState } from "react";
import {
  leerCookie,
  guardarCookie,
  borrarCookie,
} from "../services/cookies.js";
import { proyecto } from "../config/proyecto.js";

const PreferenciasContext = createContext(null);

export function PreferenciasProvider({ children }) {
  const [preferenciasCookies, setPreferenciasCookies] = useState(() => {
    try {
      const valor = leerCookie("categorias-cookies");
      if (valor) return { necesarias: true, ...JSON.parse(valor) };
    } catch {}
    const aceptado = leerCookie("consentimiento") === "aceptado";
    return {
      necesarias: true,
      preferencias: aceptado,
      analiticas: aceptado,
      marketing: aceptado,
    };
  });
  const [consentimiento, setConsentimiento] = useState(() => {
    const valor = leerCookie("consentimiento");
    return ["aceptado", "rechazado"].includes(valor) ? valor : null;
  });
  const [idioma, setIdioma] = useState(() =>
    leerCookie("consentimiento") === "aceptado" && leerCookie("idioma") === "en"
      ? "en"
      : "es",
  );
  const [error, setError] = useState(false);
  useEffect(() => {
    document.documentElement.lang = idioma;
    document.title = `${proyecto.nombre} · ${idioma === "en" ? "Home" : "Inicio"}`;
  }, [idioma]);
  function cambiarIdioma(valor) {
    setIdioma(valor);
    try {
      if (preferenciasCookies.preferencias) guardarCookie("idioma", valor);
      setError(false);
    } catch {
      setError(true);
    }
  }
  function guardarConsentimiento(permitir) {
    try {
      const categorias =
        typeof permitir === "boolean"
          ? {
              necesarias: true,
              preferencias: permitir,
              analiticas: permitir,
              marketing: permitir,
            }
          : { necesarias: true, ...permitir };
      const aceptaOpcionales =
        categorias.preferencias || categorias.analiticas || categorias.marketing;
      const valor = aceptaOpcionales ? "aceptado" : "rechazado";
      guardarCookie("consentimiento", valor);
      guardarCookie("categorias-cookies", JSON.stringify(categorias));
      if (categorias.preferencias) guardarCookie("idioma", idioma);
      else borrarCookie("idioma");
      setConsentimiento(valor);
      setPreferenciasCookies(categorias);
      setError(false);
      return true;
    } catch {
      setError(true);
      return false;
    }
  }
  return (
    <PreferenciasContext.Provider
      value={{
        idioma,
        cambiarIdioma,
        consentimiento,
        preferenciasCookies,
        guardarConsentimiento,
        error,
      }}
    >
      {children}
    </PreferenciasContext.Provider>
  );
}

export function usePreferencias() {
  const valor = useContext(PreferenciasContext);
  if (!valor) throw new Error("PreferenciasProvider requerido");
  return valor;
}

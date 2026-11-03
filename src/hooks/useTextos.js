import { useEffect, useState } from "react";
const API = "https://yanethm-taquilla-api.fly.dev/api/v1/textos";

function validarTextos(datos) {
  const textos = datos?.textos;
  const nav = textos?.navbar;
  const menuMovil = textos?.menuMovil;
  const CLAVES_MENU = Object.keys(nav?.enlaces ?? {});
  const CLAVES_MENU_MOVIL = Object.keys(menuMovil?.enlaces ?? {});
  const etiquetas = [
    nav?.logo?.texto,
    nav?.logo?.aria,
    ...CLAVES_MENU.map((clave) => nav?.enlaces?.[clave]),
    nav?.buscador?.placeholder,
    nav?.buscador?.aria,
    nav?.botones?.ingresar,
    nav?.botones?.crearCuenta,
    nav?.usuario?.menu,
    nav?.usuario?.panel,
    nav?.usuario?.cerrarSesion,
    nav?.aria?.idioma,
    nav?.aria?.accesibilidad,
    menuMovil?.abrir,
    menuMovil?.cerrar,
    ...CLAVES_MENU_MOVIL.map((clave) => menuMovil?.enlaces?.[clave]),
    menuMovil?.botones?.ingresar,
    menuMovil?.botones?.crearCuenta,
    menuMovil?.botones?.cerrarSesion,
    menuMovil?.secciones?.idioma,
    menuMovil?.secciones?.accesibilidad,
  ];

  if (!etiquetas.every((valor) => typeof valor === "string" && valor.trim())) {
    throw new Error(
      "La respuesta de la API no contiene los textos del Navbar.",
    );
  }

  return textos;
}

export function useTextos(idioma) {
  const [textos, setTextos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  useEffect(() => {
    const controlador = new AbortController();
    const limite = setTimeout(() => controlador.abort(), 12000);
    let vigente = true;
    setCargando(true);
    setError(false);
    setTextos(null);
    async function cargarTextosNavbar() {
      try {
        const respuesta = await fetch(`${API}?idioma=${idioma}`, {
          signal: controlador.signal,
        });
        if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
        // Si si respondio bien
        const datos = await respuesta.json();
        const nuevosTextos = validarTextos(datos);
        if (vigente) setTextos(nuevosTextos);
      } catch (error) {
        if (vigente) {
          console.error("Error al cargar los textos del Navbar: ", error);
          setError(true);
        }
      } finally {
        clearTimeout(limite);
        if (vigente) setCargando(false);
      }
    }

    cargarTextosNavbar();
    return () => {
      vigente = false;
      clearTimeout(limite);
      controlador.abort();
    };
  }, [idioma, intento]);

  return {
    textos,
    cargando,
    error,
    recargar: () => setIntento((valor) => valor + 1),
  };
}

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { crearSesion } from "../model.js";
import {
  cerrarSesion as cerrarSesionApi,
  consultarSesion,
  iniciarSesion as iniciarSesionApi,
} from "../services/sesion.js";

const ContextoSesion = createContext(null);

export function SesionProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let vigente = true;
    consultarSesion()
      .then((respuesta) => {
        if (vigente) setUsuario(respuesta?.usuario ?? null);
      })
      .catch((error) => {
        if (vigente && error.codigo !== "no_autenticado") {
          console.error("No se pudo consultar la sesión:", error);
        }
      })
      .finally(() => {
        if (vigente) setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, []);

  async function iniciarSesion(correo, clave) {
    const respuesta = await iniciarSesionApi(correo, clave);
    setUsuario(respuesta?.usuario ?? null);
    return respuesta;
  }

  async function cerrarSesion() {
    await cerrarSesionApi();
    setUsuario(null);
    window.location.replace("/");
  }

  const sesion = useMemo(
    () => ({ ...crearSesion({ usuario, iniciarSesion, cerrarSesion }), cargando }),
    [usuario, cargando],
  );

  return <ContextoSesion.Provider value={sesion}>{children}</ContextoSesion.Provider>;
}

export function useSesion() {
  const sesion = useContext(ContextoSesion);
  if (!sesion) throw new Error("SesionProvider requerido");
  return sesion;
}

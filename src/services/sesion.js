import { proyecto } from "../config/proyecto.js";

async function solicitarSesion(metodo, cuerpo) {
  if (!proyecto.api) {
    throw new Error("Configura VITE_API_URL para conectar con la API.");
  }

  const respuesta = await fetch(`${proyecto.api}/sesion`, {
    method: metodo,
    credentials: "include",
    headers: {
      Accept: "application/json",
      ...(cuerpo ? { "Content-Type": "application/json" } : {}),
    },
    ...(cuerpo ? { body: JSON.stringify(cuerpo) } : {}),
  });

  const contenido = await respuesta.text();
  let datos = null;
  if (contenido) {
    try {
      datos = JSON.parse(contenido);
    } catch {
      datos = null;
    }
  }

  if (!respuesta.ok) {
    const error = new Error(
      datos?.error?.mensaje || `La API respondió con estado ${respuesta.status}.`,
    );
    error.status = respuesta.status;
    error.codigo = datos?.error?.codigo;
    error.campos = datos?.error?.campos ?? {};
    error.detalles = datos?.error?.detalles ?? {};
    error.retryAfter = Number(
      respuesta.headers.get("Retry-After") ??
        datos?.error?.detalles?.reintentarEnSegundos ??
        0,
    );
    throw error;
  }

  return datos;
}

export function iniciarSesion(correo, clave) {
  return solicitarSesion("POST", { correo, clave });
}

let consultaSesionPendiente;

export function consultarSesion() {
  if (!consultaSesionPendiente) {
    consultaSesionPendiente = solicitarSesion("GET")
      .catch((error) => {
        if (error.status === 401 || error.codigo === "no_autenticado") {
          return { usuario: null };
        }
        throw error;
      })
      .finally(() => {
        consultaSesionPendiente = null;
      });
  }
  return consultaSesionPendiente;
}

export function cerrarSesion() {
  return solicitarSesion("DELETE");
}

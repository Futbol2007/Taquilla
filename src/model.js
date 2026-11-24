export function crearUsuario(nombre) {
  return { nombre };
}

export function crearSesion({
  usuario = null,
  iniciarSesion,
  cerrarSesion,
}) {
  return {
    usuario,
    iniciarSesion,
    cerrarSesion,
  };
}

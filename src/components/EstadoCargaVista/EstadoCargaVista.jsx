import "./EstadoCargaVista.css";

function EsqueletoTarjeta() {
  return (
    <article className="esqueleto-evento" aria-hidden="true">
      <span className="esqueleto-bloque esqueleto-afiche" />
      <span className="esqueleto-bloque esqueleto-etiqueta" />
      <span className="esqueleto-bloque esqueleto-titulo" />
      <span className="esqueleto-bloque esqueleto-evento-linea" />
      <span className="esqueleto-bloque esqueleto-evento-linea esqueleto-evento-linea-corta" />
      <div className="esqueleto-evento-precio">
        <span className="esqueleto-bloque esqueleto-evento-valor" />
        <span className="esqueleto-bloque esqueleto-evento-boton" />
      </div>
    </article>
  );
}

export default function EstadoCargaVista({ variante, texto }) {
  return (
    <section
      className={`estado-carga-vista estado-carga-vista--${variante}`}
      role="status"
      aria-label={texto || undefined}
      aria-busy="true"
    >
      {variante === "explorar" ? (
        <div className="esqueleto-explorar" aria-hidden="true">
          <div className="esqueleto-filtros">
            <span className="esqueleto-bloque esqueleto-filtro-titulo" />
            <span className="esqueleto-bloque esqueleto-filtro-linea" />
            <span className="esqueleto-bloque esqueleto-filtro-linea" />
            <span className="esqueleto-bloque esqueleto-filtro-linea" />
            <span className="esqueleto-bloque esqueleto-filtro-linea" />
            <span className="esqueleto-bloque esqueleto-filtro-control" />
            <span className="esqueleto-bloque esqueleto-filtro-control" />
          </div>
          <div className="esqueleto-explorar-principal">
            <div className="esqueleto-explorar-controles">
              <div className="esqueleto-filtros-activos">
                <span className="esqueleto-bloque esqueleto-filtro-activo" />
                <span className="esqueleto-bloque esqueleto-filtro-activo" />
                <span className="esqueleto-bloque esqueleto-filtro-activo" />
              </div>
              <div className="esqueleto-resumen-orden">
                <span className="esqueleto-bloque esqueleto-resumen" />
                <span className="esqueleto-bloque esqueleto-orden" />
              </div>
            </div>
            <div className="esqueleto-resultados">
              {Array.from({ length: 6 }, (_, indice) => <EsqueletoTarjeta key={indice} />)}
            </div>
          </div>
        </div>
      ) : (
        <div className="esqueleto-detalle" aria-hidden="true">
          <span className="esqueleto-bloque esqueleto-detalle-afiche" />
          <span className="esqueleto-bloque esqueleto-detalle-etiqueta" />
          <span className="esqueleto-bloque esqueleto-detalle-titulo" />
          <span className="esqueleto-bloque esqueleto-detalle-artista" />
          <div className="esqueleto-detalle-datos">
            <span className="esqueleto-bloque esqueleto-detalle-dato" />
            <span className="esqueleto-bloque esqueleto-detalle-dato" />
            <span className="esqueleto-bloque esqueleto-detalle-dato" />
          </div>
          <span className="esqueleto-bloque esqueleto-detalle-seccion" />
          <span className="esqueleto-bloque esqueleto-detalle-linea" />
          <span className="esqueleto-bloque esqueleto-detalle-linea" />
          <span className="esqueleto-bloque esqueleto-detalle-linea esqueleto-detalle-linea-corta" />
        </div>
      )}
    </section>
  );
}

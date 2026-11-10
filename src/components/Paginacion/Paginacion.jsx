import chevronIzquierdo from "../../assets/chevl.svg";
import chevronDerecho from "../../assets/chevr.svg";
import "./Paginacion.css";

function obtenerPaginasVisibles(actual, total) {
  if (total <= 5) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }

  const paginas = new Set([1, total, actual - 1, actual, actual + 1]);
  const ordenadas = [...paginas]
    .filter((pagina) => pagina >= 1 && pagina <= total)
    .sort((a, b) => a - b);
  const visibles = [];

  return ordenadas.flatMap((pagina, indice) => {
    const haySalto = indice > 0 && pagina - ordenadas[indice - 1] > 1;
    return haySalto ? [`ellipsis-${pagina}`, pagina] : [pagina];
  });

  return visibles;
}
  
export default function Paginacion({
  textos,
  paginaActual = 1,
  totalPaginas = 1,
  onCambiarPagina,
  etiqueta,
}) {
  const textosPaginacion = textos?.paginas?.explorar?.paginacion;
  const anterior = textosPaginacion?.anterior;
  const siguiente = textosPaginacion?.siguiente;
  const total = Math.max(1, Math.floor(Number(totalPaginas) || 1));
  const actual = Math.min(
    total,
    Math.max(1, Math.floor(Number(paginaActual) || 1)),
  );

  if (total <= 1 || !anterior || !siguiente) return null;

  return (
    <nav
      className="paginacion-eventos"
      aria-label={etiqueta || `${anterior} / ${siguiente}`}
    >
      <button
        className="paginacion-eventos-boton paginacion-eventos-flecha"
        type="button"
        aria-label={anterior}
        disabled={actual === 1}
        onClick={() => onCambiarPagina?.(actual - 1)}
      >
        <img src={chevronIzquierdo} alt="" />
      </button>

      {obtenerPaginasVisibles(actual, total).map((pagina) =>
        typeof pagina === "string" ? (
          <span
            className="paginacion-eventos-elipsis"
            key={pagina}
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            className="paginacion-eventos-boton"
            type="button"
            key={pagina}
            aria-current={pagina === actual ? "page" : undefined}
            onClick={() => onCambiarPagina?.(pagina)}
          >
            {pagina}
          </button>
        ),
      )}

      <button
        className="paginacion-eventos-boton paginacion-eventos-flecha"
        type="button"
        aria-label={siguiente}
        disabled={actual === total}
        onClick={() => onCambiarPagina?.(actual + 1)}
      >
        <img src={chevronDerecho} alt="" />
      </button>
    </nav>
  );
}

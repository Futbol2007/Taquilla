import "./MigasPan.css";

export default function MigasPan({
  textos,
  actual,
  etiqueta,
  hrefInicio = "/",
  anterior,
  etiquetaActual,
}) {
  const textoInicio = textos?.inicio;
  const textoActual = etiquetaActual || textos?.[actual];

  if (!textoInicio || !textoActual) return null;

  return (
    <nav className="migas-pan" aria-label={etiqueta}>
      <a href={hrefInicio}>{textoInicio}</a>
      {anterior?.texto && (
        <>
          <span className="migas-pan-separador" aria-hidden="true">
            ›
          </span>
          <a href={anterior.href}>{anterior.texto}</a>
        </>
      )}
      <span className="migas-pan-separador" aria-hidden="true">
        ›
      </span>
      <span aria-current="page">{textoActual}</span>
    </nav>
  );
}

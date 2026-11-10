import "./MigasPan.css";

export default function MigasPan({
  textos,
  actual,
  etiqueta,
  hrefInicio = "/",
}) {
  const textoInicio = textos?.inicio;
  const textoActual = textos?.[actual];

  if (!textoInicio || !textoActual) return null;

  return (
    <nav className="migas-pan" aria-label={etiqueta}>
      <a href={hrefInicio}>{textoInicio}</a>
      <span className="migas-pan-separador" aria-hidden="true">
        ›
      </span>
      <span aria-current="page">{textoActual}</span>
    </nav>
  );
}

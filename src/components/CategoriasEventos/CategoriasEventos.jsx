import IconoEvento from "../IconoEvento/IconoEvento.jsx";
import "./CategoriasEventos.css";

export default function CategoriasEventos({
  textos,
  categorias = [],
  filtros,
  en,
  filtrarCategoria,
}) {
  const textosCategorias = textos?.paginas?.inicio;

  return (
    <nav
      className="categorias-eventos"
      aria-label={en ? "Event categories" : "Categorías de eventos"}
    >
      <button
        className="categoria-todos"
        type="button"
        aria-pressed={!filtros?.categoria}
        onClick={() => filtrarCategoria(null)}
      >
        {textosCategorias?.filtrosMovil?.todos}
      </button>

      {categorias.map((categoria) => {
        const cantidad = Number(categoria.eventos ?? 0);
        const texto =
          cantidad === 1
            ? textosCategorias?.categorias?.eventos?.uno
            : textosCategorias?.categorias?.eventos?.otro;

        return (
          <button
            key={categoria.id}
            type="button"
            aria-pressed={filtros?.categoria === categoria.id}
            onClick={() => filtrarCategoria(categoria.id)}
          >
            <span className="icono-categoria">
              <IconoEvento tipo={categoria.nombre} />
            </span>
            <span>
              {categoria.nombre}
              <small>{texto?.replaceAll("{cantidad}", String(cantidad))}</small>
            </span>
          </button>
        );
      })}
    </nav>
  );
}

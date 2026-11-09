import IconoEvento from "../IconoEvento/IconoEvento.jsx";
import "./CategoriasEventos.css";
export default function CategoriasEventos({
  textos,
  categorias,
  filtros,
  en,
  filtrarCategoria,
}) {
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
        {textos?.paginas?.inicio?.filtrosMovil?.todos}
      </button>
      {categorias.map((categoria) => (
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
            <small>
              {categoria.eventos} {en ? "events" : "eventos"}
            </small>
          </span>
        </button>
      ))}
    </nav>
  );
}

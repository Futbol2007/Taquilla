import Flecha from "../Flecha/Flecha.jsx";
import TarjetaEvento from "../TarjetaEvento/TarjetaEvento.jsx";
import "./SeccionEventos.css";
export default function SeccionEventos({
  textos,
  id,
  titulo,
  descripcion,
  eventos,
  en,
  onAbrir,
  onVerTodos,
  presentacion = "cuadricula",
  className = "",
}) {
  const textosEventos = textos?.paginas;
  return (
    <section
      className={`seccion-eventos seccion-eventos--${presentacion} ${className}`.trim()}
      id={id}
      aria-labelledby={`${id}-titulo`}
    >
      <div className="titulo-seccion">
        <div>
          <h2 id={`${id}-titulo`}>{titulo}</h2>
          <p role="status">{descripcion}</p>
        </div>
        <button className="enlace-home" onClick={onVerTodos}>
          {textosEventos?.inicio?.destacados?.enlaces?.verTodos}
          <Flecha />
        </button>
      </div>
      <div className="eventos-grid">
        {eventos.map((evento) => (
          <TarjetaEvento
            key={evento.nombre}
            evento={evento}
            en={en}
            onAbrir={onAbrir}
          />
        ))}
      </div>
      {!eventos.length && (
        <div className="sin-resultados">
          <h3>{textosEventos?.explorar?.vacio?.titulo}</h3>
          <p>{textosEventos?.explorar?.vacio?.texto}</p>
          <button className="boton-home primario" onClick={onVerTodos}>
            {textosEventos?.inicio?.destacados?.enlaces?.verTodos}
          </button>
        </div>
      )}
    </section>
  );
}

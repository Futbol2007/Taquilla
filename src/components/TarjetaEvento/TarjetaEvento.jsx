import AficheEvento from "../AficheEvento/AficheEvento.jsx";
import IconoEvento from "../IconoEvento/IconoEvento.jsx";
import { dinero } from "../../utils/dinero.js";
import "./TarjetaEvento.css";
export default function TarjetaEvento({
  textos,
  evento,
  onAbrir,
  clicable = false,
}) {
  const textosTarjeta = textos?.inicio?.tarjeta;

  return (
    <article
      className={`tarjeta-evento${clicable ? " tarjeta-evento--clicable" : ""}`}
      onClick={clicable ? () => onAbrir(evento) : undefined}
      role={clicable ? "button" : undefined}
      tabIndex={clicable ? 0 : undefined}
      aria-label={
        clicable
          ? `${textosTarjeta?.botones?.verEvento}: ${evento.nombre}`
          : undefined
      }
    >
      <AficheEvento variante={evento.arte} />
      <div className="contenido-evento">
        <span className="etiqueta-evento">{evento.etiqueta}</span>
        <h3>{evento.nombre}</h3>
        <p>
          <IconoEvento tipo="fecha" />
          {evento.horario}
        </p>
        <p>
          <IconoEvento tipo="lugar" />
          {evento.lugar}, {evento.ciudad}
        </p>
        <div className="precio-evento">
          <div>
            <small>{textosTarjeta?.desde}</small>
            <strong>{dinero(evento.precio)}</strong>
          </div>
          {!clicable && (
            <button
              className="boton-home secundario"
              aria-label={`${textosTarjeta?.botones?.verEvento}: ${evento.nombre}`}
              onClick={() => onAbrir(evento)}
            >
              {textosTarjeta?.botones?.verEvento}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

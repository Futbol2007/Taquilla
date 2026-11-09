import AficheEvento from "../AficheEvento/AficheEvento.jsx";
import { dinero } from "../../utils/dinero.js";
import "./EventoDestacado.css";
export default function EventoDestacado({ textos, evento, en, onAbrir }) {
  if (!evento) return null;
  const textosEvento = textos?.destacado;
  return (
    <div className="destacado-taquilla">
      <AficheEvento variante={evento.arte} />
      <div className="ficha-destacado">
        <span className="etiqueta-evento">{textosEvento?.etiqueta}</span>
        <h2>{evento.nombre}</h2>
        <p>
          {evento.horario} · {evento.lugar}
        </p>
        <div>
          <strong>
            {textosEvento?.desde?.replace("{precio}", dinero(evento.precio))}
          </strong>
          <button
            className="boton-home primario"
            onClick={() => onAbrir(evento)}
          >
            {textosEvento?.botones?.verEvento}
          </button>
        </div>
      </div>
    </div>
  );
}

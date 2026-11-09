import iconoAccesibilidad from "../../assets/person.svg";
import iconoX from "../../assets/x.svg";
import iconoMenos from "../../assets/minus.svg";
import iconoMas from "../../assets/plus.svg";
import "./Accesibilidad.css";

export default function Accesibilidad({
  abierto: panelAbierto,
  idioma,
  textos,
  accesibilidad,
  cambiarValores,
  restablecer,
  onAlternar,
}) {
  const textosAccesibilidad = textos;

  // Las claves de la API no son las mismas que las del hook
  const OPCIONES_ACCESIBILIDAD = [
    {
      clave: "contraste",
      datos: textosAccesibilidad?.altoContraste,
    },
    {
      clave: "movimiento",
      datos: textosAccesibilidad?.reducirMovimiento,
    },
    {
      clave: "subrayar",
      datos: textosAccesibilidad?.subrayarEnlaces,
    },
    {
      clave: "espaciado",
      datos: textosAccesibilidad?.espaciadoLectura,
    },
  ];

  return (
    <div className="accesibilidad">
      <button
        type="button"
        className="navbar-accesibilidad"
        aria-label={textosAccesibilidad?.titulo}
        aria-expanded={panelAbierto}
        onClick={() => {
          const siguiente = !panelAbierto;
          onAlternar?.(siguiente);
        }}
      >
        <img src={iconoAccesibilidad} alt="" />
      </button>

      {panelAbierto && (
        <div className="accesibilidad-panel">
          <div className="accesibilidad-cabecera">
            <h3>{textosAccesibilidad?.titulo}</h3>

            <button
              type="button"
              className="accesibilidad-cerrar"
              aria-label={idioma === "en" ? "Close" : "Cerrar"}
              onClick={() => {
                onAlternar?.(false);
              }}
            >
              <img src={iconoX} alt="" />
            </button>
          </div>

          <p className="accesibilidad-etiqueta">
            {textosAccesibilidad?.tamanoTexto}
          </p>

          <div
            className="accesibilidad-tamaños"
            aria-label={textosAccesibilidad?.tamanoTexto}
          >
            <button
              type="button"
              className="accesibilidad-tamaño accesibilidad-tamaño-extremo"
              aria-label={idioma === "en" ? "Decrease text size" : "Disminuir tamaño del texto"}
              onClick={() => cambiarValores("tamano", Math.max(80, accesibilidad.tamano - 10))}
              disabled={accesibilidad.tamano <= 80}
            >
              <img src={iconoMenos} alt="" aria-hidden="true" />
            </button>
            <span
              className="accesibilidad-tamaño-muestra"
              style={{ fontSize: `${14 * accesibilidad.tamano / 100}px` }}
              aria-live="polite"
            >
              {textosAccesibilidad?.muestraTamano}
            </span>
            <button
              type="button"
              className="accesibilidad-tamaño accesibilidad-tamaño-extremo"
              aria-label={idioma === "en" ? "Increase text size" : "Aumentar tamaño del texto"}
              onClick={() => cambiarValores("tamano", Math.min(150, accesibilidad.tamano + 10))}
              disabled={accesibilidad.tamano >= 130}
            >
              <img src={iconoMas} alt="" aria-hidden="true" />
            </button>
          </div>
          {OPCIONES_ACCESIBILIDAD.map(({ clave, datos }) => (
            <div key={clave} className="accesibilidad-opcion">
              <div>
                <p className="accesibilidad-nombre">{datos?.nombre}</p>

                <p className="accesibilidad-descripcion detalle-nota">
                  {datos?.descripcion}
                </p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={Boolean(accesibilidad[clave])}
                aria-label={datos?.nombre}
                className={`accesibilidad-interruptor${
                  accesibilidad[clave] ? " activo" : ""
                }`}
                onClick={() => cambiarValores(clave, !accesibilidad[clave])}
              />
            </div>
          ))}

          <div className="accesibilidad-tema">
            <label htmlFor="selector-tema">
              {idioma === "en" ? "Select theme" : "Seleccione tema"}
            </label>

            <select
              id="selector-tema"
              value={accesibilidad.tema}
              onChange={(evento) => cambiarValores("tema", evento.target.value)}
            >
              <option value="sistema">
                {idioma === "en" ? "System" : "Sistema"}
              </option>
              <option value="claro">
                {idioma === "en" ? "Light" : "Claro"}
              </option>
              <option value="oscuro">
                {idioma === "en" ? "Dark" : "Oscuro"}
              </option>
            </select>
          </div>

          <div className="accesibilidad-pie">
            <a href="#accesibilidad">
              {textosAccesibilidad?.enlaces?.declaracion}
            </a>

            <button
              type="button"
              className="accesibilidad-restablecer"
              onClick={restablecer}
            >
              {textosAccesibilidad?.botones?.restablecer}
            </button>
          </div>

          <p className="accesibilidad-nota detalle-nota">
            {textosAccesibilidad?.nota}
          </p>
        </div>
      )}
    </div>
  );
}

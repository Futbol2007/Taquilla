import { useState } from "react";
import iconoAccesibilidad from "../../assets/person.svg";
import iconoX from "../../assets/x.svg";
import "./Accesibilidad.css";

export default function Accesibilidad({
  idioma,
  textos,
  accesibilidad,
  cambiarValores,
  restablecer,
  onAlternar,
}) {
  const [panelAbierto, setPanelAbierto] = useState(false);

  const textosAccesibilidad = textos;

  const TAMAÑO_TEXTO = {
    pequeño: idioma === "en" ? "Small text" : "Texto pequeño",
    normal: idioma === "en" ? "Normal text" : "Texto normal",
    grande: idioma === "en" ? "Large text" : "Texto grande",
  };

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
          setPanelAbierto((anterior) => !anterior);
          onAlternar?.();
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
              onClick={() => setPanelAbierto(false)}
            >
              <img src={iconoX} alt="" />
            </button>
          </div>

          <p className="accesibilidad-etiqueta">
            {textosAccesibilidad?.tamanoTexto}
          </p>

          <div className="accesibilidad-tamaños">
            {["pequeño", "normal", "grande"].map((valor) => (
              <button
                key={valor}
                type="button"
                aria-label={TAMAÑO_TEXTO[valor]}
                aria-pressed={accesibilidad.tamano === valor}
                className={`accesibilidad-tamaño accesibilidad-tamaño-${valor}${
                  accesibilidad.tamano === valor ? " activo" : ""
                }`}
                onClick={() => cambiarValores("tamano", valor)}
              >
                {textosAccesibilidad?.muestraTamano}
              </button>
            ))}
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

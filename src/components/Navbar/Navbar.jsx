import { useId, useRef, useState } from "react";
import Accesibilidad from "../Accesibilidad/Accesibilidad.jsx";
import { useAccesibilidad } from "../../hooks/useAccesibilidad.js";
import Marca from "../Marca/Marca.jsx";
import MenuMovil from "../MenuMovil/MenuMovil.jsx";
import SelectorIdioma from "../SelectorIdioma/SelectorIdioma.jsx";
import iconoSearch from "../../assets/search.svg";
import iconoX from "../../assets/x.svg";
import "./Navbar.css";
export default function Navbar({
  textos,
  nombre,
  tipo,
  idioma,
  onCambiarIdioma,
  onCuenta,
  onBuscarEventos,
  accesibilidadAbierta,
  onAlternarAccesibilidad,
}) {
  const [abierto, setAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const boton = useRef(null);
  const id = useId();
  const textosNavbar = textos?.navbar;
  const textosAccesibilidad = textos?.accesibilidad;
  const { accesibilidad, cambiarValores, restablecer } = useAccesibilidad();
  function enviarBusqueda(evento) {
    evento.preventDefault();
    onBuscarEventos?.({ consulta });
    setAbierto(false);
  }
  return (
    <header
      className="cabecera-home"
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && (abierto || accesibilidadAbierta)) {
          setAbierto(false);
          onAlternarAccesibilidad(false);
          boton.current?.focus();
        }
      }}
    >
      <div className="ancho-home fila-cabecera">
        <Marca nombre={nombre} tipo={tipo} />
        <button className="ingreso-movil" onClick={() => onCuenta("ingresar")}>
          {textosNavbar?.botones?.ingresar}
        </button>
        <MenuMovil
          abierto={abierto}
          onAlternar={() => {
            setAbierto((menuAbierto) => !menuAbierto);
            onAlternarAccesibilidad(false);
          }}
          menuId={id}
          botonRef={boton}
          textos={textosNavbar}
        />
        {(abierto || accesibilidadAbierta) && (
          <button
            type="button"
            className="menu-movil-overlay"
            aria-label={idioma === "en" ? "Close menu" : "Cerrar menú"}
            onClick={() => {
              setAbierto(false);
              onAlternarAccesibilidad(false);
            }}
          />
        )}
        <nav
          id={id}
          className={`menu-home ${abierto || accesibilidadAbierta ? "abierto" : ""}${
            accesibilidadAbierta ? " accesibilidad-activa" : ""
          }`}
          aria-label={textosNavbar?.logo?.aria}
        >
          <div className="menu-movil-cabecera">
            <Marca nombre={nombre} tipo={tipo} />
            <button
              type="button"
              className="menu-movil-cerrar"
              aria-label={idioma === "en" ? "Close menu" : "Cerrar menú"}
              onClick={() => {
                setAbierto(false);
                onAlternarAccesibilidad(false);
              }}
            >
              <img src={iconoX} alt="" />
            </button>
          </div>
          <a
            href="#contenido"
            aria-current="page"
            onClick={() => setAbierto(false)}
          >
            {textosNavbar?.enlaces?.inicio}
          </a>
          <a href="#explorar" onClick={() => setAbierto(false)}>
            {textosNavbar?.enlaces?.explorar}
          </a>
          <div className="acciones-home">
            {tipo === "taquilla" && (
              <form
                className="buscar-cabecera"
                role="search"
                onSubmit={enviarBusqueda}
              >
                <button
                  type="submit"
                  className="buscar-cabecera-boton"
                  aria-label={
                    textosNavbar?.buscador?.aria
                  }
                >
                  <img src={iconoSearch} alt="" />
                </button>
                <input
                  type="search"
                  value={consulta}
                  onChange={(evento) => setConsulta(evento.target.value)}
                  placeholder={textosNavbar?.buscador?.placeholder}
                  aria-label={
                    textosNavbar?.buscador?.aria
                  }
                />
              </form>
            )}
            <div className="accion-movil accion-movil-accesibilidad">
              <span className="accion-movil-etiqueta">
                {idioma === "en" ? "Accessibility" : "Accesibilidad"}
              </span>
              <Accesibilidad
                abierto={accesibilidadAbierta}
                idioma={idioma}
                textos={textosAccesibilidad}
                accesibilidad={accesibilidad}
                cambiarValores={cambiarValores}
                restablecer={restablecer}
                onAlternar={(panelAbierto) => {
                  onAlternarAccesibilidad(panelAbierto);
                  setAbierto((menuAbierto) =>
                    panelAbierto ? false : menuAbierto,
                  );
                }}
              />
            </div>
            <div className="accion-movil accion-movil-idioma">
              <span className="accion-movil-etiqueta">
                {idioma === "en" ? "Language" : "Idioma"}
              </span>
              <SelectorIdioma
                idioma={idioma}
                onCambiar={onCambiarIdioma}
                etiqueta={textosNavbar?.aria?.idioma}
              />
            </div>
            <button
              className="ingresar-home"
              onClick={() => onCuenta("ingresar")}
            >
              {textosNavbar?.botones?.ingresar}
            </button>
            <button
              className="boton-home primario"
              onClick={() => onCuenta("registro")}
            >
              {textosNavbar?.botones?.crearCuenta}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

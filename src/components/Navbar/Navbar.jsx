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
  destino,
  etiqueta,
  onCuenta,
}) {
  const [abierto, setAbierto] = useState(false);
  const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);
  const boton = useRef(null);
  const id = useId();
  const textosNavbar = textos?.navbar;
  const textosAccesibilidad = textos?.accesibilidad;
  const { accesibilidad, cambiarValores, restablecer } = useAccesibilidad();
  return (
    <header
      className="cabecera-home"
      onKeyDown={(evento) => {
        if (evento.key === "Escape" && (abierto || accesibilidadAbierta)) {
          setAbierto(false);
          setAccesibilidadAbierta(false);
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
            setAbierto(!abierto);
            setAccesibilidadAbierta(false);
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
              setAccesibilidadAbierta(false);
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
                setAccesibilidadAbierta(false);
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
          <a href={destino} onClick={() => setAbierto(false)}>
            {etiqueta}
          </a>
          <div className="acciones-home">
            {tipo === "taquilla" && (
              <a
                className="buscar-cabecera"
                href="#buscador-eventos"
                onClick={() => setAbierto(false)}
              >
                <img src={iconoSearch} alt="" />
                {textosNavbar?.buscador?.placeholder}
              </a>
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
                  setAccesibilidadAbierta(panelAbierto);
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

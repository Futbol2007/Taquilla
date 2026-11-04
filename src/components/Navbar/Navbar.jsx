import { useId, useRef, useState } from "react";
import Accesibilidad from "../Accesibilidad/Accesibilidad.jsx";
import { useAccesibilidad } from "../../hooks/useAccesibilidad.js";
import Marca from "../Marca/Marca.jsx";
import MenuMovil from "../MenuMovil/MenuMovil.jsx";
import SelectorIdioma from "../SelectorIdioma/SelectorIdioma.jsx";
import iconoSearch from "../../assets/search.svg";
import iconoX from "../../assets/x.svg";
import { interfaz } from "../../data/interfaz.js";
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
  const t = interfaz[idioma];
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
          {t.ingresar}
        </button>
        <MenuMovil
          abierto={abierto}
          onAlternar={() => {
            setAbierto(!abierto);
            setAccesibilidadAbierta(false);
          }}
          menuId={id}
          botonRef={boton}
          textos={t}
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
          aria-label={t.navegacion}
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
            {t.inicio}
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
                {t.buscar}
              </a>
            )}
            <div className="accion-movil accion-movil-accesibilidad">
              <span className="accion-movil-etiqueta">
                {idioma === "en" ? "Accessibility" : "Accesibilidad"}
              </span>
              <Accesibilidad
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
                etiqueta={t.idioma}
              />
            </div>
            <button
              className="ingresar-home"
              onClick={() => onCuenta("ingresar")}
            >
              {t.ingresar}
            </button>
            <button
              className="boton-home primario"
              onClick={() => onCuenta("registro")}
            >
              {t.registro}
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}

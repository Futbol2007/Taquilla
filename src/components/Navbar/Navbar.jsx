import { useEffect, useId, useRef, useState } from "react";
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
  usuario,
  onCerrarSesion,
  onBuscarEventos,
  buscadorDeshabilitado = false,
  accesibilidadAbierta,
  onAlternarAccesibilidad,
  privado = false,
}) {
  const [abierto, setAbierto] = useState(false);
  const [perfilAbierto, setPerfilAbierto] = useState(false);
  const [consulta, setConsulta] = useState("");
  const boton = useRef(null);
  const perfilRef = useRef(null);
  const id = useId();
  const textosNavbar = textos?.navbar;
  const textosMenuMovil = textos?.menuMovil;
  const textosAccesibilidad = textos?.accesibilidad;
  const { accesibilidad, cambiarValores, restablecer } = useAccesibilidad();
  const modoPrivado = privado || Boolean(usuario);

  useEffect(() => {
    if (!perfilAbierto) return undefined;
    function cerrarAlHacerClickFuera(evento) {
      if (!perfilRef.current?.contains(evento.target)) setPerfilAbierto(false);
    }
    function cerrarConEscape(evento) {
      if (evento.key === "Escape") setPerfilAbierto(false);
    }
    document.addEventListener("pointerdown", cerrarAlHacerClickFuera);
    document.addEventListener("keydown", cerrarConEscape);
    return () => {
      document.removeEventListener("pointerdown", cerrarAlHacerClickFuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [perfilAbierto]);

  const inicialesUsuario = usuario?.nombre
    ?.trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toLocaleUpperCase(idioma === "en" ? "en" : "es");

  async function cerrarSesionUsuario() {
    setPerfilAbierto(false);
    try {
      await onCerrarSesion?.();
    } catch (error) {
      console.error("No se pudo cerrar la sesión:", error);
    }
  }

  function enviarBusqueda(evento) {
    evento.preventDefault();
    if (buscadorDeshabilitado) return;
    onBuscarEventos?.({ consulta });
    setAbierto(false);
  }
  function enfocarBuscadorMovil() {
    setAbierto(false);
    onAlternarAccesibilidad(false);
    const campoBusqueda = document.querySelector(
      '.pagina-explorar-buscador-movil input[type="search"], #buscador-eventos input[type="search"]',
    );
    campoBusqueda?.scrollIntoView({ behavior: "smooth", block: "center" });
    campoBusqueda?.focus({ preventScroll: true });
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
        <Marca
          nombre={nombre}
          tipo={tipo}
          logoNavbar={tipo === "taquilla"}
          logoInversoMovil={tipo === "taquilla"}
        />
        {tipo === "taquilla" && (
          <button
            type="button"
            className="buscar-movil"
            aria-label={textosNavbar?.buscador?.aria}
            disabled={buscadorDeshabilitado}
            onClick={enfocarBuscadorMovil}
          >
            <img src={iconoSearch} alt="" />
          </button>
        )}
        {!usuario && (
          <button className="ingreso-movil" onClick={() => onCuenta("ingresar")}>
            {textosNavbar?.botones?.ingresar}
          </button>
        )}
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
          className={`menu-home${modoPrivado ? " menu-home-privado" : ""} ${abierto || accesibilidadAbierta ? "abierto" : ""}${
            accesibilidadAbierta ? " accesibilidad-activa" : ""
          }`}
          aria-label={textosNavbar?.logo?.aria}
        >
          <div className="menu-movil-cabecera">
            <Marca nombre={nombre} tipo={tipo} logoNavbar={tipo === "taquilla"} />
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
          <a href="/" aria-current="page" onClick={() => setAbierto(false)}>
            {textosNavbar?.enlaces?.inicio}
          </a>
          <a href="/explorar" onClick={() => setAbierto(false)}>
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
                  aria-label={textosNavbar?.buscador?.aria}
                  disabled={buscadorDeshabilitado}
                >
                  <img src={iconoSearch} alt="" />
                </button>
                <input
                  type="search"
                  disabled={buscadorDeshabilitado}
                  value={consulta}
                  onChange={(evento) => setConsulta(evento.target.value)}
                  placeholder={textosNavbar?.buscador?.placeholder}
                  aria-label={textosNavbar?.buscador?.aria}
                />
              </form>
            )}
            <div className="accion-movil accion-movil-accesibilidad">
              <span className="accion-movil-etiqueta">
                {textosMenuMovil?.secciones?.accesibilidad}
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
                {textosMenuMovil?.secciones?.idioma}
              </span>
              <SelectorIdioma
                idioma={idioma}
                onCambiar={onCambiarIdioma}
                etiqueta={textosNavbar?.aria?.idioma}
              />
            </div>
            {usuario ? (
              <div className="navbar-perfil" ref={perfilRef}>
                <button
                  className="navbar-perfil-boton"
                  type="button"
                  aria-label={textosNavbar?.usuario?.menu}
                  aria-haspopup="dialog"
                  aria-expanded={perfilAbierto}
                  aria-controls={`${id}-perfil`}
                  onClick={() => setPerfilAbierto((visible) => !visible)}
                >
                  {inicialesUsuario}
                </button>
                {perfilAbierto && (
                  <div
                    className="navbar-perfil-panel"
                    id={`${id}-perfil`}
                    role="dialog"
                    aria-label={textosNavbar?.usuario?.panel}
                  >
                    <div className="navbar-perfil-identidad">
                      <span className="navbar-perfil-iniciales" aria-hidden="true">
                        {inicialesUsuario}
                      </span>
                      <div className="navbar-perfil-datos">
                        <strong>{usuario.nombre}</strong>
                        <span>{usuario.correo}</span>
                      </div>
                    </div>
                    <button className="navbar-perfil-cerrar" type="button" onClick={cerrarSesionUsuario}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M10 17l5-5-5-5M15 12H3" />
                        <path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" />
                      </svg>
                      {textosNavbar?.usuario?.cerrarSesion}
                    </button>
                  </div>
                )}
                <div className="navbar-perfil-movil">
                  <div className="navbar-perfil-identidad">
                    <span className="navbar-perfil-iniciales" aria-hidden="true">
                      {inicialesUsuario}
                    </span>
                    <div className="navbar-perfil-datos">
                      <strong>{usuario.nombre}</strong>
                      <span>{usuario.correo}</span>
                    </div>
                  </div>
                  <button className="navbar-perfil-cerrar-movil" type="button" onClick={cerrarSesionUsuario}>
                    {textosNavbar?.usuario?.cerrarSesion}
                  </button>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}

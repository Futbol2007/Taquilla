import { useRef, useState } from "react";
import { proyecto } from "../../config/proyecto.js";
import { usePreferencias } from "../../context/PreferenciasContext.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import SaltarContenido from "../SaltarContenido/SaltarContenido.jsx";
import GestorCookies from "../GestorCookies/GestorCookies.jsx";
import LayoutPrivado from "../LayoutPrivado/LayoutPrivado.jsx";
import DialogoDetalle from "../DialogoDetalle/DialogoDetalle.jsx";
import { useDetalle } from "../../hooks/useDetalle.js";
import { useSesion } from "../../context/SesionContext.jsx";
import "./LayoutPublico.css";

export default function LayoutPublico({
  textos,
  onCuenta,
  onBuscarEventos,
  buscadorDeshabilitado = false,
  className = "",
  children,
}) {
  const { idioma, cambiarIdioma } = usePreferencias();
  const { usuario, cerrarSesion } = useSesion();
  const { detalle: detalleTerminos, setDetalle: setDetalleTerminos, abrirTerminos } = useDetalle(textos, idioma);
  const [cookiesAbiertas, setCookiesAbiertas] = useState(false);
  const [accesibilidadAbierta, setAccesibilidadAbierta] = useState(false);
  const disparador = useRef(null);
  function abrirCookies() {
    disparador.current = document.activeElement;
    setCookiesAbiertas(true);
  }
  function cerrarCookies() {
    setCookiesAbiertas(false);
    disparador.current?.focus();
  }
  function abrirAccesibilidad() {
    setAccesibilidadAbierta(true);
    document
      .querySelector(".cabecera-home")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (usuario) {
    return (
      <LayoutPrivado
        textos={textos}
        onCuenta={onCuenta}
        onBuscarEventos={onBuscarEventos}
        buscadorDeshabilitado={buscadorDeshabilitado}
        className={className}
      >
        {children}
      </LayoutPrivado>
    );
  }

  return (
    <div className={`landing ${proyecto.id} ${className}`.trim()}>
      <SaltarContenido texto={textos?.general?.aria?.saltarAlContenido} />
      <Navbar
        textos={textos}
        nombre={proyecto.nombre}
        tipo={proyecto.id}
        idioma={idioma}
        onCambiarIdioma={cambiarIdioma}
        onCuenta={onCuenta}
        usuario={null}
        onCerrarSesion={cerrarSesion}
        onBuscarEventos={onBuscarEventos}
        buscadorDeshabilitado={buscadorDeshabilitado}
        accesibilidadAbierta={accesibilidadAbierta}
        onAlternarAccesibilidad={setAccesibilidadAbierta}
      />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <Footer
        nombre={proyecto.nombre}
        tipo={proyecto.id}
        onCuenta={onCuenta}
        onAbrirCookies={abrirCookies}
        onAbrirAccesibilidad={abrirAccesibilidad}
        onAbrirTerminos={abrirTerminos}
        textos={textos}
      />
      <GestorCookies
        abierto={cookiesAbiertas}
        onAbrir={abrirCookies}
        onCerrar={cerrarCookies}
        textos={textos}
      />
      <DialogoDetalle detalle={detalleTerminos} onCerrar={() => setDetalleTerminos(null)} />
    </div>
  );
}

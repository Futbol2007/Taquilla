import { useRef, useState } from "react";
import { proyecto } from "../../config/proyecto.js";
import { usePreferencias } from "../../context/PreferenciasContext.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import SaltarContenido from "../SaltarContenido/SaltarContenido.jsx";
import GestorCookies from "../GestorCookies/GestorCookies.jsx";
import "./LayoutPublico.css";

export default function LayoutPublico({
  textos,
  onCuenta,
  onBuscarEventos,
  className = "",
  children,
}) {
  const { idioma, cambiarIdioma } = usePreferencias();
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
        onBuscarEventos={onBuscarEventos}
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
        textos={textos}
      />
      <GestorCookies
        abierto={cookiesAbiertas}
        onAbrir={abrirCookies}
        onCerrar={cerrarCookies}
        textos={textos}
      />
    </div>
  );
}

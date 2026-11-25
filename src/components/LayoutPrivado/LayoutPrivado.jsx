import { useRef, useState } from "react";
import { proyecto } from "../../config/proyecto.js";
import { usePreferencias } from "../../context/PreferenciasContext.jsx";
import { useSesion } from "../../context/SesionContext.jsx";
import Navbar from "../Navbar/Navbar.jsx";
import Footer from "../Footer/Footer.jsx";
import SaltarContenido from "../SaltarContenido/SaltarContenido.jsx";
import GestorCookies from "../GestorCookies/GestorCookies.jsx";
import "./LayoutPrivado.css";
import DialogoDetalle from "../DialogoDetalle/DialogoDetalle.jsx";
import { useDetalle } from "../../hooks/useDetalle.js";

export default function LayoutPrivado({
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

  return (
    <div className={`landing ${proyecto.id} layout-privado ${className}`.trim()}>
      <SaltarContenido texto={textos?.general?.aria?.saltarAlContenido} />
      <Navbar
        textos={textos}
        nombre={proyecto.nombre}
        tipo={proyecto.id}
        idioma={idioma}
        onCambiarIdioma={cambiarIdioma}
        onCuenta={onCuenta}
        usuario={usuario}
        onCerrarSesion={cerrarSesion}
        onBuscarEventos={onBuscarEventos}
        buscadorDeshabilitado={buscadorDeshabilitado}
        accesibilidadAbierta={accesibilidadAbierta}
        onAlternarAccesibilidad={setAccesibilidadAbierta}
        privado
      />
      <main id="contenido" tabIndex={-1}>
        {children}
      </main>
      <Footer
        nombre={proyecto.nombre}
        tipo={proyecto.id}
        onCuenta={onCuenta}
        onAbrirCookies={abrirCookies}
        onAbrirAccesibilidad={() => setAccesibilidadAbierta(true)}
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

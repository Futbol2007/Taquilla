import { useState } from "react";
import { usePreferencias } from "../../context/PreferenciasContext.jsx";
import BannerCookies from "../BannerCookies/BannerCookies.jsx";
import PreferenciasCookies from "../PreferenciasCookies/PreferenciasCookies.jsx";
import "./GestorCookies.css";
export default function GestorCookies({ abierto, onAbrir, onCerrar, textos }) {
  const {
    idioma,
    consentimiento,
    preferenciasCookies,
    guardarConsentimiento,
    error,
  } =
    usePreferencias();
  const [mensaje, setMensaje] = useState(false);
  const textosCookies = textos?.cookies;
  function guardar(permitir) {
    if (guardarConsentimiento(permitir)) {
      setMensaje(true);
      onCerrar();
    }
  }
  return (
    <>
      {!consentimiento && (
        <BannerCookies
          textos={textosCookies}
          onAceptar={() => guardar(true)}
          onRechazar={() => guardar(false)}
          onConfigurar={onAbrir}
        />
      )}
      {error && !abierto && (
        <p className="error-cookies" role="alert">
          {textos?.errores?.generico}
        </p>
      )}
      <PreferenciasCookies
        abierto={abierto}
        textos={textosCookies}
        seleccionInicial={preferenciasCookies}
        onGuardar={guardar}
        onCerrar={onCerrar}
        textoError={textos?.errores?.generico}
        error={error}
      />
      <span className="solo-lectores" role="status">
        {mensaje ? (textosCookies?.preferencias?.mensajes?.guardada) : ""}
      </span>
    </>
  );
}

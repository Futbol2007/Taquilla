import { useEffect, useId, useRef, useState } from "react";
import "./PreferenciasCookies.css";
export default function PreferenciasCookies({
  abierto,
  textos,
  seleccionInicial,
  onGuardar,
  onCerrar,
  textoError,
  error,
}) {
  const dialogo = useRef(null);
  const id = useId();
  const [seleccion, setSeleccion] = useState(seleccionInicial);
  const textosPreferencias = textos?.preferencias;
  useEffect(() => {
    if (abierto) {
      setSeleccion(seleccionInicial);
      if (!dialogo.current.open) dialogo.current.showModal();
    } else if (dialogo.current.open) dialogo.current.close();
  }, [abierto, seleccionInicial]);
  function cambiarCategoria(categoria, activa) {
    setSeleccion((actual) => ({ ...actual, [categoria]: activa }));
  }
  return (
    <dialog
      className="preferencias-dialogo"
      ref={dialogo}
      aria-labelledby={id}
      onClose={onCerrar}
    >
      <h2 id={id}>{textosPreferencias?.titulo}</h2>
      <p>{textosPreferencias?.texto}</p>
      <section className="categoria-cookie">
        <h3>{textosPreferencias?.categorias?.necesarias?.nombre}</h3>
        <p>{textosPreferencias?.categorias?.necesarias?.descripcion}</p>
        <label className="detalle-cookie">
          <input type="checkbox" checked disabled />
          <span>{textosPreferencias?.categorias?.necesarias?.cookies}</span>
          <span className="siempre-activa">
            {textosPreferencias?.etiquetas?.siempreActivas}
          </span>
        </label>
      </section>
      {["preferencias", "analiticas", "marketing"].map((categoria) => {
        const contenido = textosPreferencias?.categorias?.[categoria];
        return (
          <section className="categoria-cookie" key={categoria}>
            <h3>{contenido?.nombre}</h3>
            <p>{contenido?.descripcion}</p>
            <label className="detalle-cookie">
              <input
                type="checkbox"
                checked={Boolean(seleccion?.[categoria])}
                onChange={(e) => cambiarCategoria(categoria, e.target.checked)}
              />
              <span>{contenido?.cookies}</span>
            </label>
          </section>
        );
      })}
      {error && <p role="alert">{textoError}</p>}
      <div className="grupo-botones">
        <button
          className="boton-home primario"
          onClick={() => onGuardar(seleccion)}
        >
          {textosPreferencias?.botones?.guardarSeleccion}
        </button>
        <button
          className="boton-home secundario"
          onClick={() =>
            onGuardar({
              necesarias: true,
              preferencias: false,
              analiticas: false,
              marketing: false,
            })
          }
        >
          {textosPreferencias?.botones?.rechazarOpcionales}
        </button>
        <button
          className="boton-home secundario"
          onClick={() =>
            onGuardar({
              necesarias: true,
              preferencias: true,
              analiticas: true,
              marketing: true,
            })
          }
        >
          {textosPreferencias?.botones?.aceptarTodas}
        </button>
      </div>
    </dialog>
  );
}

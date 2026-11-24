import { useEffect, useState } from "react";
import Marca from "../components/Marca/Marca.jsx";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useSesion } from "../context/SesionContext.jsx";
import { proyecto } from "../config/proyecto.js";
import { useTextos } from "../hooks/useTextos.js";
import iconoOjo from "../assets/eye.svg";
import iconoCheck from "../assets/check.svg";
import iconoAlerta from "../assets/alert.svg";
import "./Ingresar.css";

function buscarTextoApi(arbol, clave) {
  if (!arbol || typeof arbol !== "object") return "";
  if (typeof arbol[clave] === "string" && arbol[clave].trim()) {
    return arbol[clave];
  }
  for (const valor of Object.values(arbol)) {
    const encontrado = buscarTextoApi(valor, clave);
    if (encontrado) return encontrado;
  }
  return "";
}

function buscarTextoApiQueCoincida(arbol, expresion) {
  if (typeof arbol === "string") return expresion.test(arbol) ? arbol : "";
  if (!arbol || typeof arbol !== "object") return "";
  for (const valor of Object.values(arbol)) {
    const encontrado = buscarTextoApiQueCoincida(valor, expresion);
    if (encontrado) return encontrado;
  }
  return "";
}

export default function Ingresar() {
  const { idioma } = usePreferencias();
  const { textos } = useTextos(idioma);
  const { usuario, iniciarSesion, cargando: cargandoSesion } = useSesion();
  const pagina = textos?.paginas?.ingresar;
  const presentacion = pagina?.presentacion;
  const formulario = pagina?.formulario;
  const errores = pagina?.errores;
  const obligatorios =
    errores?.camposObligatorios ?? formulario?.errores?.camposObligatorios;
  const mensajeCorreoObligatorio =
    obligatorios?.correoObligatorio ?? buscarTextoApi(pagina, "correoObligatorio");
  const mensajeClaveObligatoria =
    obligatorios?.claveObligatoria ?? buscarTextoApi(pagina, "claveObligatoria");
  const tituloAvisoObligatorio =
    obligatorios?.titulo ?? buscarTextoApiQueCoincida(textos, /revisa.*campos.*marcados/i);
  const textoAvisoObligatorio =
    obligatorios?.texto ?? buscarTextoApiQueCoincida(textos, /para ingresar.*correo.*contraseñ/i);
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [mantenerSesion, setMantenerSesion] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const [errorCorreo, setErrorCorreo] = useState("");
  const [errorClave, setErrorClave] = useState("");
  const [camposObligatoriosInvalidos, setCamposObligatoriosInvalidos] = useState(false);
  const [reintentarEn, setReintentarEn] = useState(0);

  useEffect(() => {
    if (pagina?.seo?.titulo) document.title = pagina.seo.titulo;
    const descripcion = pagina?.seo?.descripcion;
    if (!descripcion) return;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.append(meta);
    }
    meta.content = descripcion;
  }, [pagina?.seo?.titulo, pagina?.seo?.descripcion]);

  useEffect(() => {
    if (usuario) window.location.replace("/");
  }, [usuario]);

  useEffect(() => {
    if (reintentarEn <= 0) return undefined;
    const temporizador = window.setTimeout(
      () => setReintentarEn((actual) => Math.max(0, actual - 1)),
      1000,
    );
    return () => window.clearTimeout(temporizador);
  }, [reintentarEn]);

  function limpiarErrores() {
    setError(null);
    setErrorCorreo("");
    setErrorClave("");
  }

  async function enviarFormulario(evento) {
    evento?.preventDefault();
    limpiarErrores();

    const correoLimpio = correo.trim();
    if (!correoLimpio || !clave) {
      setCamposObligatoriosInvalidos(true);
      setErrorCorreo(!correoLimpio ? mensajeCorreoObligatorio : "");
      setErrorClave(!clave ? mensajeClaveObligatoria : "");
      return;
    }

    setCamposObligatoriosInvalidos(false);
    setEnviando(true);
    try {
      await iniciarSesion(correoLimpio, clave);
      window.location.replace("/");
    } catch (fallo) {
      setCamposObligatoriosInvalidos(false);
      if (fallo.codigo === "credenciales_invalidas") {
        setError({
          titulo: errores?.credenciales?.titulo,
          texto: errores?.credenciales?.texto,
        });
      } else if (fallo.codigo === "validacion") {
        setErrorCorreo(fallo.campos?.correo ?? "");
        setErrorClave(fallo.campos?.clave ?? "");
      } else if (fallo.codigo === "demasiadas_peticiones") {
        const segundos = fallo.retryAfter || fallo.detalles?.reintentarEnSegundos || 300;
        setReintentarEn(segundos);
        setError({
          codigo: "demasiadas_peticiones",
          titulo: errores?.demasiadosIntentos?.titulo,
          texto: errores?.demasiadosIntentos?.texto,
        });
      } else {
        setError({
          codigo: "conexion",
          titulo: errores?.conexion?.titulo,
          texto: errores?.conexion?.texto,
        });
      }
    } finally {
      setEnviando(false);
    }
  }

  const esperando = cargandoSesion || enviando || reintentarEn > 0;
  const beneficios = [
    presentacion?.beneficios?.descubre,
    presentacion?.beneficios?.filtra,
    presentacion?.beneficios?.consulta,
  ].filter(Boolean);
  const correoInvalido = Boolean(errorCorreo) || (camposObligatoriosInvalidos && !correo.trim());
  const claveInvalida = Boolean(errorClave) || (camposObligatoriosInvalidos && !clave);
  return (
    <main className="pagina-acceso" aria-busy={!pagina ? "true" : "false"}>
      <section className="acceso-presentacion" aria-label={presentacion?.lema}>
        <div className="acceso-marca">
          <Marca nombre={proyecto.nombre} tipo={proyecto.id} />
        </div>
        <div className="acceso-presentacion-contenido">
          <h1>{presentacion?.lema}</h1>
          <ul>
            {beneficios.map((beneficio) => (
              <li key={beneficio}>
                <span className="acceso-beneficio-icono" aria-hidden="true">
                  <img src={iconoCheck} alt="" />
                </span>
                <span>{beneficio}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="acceso-formulario-panel" aria-labelledby="titulo-formulario-acceso">
        {!pagina ? (
          <div className="acceso-cargando" aria-hidden="true"><span /></div>
        ) : (
          <div className="acceso-formulario-contenido">
            <header className="acceso-formulario-cabecera">
              <h2 id="titulo-formulario-acceso">{formulario?.titulo}</h2>
              <p>{formulario?.subtitulo}</p>
            </header>

            <form className="formulario-acceso" onSubmit={enviarFormulario} noValidate>
              {error && (
                <div className="error-acceso" role="alert">
                  <img src={iconoAlerta} alt="" aria-hidden="true" />
                  <div>
                    {error.titulo && <strong>{error.titulo}</strong>}
                    {error.texto && (
                      <p>
                        {error.codigo === "demasiadas_peticiones"
                          ? error.texto.replaceAll("{segundos}", reintentarEn)
                          : error.texto}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {camposObligatoriosInvalidos && (
                <div className="aviso-obligatorio-acceso" role="alert">
                  <img src={iconoAlerta} alt="" aria-hidden="true" />
                  <div>
                    {tituloAvisoObligatorio && (
                      <strong>{tituloAvisoObligatorio}</strong>
                    )}
                    {textoAvisoObligatorio && <p>{textoAvisoObligatorio}</p>}
                  </div>
                </div>
              )}
              <div className="campo-acceso">
                <label htmlFor="correo-acceso">{formulario?.etiquetas?.correo}</label>
                <input
                  className={correoInvalido ? "campo-acceso-invalido" : ""}
                  id="correo-acceso"
                  type="email"
                  name="correo"
                  autoComplete="email"
                  placeholder={formulario?.placeholders?.correo}
                  value={correo}
                  aria-invalid={correoInvalido}
                  aria-describedby={errorCorreo ? "error-correo-acceso" : undefined}
                  onChange={(evento) => {
                    const valor = evento.target.value;
                    setCorreo(valor);
                    if (errorCorreo) setErrorCorreo("");
                    if (error) setError(null);
                    if (valor.trim() && clave) setCamposObligatoriosInvalidos(false);
                  }}
                />
                {errorCorreo && <small id="error-correo-acceso" role="alert">{errorCorreo}</small>}
              </div>

              <div className="campo-acceso">
                <label htmlFor="clave-acceso">{formulario?.etiquetas?.clave}</label>
                <div
                  className={`campo-clave-acceso${claveInvalida ? " campo-acceso-invalido" : ""}`}
                  aria-invalid={claveInvalida}
                >
                  <input
                    id="clave-acceso"
                    type={mostrarClave ? "text" : "password"}
                    name="clave"
                    autoComplete="current-password"
                    value={clave}
                    aria-invalid={claveInvalida}
                    aria-describedby={errorClave ? "error-clave-acceso" : undefined}
                    onChange={(evento) => {
                      const valor = evento.target.value;
                      setClave(valor);
                      if (errorClave) setErrorClave("");
                      if (error) setError(null);
                      if (correo.trim() && valor) setCamposObligatoriosInvalidos(false);
                    }}
                  />
                  <button
                    type="button"
                    className="boton-mostrar-clave"
                    aria-label={mostrarClave ? formulario?.botones?.ocultarClave : formulario?.botones?.mostrarClave}
                    onClick={() => setMostrarClave((visible) => !visible)}
                  >
                    <img src={iconoOjo} alt="" aria-hidden="true" />
                  </button>
                </div>
                {errorClave && <small id="error-clave-acceso" role="alert">{errorClave}</small>}
              </div>

              <div className="acciones-secundarias-acceso">
                <label className="mantener-sesion-acceso">
                  <input
                    type="checkbox"
                    checked={mantenerSesion}
                    onChange={(evento) => setMantenerSesion(evento.target.checked)}
                  />
                  <span>{formulario?.etiquetas?.mantenerSesion}</span>
                </label>
                <a className="enlace-recuperar-clave" href="/recuperar-clave">{formulario?.enlaces?.olvidasteClave}</a>
              </div>

              <button className="boton-enviar-acceso" type="submit" disabled={esperando}>
                {enviando && <span className="spinner-acceso" aria-hidden="true" />}
                <span aria-live="polite">
                  {enviando
                    ? formulario?.mensajes?.ingresando
                    : error?.codigo === "conexion"
                      ? errores?.conexion?.botones?.reintentar
                      : formulario?.botones?.ingresar}
                </span>
              </button>
              {reintentarEn > 0 && (
                <span className="solo-lectores" aria-live="polite">
                  {errores?.demasiadosIntentos?.texto?.replaceAll("{segundos}", reintentarEn)}
                </span>
              )}
            </form>

            <p className="enlace-crear-cuenta-acceso">
              <span>{formulario?.mensajes?.sinCuenta}</span>{" "}
              <a href="/crear-cuenta">{formulario?.enlaces?.crearCuenta}</a>
            </p>
          </div>
        )}
      </section>
    </main>
  );
}

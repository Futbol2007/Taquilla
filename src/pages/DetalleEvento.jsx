import { useEffect, useMemo, useState } from "react";
import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import MigasPan from "../components/MigasPan/MigasPan.jsx";
import AficheEvento from "../components/AficheEvento/AficheEvento.jsx";
import TarjetaEvento from "../components/TarjetaEvento/TarjetaEvento.jsx";
import DialogoDetalle from "../components/DialogoDetalle/DialogoDetalle.jsx";
import EstadoCargaVista from "../components/EstadoCargaVista/EstadoCargaVista.jsx";
import iconoFecha from "../assets/calendar.svg";
import iconoHora from "../assets/clock.svg";
import iconoLugar from "../assets/pin.svg";
import iconoVolver from "../assets/arrowl.svg";
import iconoCompartir from "../assets/share.svg";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useDetalle } from "../hooks/useDetalle.js";
import { useEventos } from "../hooks/useEventos.js";
import { useTextos } from "../hooks/useTextos.js";
import { consultar } from "../services/api.js";
import "./DetalleEvento.css";

function nombreEntidad(valor) {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor))
    return valor.map(nombreEntidad).filter(Boolean).join(", ");
  if (valor && typeof valor === "object") {
    return valor.nombre;
  }
  return "";
}

function fechaEvento(valor, idioma) {
  if (!valor) return "";
  const fecha = /^\d{4}-\d{2}-\d{2}$/.test(valor)
    ? new Date(`${valor}T00:00:00`)
    : new Date(valor);
  if (Number.isNaN(fecha.getTime())) return String(valor);
  return new Intl.DateTimeFormat(idioma === "en" ? "en-US" : "es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(fecha);
}

function formatearHora(valor, idioma) {
  if (valor === null || valor === undefined || valor === "") return "";
  const texto = String(valor).trim();
  const horaSimple = texto.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const fecha = horaSimple
    ? new Date(2000, 0, 1, Number(horaSimple[1]), Number(horaSimple[2]))
    : new Date(texto);
  if (Number.isNaN(fecha.getTime())) return texto;
  return new Intl.DateTimeFormat(idioma === "en" ? "en-US" : "es-CO", {
    hour: "numeric",
    minute: "2-digit",
  }).format(fecha);
}

function horaEvento(evento, idioma) {
  return formatearHora(evento.fecha, idioma);
}

export default function DetalleEvento({ slug }) {
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("descripcion");
  const [eventoApi, setEventoApi] = useState(null);
  const [cargandoDetalleApi, setCargandoDetalleApi] = useState(true);
  const [intentoDetalle, setIntentoDetalle] = useState(0);
  const [errorDetalleApi, setErrorDetalleApi] = useState(null);
  const [avisoCompartir, setAvisoCompartir] = useState(null);
  const { idioma } = usePreferencias();
  const { textos } = useTextos(idioma);
  const { abrirCuenta } = useDetalle(textos, idioma);
  const { eventos, error, reintentar: reintentarEventos } = useEventos("es", 0);
  const eventoLista = eventos.find(
    (item) => item.slug === slug || String(item.id) === slug,
  );
  useEffect(() => {
    const controlador = new AbortController();
    setEventoApi(null);
    setErrorDetalleApi(null);
    setCargandoDetalleApi(true);

    consultar(`/eventos/${encodeURIComponent(slug)}`, {
      signal: controlador.signal,
    })
      .then((respuesta) => setEventoApi(respuesta))
      .catch((fallo) => {
        if (!controlador.signal.aborted) setErrorDetalleApi(fallo);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargandoDetalleApi(false);
      });

    return () => controlador.abort();
  }, [slug, intentoDetalle]);

  const evento = useMemo(() => {
    const datos = eventoApi ? { ...eventoLista, ...eventoApi } : eventoLista;
    return datos ? { ...datos, nombre: datos.titulo ?? datos.nombre } : null;
  }, [eventoApi, eventoLista]);
  const cargandoVista = cargandoDetalleApi;
  const paginas = textos?.paginas;
  const detalle = paginas?.detalleEvento;
  const info = detalle?.info;
  const pestanas = detalle?.pestanas;
  const migas = textos?.componentes?.migas;

  useEffect(() => {
    if (!evento) return;
    const tituloSeo = detalle?.seo?.titulo;
    const descripcionSeo = detalle?.seo?.descripcion;
    if (tituloSeo)
      document.title = tituloSeo.replaceAll("{titulo}", evento.nombre);
    if (descripcionSeo) {
      let metaDescripcion = document.querySelector('meta[name="description"]');
      if (!metaDescripcion) {
        metaDescripcion = document.createElement("meta");
        metaDescripcion.name = "description";
        document.head.append(metaDescripcion);
      }
      metaDescripcion.content = descripcionSeo;
    }
  }, [evento, detalle?.seo?.titulo, detalle?.seo?.descripcion]);

  const recomendaciones = useMemo(() => {
    if (!evento) return [];
    const categoriaActual = String(evento.categoria ?? "").toLocaleLowerCase();
    if (!categoriaActual) return [];
    return eventos
      .filter(
        (item) =>
          item.slug !== evento.slug &&
          String(item.categoria ?? "").toLocaleLowerCase() === categoriaActual,
      )
      .slice(0, 4);
  }, [eventos, evento]);

  const categoria = nombreEntidad(evento?.categoria) || evento?.etiqueta;
  const artista = nombreEntidad(
    evento?.artista ?? evento?.artistas ?? evento?.organizador,
  );
  const fecha = fechaEvento(evento?.fecha, idioma);
  const hora = horaEvento(evento ?? {}, idioma);
  const puertas = evento?.puertas;
  const puertasFormateadas = formatearHora(puertas, idioma);
  const horaValor =
    hora && puertas
      ? info?.horaValor
          ?.replaceAll("{hora}", hora)
          .replaceAll("{puertas}", puertasFormateadas)
      : hora;
  const lugar = evento?.recinto ?? {};
  const direccion = lugar?.direccion;
  const ciudad = lugar?.ciudad;
  const lugarNombre = lugar?.nombre;
  const parqueadero = lugar?.parqueadero;
  const plantillaEdad = detalle?.etiquetas?.edadMinima;
  const edadMinima = evento?.edadMinima;
  const tieneEdadMinima =
    edadMinima !== null &&
    edadMinima !== undefined &&
    String(edadMinima).trim() !== "";
  const edadNumerica = Number(edadMinima);
  const clasificacion =
    evento?.clasificacionEdad ??
    (tieneEdadMinima && edadNumerica > 0
      ? plantillaEdad?.replaceAll("{edad}", edadMinima)
      : detalle?.etiquetas?.todoPublico);
  const descripcion = evento?.descripcion ?? "";
  const palabrasDescripcion = descripcion.trim().split(/\s+/).filter(Boolean);
  const descripcionParcial = palabrasDescripcion.slice(0, 22).join(" ");
  const descripcionRestante = palabrasDescripcion.slice(22).join(" ");
  const duracionMin = Number(evento?.duracionMin);
  const duracion =
    Number.isFinite(duracionMin) && duracionMin > 0
      ? new Intl.NumberFormat(idioma === "en" ? "en-US" : "es-CO", {
          style: "unit",
          unit: "minute",
          unitDisplay: "long",
        }).format(duracionMin)
      : "";
  const politicas = [clasificacion, duracion].filter(Boolean);
  const hayUbicacion = Boolean(lugarNombre || direccion || ciudad);
  const direccionMaps = [lugarNombre, direccion, ciudad]
    .filter(Boolean)
    .join(", ");
  const enlaceMapa = direccionMaps
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionMaps)}`
    : undefined;
  const textoMapa = detalle?.mapa?.titulo;
  const tituloRelacionados = detalle?.relacionados?.titulo;

  function renderUbicacion(id, clase = "") {
    return (
      <section
        className={`detalle-evento-seccion detalle-evento-ubicacion ${clase}`.trim()}
        id={id}
      >
        <h2>{pestanas.comoLlegar}</h2>
        <a
          className="detalle-evento-mapa"
          href={enlaceMapa}
          target="_blank"
          rel="noreferrer"
          aria-label={`${textoMapa}: ${direccionMaps}`}
        >
          <img src={iconoLugar} alt="" aria-hidden="true" />
          <span>{textoMapa}</span>
        </a>
        {(lugarNombre || direccion || ciudad || parqueadero) && (
          <p className="detalle-evento-direccion">
            {[lugarNombre, direccion, ciudad, parqueadero]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
      </section>
    );
  }

  function volverAExplorar() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/explorar";
  }

  function reintentarCarga() {
    setEventoApi(null);
    setErrorDetalleApi(null);
    setCargandoDetalleApi(true);
    setIntentoDetalle((actual) => actual + 1);
    reintentarEventos();
  }

  function compartirEvento() {
    const en = idioma === "en";
    setAvisoCompartir({
      titulo: evento?.nombre,
      descripcion: en
        ? "Sharing is not available right now. You can keep exploring the catalog."
        : "Compartir no está disponible por ahora. Puedes seguir explorando el catálogo.",
      cerrar: en ? "Continue exploring" : "Seguir explorando",
    });
  }

  return (
    <LayoutPublico
      textos={textos}
      onCuenta={abrirCuenta}
      buscadorDeshabilitado
      className="landing-detalle-evento"
    >
      <div className="detalle-evento ancho-home">
        {cargandoVista && (
          <EstadoCargaVista
            variante="detalle"
            texto={textos?.estados?.cargando?.indicador}
          />
        )}
        {(errorDetalleApi || (error && !eventoApi)) &&
          !cargandoVista &&
          (errorDetalleApi ?? error)?.codigo !== "no_encontrado" && (
            <section className="detalle-evento-error" role="alert">
              <h1>{textos?.estados?.error?.titulo}</h1>
              <p>
                {textos?.errores?.[(errorDetalleApi ?? error)?.codigo] ??
                  textos?.errores?.generico ??
                  textos?.estados?.error?.texto}
              </p>
              <button
                type="button"
                className="boton-home primario"
                onClick={reintentarCarga}
              >
                {textos?.estados?.error?.botones?.reintentar}
              </button>
            </section>
          )}
        {!cargandoVista && !evento &&
          (!errorDetalleApi || errorDetalleApi.codigo === "no_encontrado") && (
          <section className="detalle-evento-vacio" role="status">
            <h1>{detalle?.noEncontrado?.titulo}</h1>
            <p>{detalle?.noEncontrado?.texto}</p>
            <a href="/explorar">{detalle?.noEncontrado?.botones?.volver}</a>
          </section>
        )}
        {evento && (
          <>
            <MigasPan
              textos={migas}
              actual="eventos"
              anterior={{
                texto: migas?.explorar,
                href: "/explorar",
              }}
              etiquetaActual={evento.nombre}
              etiqueta={migas?.eventos}
            />
            <div className="detalle-evento-hero">
              <AficheEvento
                variante={evento.arte}
                className="detalle-evento-afiche"
              />
              <div className="detalle-evento-acciones-hero">
                <button
                  type="button"
                  onClick={volverAExplorar}
                  aria-label={detalle?.noEncontrado?.botones?.volver}
                >
                  <img src={iconoVolver} alt="" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label={detalle?.botones?.compartir ?? evento.nombre}
                  onClick={compartirEvento}
                >
                  <img src={iconoCompartir} alt="" aria-hidden="true" />
                </button>
              </div>
            </div>

            <header className="detalle-evento-cabecera">
              <div className="detalle-evento-etiquetas">
                {categoria && (
                  <span className="etiqueta-evento">{categoria}</span>
                )}
                {clasificacion && (
                  <span className="etiqueta-evento detalle-evento-edad">
                    {clasificacion}
                  </span>
                )}
              </div>
              <h1>{evento.nombre}</h1>
              {artista && <p className="detalle-evento-artista">{artista}</p>}
              <div className="detalle-evento-metadatos">
                {fecha && (
                  <div className="detalle-evento-dato detalle-evento-dato--fecha">
                    <span className="detalle-evento-icono">
                      <img src={iconoFecha} alt="" aria-hidden="true" />
                    </span>
                    <span>
                      <small>{info.fecha}</small>
                      <strong>{fecha}</strong>
                      {horaValor && (
                        <span className="detalle-evento-hora-movil">
                          {horaValor}
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {(hora || puertas) && (
                  <div className="detalle-evento-dato detalle-evento-dato--hora">
                    <span className="detalle-evento-icono">
                      <img src={iconoHora} alt="" aria-hidden="true" />
                    </span>
                    <span>
                      <small>{info.hora}</small>
                      <strong>{horaValor}</strong>
                    </span>
                  </div>
                )}
                {(lugarNombre || ciudad) && (
                  <div className="detalle-evento-dato detalle-evento-dato--lugar">
                    <span className="detalle-evento-icono">
                      <img src={iconoLugar} alt="" aria-hidden="true" />
                    </span>
                    <span>
                      <small>{info.lugar}</small>
                      <strong className="detalle-evento-lugar-escritorio">
                        {[lugarNombre, ciudad].filter(Boolean).join(", ")}
                      </strong>
                      <strong className="detalle-evento-lugar-movil">
                        {lugarNombre}
                      </strong>
                      {(direccion || ciudad) && (
                        <span className="detalle-evento-direccion-movil">
                          {[direccion, ciudad].filter(Boolean).join(", ")}
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <nav className="detalle-evento-tabs" role="tablist">
              <button
                id="pestana-descripcion-evento"
                type="button"
                role="tab"
                aria-selected={seccionActiva === "descripcion"}
                aria-controls="descripcion-evento"
                onClick={() => setSeccionActiva("descripcion")}
              >
                {pestanas.descripcion}
              </button>
              <button
                id="pestana-ubicacion-evento"
                type="button"
                role="tab"
                aria-selected={seccionActiva === "ubicacion"}
                aria-controls="ubicacion-evento"
                onClick={() => setSeccionActiva("ubicacion")}
              >
                {pestanas.comoLlegar}
              </button>
              <button
                id="pestana-politicas-evento"
                type="button"
                role="tab"
                aria-selected={seccionActiva === "politicas"}
                aria-controls="politicas-evento"
                onClick={() => setSeccionActiva("politicas")}
              >
                {pestanas.politicas}
              </button>
            </nav>

            {seccionActiva === "descripcion" && (
              <section
                className="detalle-evento-seccion"
                id="descripcion-evento"
                role="tabpanel"
                aria-labelledby="pestana-descripcion-evento"
              >
                <h2>{detalle?.descripcion?.titulo}</h2>
                {descripcion && (
                  <p className="detalle-evento-descripcion">
                    <span className="detalle-evento-descripcion-completa">
                      {descripcion}
                    </span>
                    <span className="detalle-evento-descripcion-parcial">
                      {descripcionParcial}
                      {descripcionRestante && !descripcionExpandida ? "…" : ""}
                    </span>
                    {descripcionExpandida && descripcionRestante && (
                      <span className="detalle-evento-descripcion-restante">
                        {" "}
                        {descripcionRestante}
                      </span>
                    )}
                  </p>
                )}
                {evento.descripcionAdicional && (
                  <p>{evento.descripcionAdicional}</p>
                )}
                {descripcionRestante &&
                  detalle?.descripcion?.botones?.leerMas &&
                  !descripcionExpandida && (
                    <button
                      className="detalle-evento-leer-mas"
                      type="button"
                      onClick={() => setDescripcionExpandida(true)}
                    >
                      {detalle.descripcion.botones.leerMas}
                    </button>
                  )}
              </section>
            )}

            {seccionActiva === "descripcion" &&
              hayUbicacion &&
              renderUbicacion(
                undefined,
                "detalle-evento-ubicacion--descripcion",
              )}

            {hayUbicacion && seccionActiva === "ubicacion" && (
              <div role="tabpanel" aria-labelledby="pestana-ubicacion-evento">
                {renderUbicacion("ubicacion-evento")}
              </div>
            )}

            {seccionActiva === "politicas" && (
              <section
                className="detalle-evento-seccion"
                id="politicas-evento"
                role="tabpanel"
                aria-labelledby="pestana-politicas-evento"
              >
                <h2>{pestanas.politicas}</h2>
                {Array.isArray(politicas) && politicas.length > 0 ? (
                  <ul>
                    {politicas.map((politica, indice) => (
                      <li key={`${indice}-${politica}`}>{politica}</li>
                    ))}
                  </ul>
                ) : typeof politicas === "string" && politicas ? (
                  <p>{politicas}</p>
                ) : null}
              </section>
            )}

            {seccionActiva === "descripcion" &&
              tituloRelacionados &&
              recomendaciones.length > 0 && (
                <section
                  className="detalle-evento-recomendaciones"
                  aria-labelledby="titulo-recomendaciones"
                >
                  <h2 id="titulo-recomendaciones">{tituloRelacionados}</h2>
                  <div className="detalle-evento-recomendaciones-grid">
                    {recomendaciones.map((recomendado) => (
                      <TarjetaEvento
                        key={recomendado.slug ?? recomendado.id}
                        textos={paginas}
                        evento={recomendado}
                        onAbrir={() => {
                          window.location.href = `/eventos/${encodeURIComponent(recomendado.slug ?? recomendado.id)}`;
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}
          </>
        )}
      </div>
      <DialogoDetalle
        detalle={avisoCompartir}
        onCerrar={() => setAvisoCompartir(null)}
      />
    </LayoutPublico>
  );
}

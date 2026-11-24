import { useEffect, useMemo, useState } from "react";
import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import MigasPan from "../components/MigasPan/MigasPan.jsx";
import AficheEvento from "../components/AficheEvento/AficheEvento.jsx";
import TarjetaEvento from "../components/TarjetaEvento/TarjetaEvento.jsx";
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

function primerTexto(...valores) {
  return valores.find((valor) => typeof valor === "string" && valor.trim()) ?? "";
}

function nombreEntidad(valor) {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor)) return valor.map(nombreEntidad).filter(Boolean).join(", ");
  if (valor && typeof valor === "object") {
    return primerTexto(valor.nombre, valor.nombreArtistico, valor.titulo);
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
  const horaExplicita = primerTexto(
    evento.hora,
    evento.horaInicio,
    evento.horaEvento,
    evento.horario?.hora,
    evento.funciones?.[0]?.hora,
  );
  if (horaExplicita) return formatearHora(horaExplicita, idioma);
  if (!evento.fecha || !String(evento.fecha).includes("T")) return "";
  return formatearHora(evento.fecha, idioma);
}

function extraerEvento(respuesta) {
  let datos = respuesta?.datos ?? respuesta?.evento ?? respuesta;
  if (Array.isArray(datos)) datos = datos[0];
  return datos?.evento ?? datos ?? null;
}

function textoCampo(valor) {
  if (typeof valor === "string") return valor.trim();
  if (Array.isArray(valor)) return valor.map(textoCampo).filter(Boolean).join(", ");
  if (valor && typeof valor === "object") {
    return primerTexto(valor.texto, valor.descripcion, valor.nombre, valor.detalle);
  }
  return "";
}

export default function DetalleEvento({ slug }) {
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState("descripcion");
  const [eventoApi, setEventoApi] = useState(null);
  const [cargandoDetalleApi, setCargandoDetalleApi] = useState(true);
  const [errorDetalleApi, setErrorDetalleApi] = useState(null);
  const { idioma } = usePreferencias();
  const { textos } = useTextos(idioma);
  const { abrirCuenta } = useDetalle(textos, idioma);
  const { eventos, error } = useEventos("es", 0);
  const eventoLista = eventos.find(
    (item) => item.slug === slug || String(item.id) === slug,
  );
  useEffect(() => {
    const controlador = new AbortController();
    setEventoApi(null);
    setErrorDetalleApi(null);
    setCargandoDetalleApi(true);

    consultar(`/eventos/${encodeURIComponent(slug)}`, { signal: controlador.signal })
      .then((respuesta) => setEventoApi(extraerEvento(respuesta)))
      .catch((fallo) => {
        if (!controlador.signal.aborted) setErrorDetalleApi(fallo);
      })
      .finally(() => {
        if (!controlador.signal.aborted) setCargandoDetalleApi(false);
      });

    return () => controlador.abort();
  }, [slug]);

  const eventoDatos = eventoApi
    ? { ...eventoLista, ...eventoApi }
    : eventoLista;
  const evento = eventoDatos
    ? {
        ...eventoDatos,
        nombre: primerTexto(eventoDatos.titulo, eventoDatos.nombre, eventoDatos.slug),
      }
    : null;
  const cargandoVista = cargandoDetalleApi && !eventoLista;
  const paginas = textos?.paginas;
  const detalle = paginas?.detalleEvento;
  const info = detalle?.info;
  const pestanas = detalle?.pestanas;
  const migas = textos?.componentes?.migas;

  useEffect(() => {
    if (!evento) return;
    const tituloSeo = primerTexto(detalle?.seo?.titulo);
    const descripcionSeo = primerTexto(detalle?.seo?.descripcion);
    if (tituloSeo) document.title = tituloSeo.replaceAll("{titulo}", evento.nombre);
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
  const puertas = primerTexto(
    evento?.horaPuertas,
    evento?.aperturaPuertas,
    evento?.puertas,
    evento?.horario?.puertas,
    evento?.horario?.horaPuertas,
    evento?.funciones?.[0]?.horaPuertas,
  );
  const puertasFormateadas = formatearHora(puertas, idioma);
  const horaValor = hora && puertas
    ? info?.horaValor?.replaceAll("{hora}", hora).replaceAll("{puertas}", puertasFormateadas)
    : hora;
  const lugar = evento?.recinto ?? {};
  const direccion = primerTexto(
    lugar?.direccion,
    lugar?.direccionCompleta,
    evento?.direccion,
  );
  const ciudad = primerTexto(lugar?.ciudad, evento?.ciudad);
  const lugarNombre = primerTexto(lugar?.nombre, evento?.lugar);
  const parqueadero = textoCampo(
    evento?.parqueadero ?? lugar?.parqueadero ?? evento?.ubicacion?.parqueadero,
  );
  const plantillaEdad = primerTexto(detalle?.etiquetas?.edadMinima);
  const edadMinima = evento?.edadMinima;
  const tieneEdadMinima = edadMinima !== null && edadMinima !== undefined && String(edadMinima).trim() !== "";
  const edadNumerica = Number(edadMinima);
  const clasificacion = primerTexto(
    evento?.clasificacionEdad,
    tieneEdadMinima && edadNumerica > 0 && plantillaEdad
      ? plantillaEdad.replaceAll("{edad}", edadMinima)
      : "",
    (!tieneEdadMinima || edadNumerica === 0) ? detalle?.etiquetas?.todoPublico : "",
  );
  const descripcion = primerTexto(
    evento?.descripcion,
    evento?.descripcionLarga,
    evento?.sinopsis,
  );
  const palabrasDescripcion = descripcion.trim().split(/\s+/).filter(Boolean);
  const descripcionParcial = palabrasDescripcion.slice(0, 22).join(" ");
  const descripcionRestante = palabrasDescripcion.slice(22).join(" ");
  const duracionMin = Number(evento?.duracionMin);
  const duracion = Number.isFinite(duracionMin) && duracionMin > 0
    ? new Intl.NumberFormat(idioma === "en" ? "en-US" : "es-CO", {
        style: "unit",
        unit: "minute",
        unitDisplay: "long",
      }).format(duracionMin)
    : "";
  const politicas = [clasificacion, duracion].filter(Boolean);
  const mapa = evento?.mapa ?? lugar?.mapa ?? evento?.ubicacion?.mapa;
  const mapaUrl = primerTexto(
    typeof mapa === "string" && /^https?:\/\//i.test(mapa) ? mapa : "",
    evento?.mapaUrl,
    lugar?.mapaUrl,
    mapa?.url,
    mapa?.enlace,
    mapa?.href,
  );
  const latitud = mapa?.latitud ?? mapa?.latitude ?? mapa?.lat ?? lugar?.latitud ?? lugar?.lat;
  const longitud = mapa?.longitud ?? mapa?.longitude ?? mapa?.lng ?? lugar?.longitud ?? lugar?.lng;
  const hayCoordenadas = latitud !== undefined && latitud !== null && longitud !== undefined && longitud !== null;
  const hayUbicacion = Boolean(lugarNombre || direccion || ciudad || mapaUrl || hayCoordenadas);
  const direccionMaps = [lugarNombre, direccion, ciudad].filter(Boolean).join(", ");
  const enlaceMapa = mapaUrl || (hayCoordenadas
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${latitud},${longitud}`)}`
    : direccionMaps
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionMaps)}`
      : undefined);
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
            {[lugarNombre, direccion, ciudad, parqueadero].filter(Boolean).join(" · ")}
          </p>
        )}
      </section>
    );
  }

  async function compartirEvento() {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: evento.nombre, url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(url).catch(() => {});
  }

  function volverAExplorar() {
    if (window.history.length > 1) window.history.back();
    else window.location.href = "/explorar";
  }

  function manejarTecladoPestanas(eventoTeclado) {
    const teclas = ["ArrowLeft", "ArrowRight", "Home", "End"];
    if (!teclas.includes(eventoTeclado.key)) return;

    const pestanasDisponibles = Array.from(
      eventoTeclado.currentTarget.querySelectorAll('[role="tab"]'),
    );
    const indiceActual = pestanasDisponibles.indexOf(document.activeElement);
    if (indiceActual < 0) return;

    eventoTeclado.preventDefault();
    const indiceSiguiente = eventoTeclado.key === "Home"
      ? 0
      : eventoTeclado.key === "End"
        ? pestanasDisponibles.length - 1
        : (indiceActual + (eventoTeclado.key === "ArrowRight" ? 1 : -1) + pestanasDisponibles.length) % pestanasDisponibles.length;
    const pestanaSiguiente = pestanasDisponibles[indiceSiguiente];
    pestanaSiguiente.focus();
    pestanaSiguiente.click();
  }

  return (
    <LayoutPublico textos={textos} onCuenta={abrirCuenta} className="landing-detalle-evento">
      <div className="detalle-evento ancho-home">
        {cargandoVista && (
          <EstadoCargaVista
            variante="detalle"
            texto={textos?.estados?.cargando?.titulo}
          />
        )}
        {(error || errorDetalleApi) && !cargandoVista && !evento && textos?.estados?.error?.texto && (
          <p role="alert">{textos.estados.error.texto}</p>
        )}
        {!cargandoVista && !evento && (
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
              <AficheEvento variante={evento.arte} className="detalle-evento-afiche" />
              <div className="detalle-evento-acciones-hero">
                <button type="button" onClick={volverAExplorar} aria-label={detalle?.noEncontrado?.botones?.volver}>
                  <img src={iconoVolver} alt="" aria-hidden="true" />
                </button>
                <button type="button" onClick={compartirEvento} aria-label={evento.nombre}>
                  <img src={iconoCompartir} alt="" aria-hidden="true" />
                </button>
              </div>
            </div>

            <header className="detalle-evento-cabecera">
              <div className="detalle-evento-etiquetas">
                {categoria && <span className="etiqueta-evento">{categoria}</span>}
                {clasificacion && <span className="etiqueta-evento detalle-evento-edad">{clasificacion}</span>}
              </div>
              <h1>{evento.nombre}</h1>
              {artista && <p className="detalle-evento-artista">{artista}</p>}
              <div className="detalle-evento-metadatos">
                {fecha && (
                  <div className="detalle-evento-dato detalle-evento-dato--fecha">
                    <span className="detalle-evento-icono"><img src={iconoFecha} alt="" aria-hidden="true" /></span>
                    <span>
                      <small>{info.fecha}</small>
                      <strong>{fecha}</strong>
                      {horaValor && <span className="detalle-evento-hora-movil">{horaValor}</span>}
                    </span>
                  </div>
                )}
                {(hora || puertas) && (
                  <div className="detalle-evento-dato detalle-evento-dato--hora">
                    <span className="detalle-evento-icono"><img src={iconoHora} alt="" aria-hidden="true" /></span>
                    <span><small>{info.hora}</small><strong>{horaValor}</strong></span>
                  </div>
                )}
                {(lugarNombre || ciudad) && (
                  <div className="detalle-evento-dato detalle-evento-dato--lugar">
                    <span className="detalle-evento-icono"><img src={iconoLugar} alt="" aria-hidden="true" /></span>
                    <span>
                      <small>{info.lugar}</small>
                      <strong className="detalle-evento-lugar-escritorio">{[lugarNombre, ciudad].filter(Boolean).join(", ")}</strong>
                      <strong className="detalle-evento-lugar-movil">{lugarNombre}</strong>
                      {(direccion || ciudad) && <span className="detalle-evento-direccion-movil">{[direccion, ciudad].filter(Boolean).join(", ")}</span>}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <nav className="detalle-evento-tabs" role="tablist" onKeyDown={manejarTecladoPestanas}>
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

            {seccionActiva === "descripcion" && <section className="detalle-evento-seccion" id="descripcion-evento" role="tabpanel" aria-labelledby="pestana-descripcion-evento">
              <h2>{detalle?.descripcion?.titulo}</h2>
              {descripcion && (
                <p className="detalle-evento-descripcion">
                  <span className="detalle-evento-descripcion-completa">{descripcion}</span>
                  <span className="detalle-evento-descripcion-parcial">
                    {descripcionParcial}{descripcionRestante && !descripcionExpandida ? "…" : ""}
                  </span>
                  {descripcionExpandida && descripcionRestante && (
                    <span className="detalle-evento-descripcion-restante"> {descripcionRestante}</span>
                  )}
                </p>
              )}
              {evento.descripcionAdicional && <p>{evento.descripcionAdicional}</p>}
              {descripcionRestante && detalle?.descripcion?.botones?.leerMas && !descripcionExpandida && (
                <button className="detalle-evento-leer-mas" type="button" onClick={() => setDescripcionExpandida(true)}>
                  {detalle.descripcion.botones.leerMas}
                </button>
              )}
            </section>}

            {seccionActiva === "descripcion" && hayUbicacion && renderUbicacion(undefined, "detalle-evento-ubicacion--descripcion")}

            {hayUbicacion && seccionActiva === "ubicacion" && (
              <div role="tabpanel" aria-labelledby="pestana-ubicacion-evento">
                {renderUbicacion("ubicacion-evento")}
              </div>
            )}

            {seccionActiva === "politicas" && (
              <section className="detalle-evento-seccion" id="politicas-evento" role="tabpanel" aria-labelledby="pestana-politicas-evento">
                <h2>{pestanas.politicas}</h2>
                {Array.isArray(politicas) && politicas.length > 0 ? (
                  <ul>{politicas.map((politica, indice) => <li key={`${indice}-${politica}`}>{politica}</li>)}</ul>
                ) : typeof politicas === "string" && politicas ? <p>{politicas}</p> : null}
              </section>
            )}

            {seccionActiva === "descripcion" && tituloRelacionados && recomendaciones.length > 0 && (
              <section className="detalle-evento-recomendaciones" aria-labelledby="titulo-recomendaciones">
                <h2 id="titulo-recomendaciones">{tituloRelacionados}</h2>
                <div className="detalle-evento-recomendaciones-grid">
                  {recomendaciones.map((recomendado) => (
                    <TarjetaEvento
                      key={recomendado.slug ?? recomendado.id}
                      textos={paginas}
                      evento={recomendado}
                      onAbrir={() => { window.location.href = `/eventos/${encodeURIComponent(recomendado.slug ?? recomendado.id)}`; }}
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </LayoutPublico>
  );
}

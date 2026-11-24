import { useEffect, useMemo, useState } from "react";
import LayoutPublico from "../components/LayoutPublico/LayoutPublico.jsx";
import MigasPan from "../components/MigasPan/MigasPan.jsx";
import AficheEvento from "../components/AficheEvento/AficheEvento.jsx";
import TarjetaEvento from "../components/TarjetaEvento/TarjetaEvento.jsx";
import iconoFecha from "../assets/calendar.svg";
import iconoHora from "../assets/clock.svg";
import iconoLugar from "../assets/pin.svg";
import iconoVolver from "../assets/arrowl.svg";
import iconoCompartir from "../assets/share.svg";
import { usePreferencias } from "../context/PreferenciasContext.jsx";
import { useDetalle } from "../hooks/useDetalle.js";
import { useEventos } from "../hooks/useEventos.js";
import { useTextos } from "../hooks/useTextos.js";
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

function horaEvento(evento, idioma) {
  const horaExplicita = primerTexto(evento.hora, evento.horaInicio, evento.horaEvento);
  if (horaExplicita) return horaExplicita;
  if (!evento.fecha) return "";
  const fecha = new Date(evento.fecha);
  if (Number.isNaN(fecha.getTime()) || !String(evento.fecha).includes("T")) return "";
  return new Intl.DateTimeFormat(idioma === "en" ? "en-US" : "es-CO", {
    hour: "numeric",
    minute: "2-digit",
  }).format(fecha);
}

function textoLista(valor) {
  if (typeof valor === "string") return valor;
  if (Array.isArray(valor)) {
    return valor
      .map((item) => (typeof item === "string" ? item : item?.texto ?? item?.descripcion ?? ""))
      .filter(Boolean);
  }
  return "";
}

export default function DetalleEvento({ slug }) {
  const [descripcionExpandida, setDescripcionExpandida] = useState(false);
  const { idioma } = usePreferencias();
  const { textos } = useTextos(idioma);
  const { abrirCuenta } = useDetalle(textos, idioma);
  const { eventos, cargando, error } = useEventos(idioma, 0);
  const evento = eventos.find(
    (item) => item.slug === slug || String(item.id) === slug,
  );
  const paginas = textos?.paginas;
  const detalle = paginas?.detalleEvento ?? {};
  const info = detalle?.info ?? {};
  const pestanas = detalle?.pestanas ?? {};
  const migas = textos?.componentes?.migas;

  useEffect(() => {
    if (!evento) return;
    const tituloSeo = primerTexto(detalle?.seo?.titulo);
    if (tituloSeo) document.title = tituloSeo.replaceAll("{titulo}", evento.nombre);
  }, [evento, detalle?.seo?.titulo]);

  const recomendaciones = useMemo(() => {
    if (!evento) return [];
    const recintoActual = String(
      evento.recinto?.nombre ?? evento.lugar ?? "",
    ).toLocaleLowerCase();
    if (!recintoActual) return [];
    return eventos
      .filter(
        (item) =>
          item.slug !== evento.slug &&
          String(item.recinto?.nombre ?? item.lugar ?? "").toLocaleLowerCase() === recintoActual,
      )
      .slice(0, 4);
  }, [eventos, evento]);

  const categoria = nombreEntidad(evento?.categoria) || evento?.etiqueta;
  const artista = nombreEntidad(
    evento?.artista ?? evento?.artistas ?? evento?.organizador,
  );
  const fecha = fechaEvento(evento?.fecha, idioma);
  const hora = horaEvento(evento ?? {}, idioma);
  const puertas = primerTexto(evento?.horaPuertas, evento?.aperturaPuertas);
  const horaValor = hora && puertas
    ? info.horaValor?.replaceAll("{hora}", hora).replaceAll("{puertas}", puertas)
    : hora;
  const lugar = evento?.recinto ?? {};
  const direccion = primerTexto(
    lugar?.direccion,
    lugar?.direccionCompleta,
    evento?.direccion,
  );
  const ciudad = primerTexto(lugar?.ciudad, evento?.ciudad);
  const lugarNombre = primerTexto(lugar?.nombre, evento?.lugar);
  const plantillaEdad = primerTexto(detalle?.etiquetas?.edadMinima);
  const clasificacion = primerTexto(
    evento?.clasificacionEdad,
    evento?.edadMinima && plantillaEdad
      ? plantillaEdad.replaceAll("{edad}", evento.edadMinima)
      : "",
    !evento?.edadMinima ? detalle?.etiquetas?.todoPublico : "",
  );
  const descripcion = primerTexto(
    evento?.descripcionLarga,
    evento?.descripcion,
    evento?.sinopsis,
  );
  const politicas = textoLista(
    evento?.politicas ?? evento?.politicasIngreso ?? evento?.condicionesIngreso,
  );
  const direccionMaps = [lugarNombre, direccion, ciudad].filter(Boolean).join(", ");
  const textoMapa = detalle?.mapa?.titulo;
  const tituloRecinto = lugarNombre
    ? detalle?.mismoRecinto?.titulo?.replaceAll("{recinto}", lugarNombre)
    : "";

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

  return (
    <LayoutPublico textos={textos} onCuenta={abrirCuenta} className="landing-detalle-evento">
      <div className="detalle-evento ancho-home">
        {cargando && <p role="status">{textos?.estados?.cargando?.titulo}</p>}
        {error && !cargando && textos?.estados?.error?.texto && (
          <p role="alert">{textos.estados.error.texto}</p>
        )}
        {!cargando && !error && !evento && (
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
                      <strong>{lugarNombre}</strong>
                      {(direccion || ciudad) && <span className="detalle-evento-direccion-movil">{[direccion, ciudad].filter(Boolean).join(", ")}</span>}
                    </span>
                  </div>
                )}
              </div>
            </header>

            <nav className="detalle-evento-tabs">
              <a href="#descripcion-evento">{pestanas.descripcion}</a>
              <a href="#ubicacion-evento">{pestanas.comoLlegar}</a>
              <a href="#politicas-evento">{pestanas.politicas}</a>
            </nav>

            <section className="detalle-evento-seccion" id="descripcion-evento">
              <h2>{detalle?.descripcion?.titulo}</h2>
              {descripcion && <p className={descripcionExpandida ? "detalle-evento-descripcion expandida" : "detalle-evento-descripcion"}>{descripcion}</p>}
              {evento.descripcionAdicional && <p>{evento.descripcionAdicional}</p>}
              {descripcion && detalle?.descripcion?.botones?.leerMas && !descripcionExpandida && (
                <button className="detalle-evento-leer-mas" type="button" onClick={() => setDescripcionExpandida(true)}>
                  {detalle.descripcion.botones.leerMas}
                </button>
              )}
            </section>

            <section className="detalle-evento-seccion detalle-evento-ubicacion" id="ubicacion-evento">
              <h2>{pestanas.comoLlegar}</h2>
              <a
                className="detalle-evento-mapa"
                href={direccionMaps ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(direccionMaps)}` : undefined}
                target="_blank"
                rel="noreferrer"
                aria-label={direccionMaps ? `${textoMapa}: ${direccionMaps}` : textoMapa}
              >
                <img src={iconoLugar} alt="" aria-hidden="true" />
                <span>{textoMapa}</span>
              </a>
              {(lugarNombre || direccion || ciudad) && (
                <p className="detalle-evento-direccion">
                  {[lugarNombre, direccion, ciudad].filter(Boolean).join(" · ")}
                </p>
              )}
            </section>

            <section className="detalle-evento-seccion" id="politicas-evento">
              <h2>{pestanas.politicas}</h2>
              {Array.isArray(politicas) ? (
                <ul>{politicas.map((politica, indice) => <li key={`${indice}-${politica}`}>{politica}</li>)}</ul>
              ) : (
                politicas && <p>{politicas}</p>
              )}
            </section>

            {tituloRecinto && (
              <section className="detalle-evento-recomendaciones" aria-labelledby="titulo-recomendaciones">
                <h2 id="titulo-recomendaciones">{tituloRecinto}</h2>
                {recomendaciones.length > 0 ? <div className="detalle-evento-recomendaciones-grid">
                  {recomendaciones.map((recomendado) => (
                    <TarjetaEvento
                      key={recomendado.slug ?? recomendado.id}
                      textos={paginas}
                      evento={recomendado}
                      onAbrir={() => { window.location.href = `/eventos/${encodeURIComponent(recomendado.slug ?? recomendado.id)}`; }}
                    />
                  ))}
                </div> : <p>{detalle?.mismoRecinto?.vacio}</p>}
              </section>
            )}
          </>
        )}
      </div>
    </LayoutPublico>
  );
}
